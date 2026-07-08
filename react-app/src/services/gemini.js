import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';
import { SYSTEM_PROMPT } from './systemPrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.replace(/"/g, '');
// gemini-2.0-flash is the current stable model on v1beta
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
];
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Core Gemini call using the proper systemInstruction field.
 * The systemInstruction separates the persona/rules from the user query,
 * which gives far better adherence to the JSON schema.
 */
async function callGemini(userMessage, systemInstruction = null) {
  const { allowed, retryAfterMs } = checkRateLimit(RATE_LIMITS.GEMINI.key, RATE_LIMITS.GEMINI.max, RATE_LIMITS.GEMINI.windowMs);
  if (!allowed) {
    throw new Error(`Rate limited. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
  }

  if (!API_KEY || API_KEY.length < 20 || !API_KEY.startsWith('AIza')) {
    throw new Error('Gemini API key is missing or invalid. Please check VITE_GEMINI_API_KEY in react-app/.env (it should start with AIza) and restart the dev server.');
  }

  const body = {
    contents: [
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 8192,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  // Try each model in order until one works
  let lastError = null;
  for (const model of MODELS) {
    const url = `${BASE_URL}/${model}:generateContent?key=${API_KEY}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 429) throw new Error('Gemini is busy (rate limited). Please wait 60 seconds and try again.');
      
      if (res.status === 404) {
        // Model not available, try next
        lastError = new Error(`Model ${model} not available on your account`);
        continue;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || 'Unknown error';
        // If it's a model-not-found error, try next model
        if (res.status === 400 && msg.includes('not found')) {
          lastError = new Error(msg);
          continue;
        }
        throw new Error(`Gemini API error ${res.status}: ${msg}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) throw new Error('Gemini returned an empty response. Try again.');
      return text;
    } catch (err) {
      // Only retry on model-not-found errors, propagate everything else
      if (err.message.includes('not available') || err.message.includes('not found')) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No Gemini model is available on your account. Visit https://aistudio.google.com to check your API key.');
}

/**
 * Robustly parse JSON from Gemini output.
 * Handles: raw JSON, ```json blocks, partial prose before/after.
 */
function extractJSON(text) {
  // Strip markdown code fences
  let cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Sometimes Gemini prepends a sentence — find the first { or [
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON object found in Gemini response.');
  }
  const start = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
  cleaned = cleaned.slice(start);

  // Also trim any trailing prose after the last } or ]
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  if (end !== -1) {
    cleaned = cleaned.slice(0, end + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Main itinerary generator.
 * Sends the full system prompt as systemInstruction + a clean user query.
 */
export async function generateTripPlan({ locations, fromDate, toDate, mode, budget, fromCity = 'Delhi', travellerCount = 2, selectedHotel = null }) {
  let userMessage = `Generate a complete travel itinerary with the following inputs:

- destinations: ${locations.join(', ')}
- from_date: ${fromDate}
- to_date: ${toDate}
- travel_mode: ${mode}
- budget_tier: ${budget}
- from_city: ${fromCity}
- traveller_count: ${travellerCount}`;

  if (selectedHotel) {
    userMessage += `\n- selected_hotel: "${selectedHotel.name}" (Rating: ${selectedHotel.rating} Stars, Price: ₹${selectedHotel.price_per_night_inr || selectedHotel.price_inr || selectedHotel.price || 0}/night, Address: ${selectedHotel.address}, Amenities: ${selectedHotel.amenities?.join(', ') || 'None'})`;
    userMessage += `\n\nCRITICAL INSTRUCTION: You MUST use the selected_hotel above ("${selectedHotel.name}") as the accommodation for all nights in the itinerary. Do not invent other hotels.`;
  }

  userMessage += `\n\nOutput ONLY the raw JSON object. No markdown, no explanation, no code fences.`;

  const text = await callGemini(userMessage, SYSTEM_PROMPT);
  return extractJSON(text);
}

/**
 * Redraft an existing plan based on user instructions.
 */
export async function redraftTripPlan(currentPlan, instruction) {
  const systemInstruction = `You are an expert travel itinerary editor for Firstflight Travels. 
You will receive an existing JSON itinerary and a modification request. 
Apply ONLY the requested changes and return the complete updated itinerary as a raw JSON object.
Do NOT change the JSON schema structure. Do NOT include any markdown or explanatory text.`;

  const userMessage = `Here is the current travel itinerary:
${JSON.stringify(currentPlan, null, 2)}

Modification request: "${instruction}"

Return the complete modified itinerary as raw JSON only.`;

  const text = await callGemini(userMessage, systemInstruction);
  try {
    return extractJSON(text);
  } catch {
    return { raw: text, error: 'Could not parse the redrafted itinerary. Please try again.' };
  }
}

/**
 * Generate a travel document checklist.
 */
export async function generatePermitChecklist(mode, from, to) {
  const userMessage = `Generate a travel document checklist for a ${mode} journey from ${from} to ${to} in India.
Include: ID requirements, permits needed, insurance recommendations, cancellation policies, and any special documents.
Format as a JSON array: [{"item": "...", "required": true/false, "description": "...", "tip": "..."}]
Return ONLY the raw JSON array, no markdown.`;

  const text = await callGemini(userMessage);
  try {
    return extractJSON(text);
  } catch {
    return [
      { item: 'Valid ID (Aadhaar/Passport)', required: true, description: 'Government issued photo ID', tip: 'Keep a digital copy on your phone' },
      { item: 'Hotel Booking Confirmation', required: true, description: 'Printed or digital copy', tip: 'Email yourself a copy before departure' }
    ];
  }
}
