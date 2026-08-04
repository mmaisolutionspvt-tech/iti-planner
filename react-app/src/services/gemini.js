import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';
import { SYSTEM_PROMPT } from './systemPrompt';
import { fetchWeather, getPrecautions } from './weather';

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
async function callGemini(userMessage, systemInstruction = null, requireDays = false) {
  const { allowed, retryAfterMs } = checkRateLimit(RATE_LIMITS.GEMINI.key, RATE_LIMITS.GEMINI.max, RATE_LIMITS.GEMINI.windowMs);
  if (!allowed) {
    throw new Error(`Rate limited. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
  }

  const sysInst = systemInstruction ? {
    parts: [{ text: systemInstruction }]
  } : undefined;

  let lastError = null;

  if (!API_KEY || API_KEY.startsWith('csk-')) {
    console.warn("Invalid Gemini key or Cerebras key provided. Utilizing smart fallback response.");
    return JSON.stringify({
      days: [],
      trip_summary: { weather_note: 'Pleasant weather expected during travel dates.' },
      tips: ['Enjoy your journey!']
    });
  }

  for (const model of MODELS) {
    try {
      const url = `${BASE_URL}/${model}:generateContent?key=${API_KEY}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      };

      if (sysInst) {
        payload.systemInstruction = sysInst;
      }

      console.log(`Calling Gemini API (${model})...`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`Model ${model} returned error ${res.status}: ${errText}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!rawText) {
        continue;
      }

      if (requireDays) {
        try {
          const testObj = extractJSON(rawText);
          const daysArr = testObj.days || testObj.itinerary || [];
          if (!Array.isArray(daysArr) || daysArr.length === 0) {
            continue;
          }
        } catch {
          continue;
        }
      }

      return rawText;
    } catch (err) {
      console.warn(`Failed with model ${model}:`, err.message);
    }
  }

  // Gracefully return valid fallback text instead of throwing 400 error
  return JSON.stringify({
    days: [],
    trip_summary: { weather_note: 'Pleasant weather expected during travel dates.' },
    tips: ['Enjoy your journey!']
  });
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

const CITY_FALLBACK_DB = {
  goa: {
    spots: [
      { name: "Fort Aguada & Lighthouse", fee: 50, dslr: "Yes", activity: "17th-century Portuguese fortress & lighthouse overlooking Sinquerim beach" },
      { name: "Chapora Fort", fee: 0, dslr: "Yes", activity: "Panoramic views of Vagator Beach & Chapora River (Dil Chahta Hai spot)" },
      { name: "Basilica of Bom Jesus", fee: 0, dslr: "No", activity: "UNESCO World Heritage site containing St. Francis Xavier mortal remains" },
      { name: "Anjuna Flea Market & Beach", fee: 0, dslr: "Yes", activity: "Beachfront artisan crafts, Boho jewelry & sunset beach shacks" },
      { name: "Dudhsagar Waterfalls Safari", fee: 500, dslr: "Yes", activity: "Jeep safari through Mollem forest to 4-tiered cascading waterfall" },
      { name: "Fontainhas Latin Quarter", fee: 0, dslr: "Yes", activity: "Heritage photo walk past colorful 19th-century Portuguese villas" },
      { name: "Calangute & Baga Watersports", fee: 0, dslr: "Yes", activity: "Parasailing, jet ski rides, and beachside dining" },
      { name: "Se Cathedral", fee: 0, dslr: "Yes", activity: "One of Asia's largest churches featuring the Golden Bell" },
      { name: "Palolem Beach", fee: 0, dslr: "Yes", activity: "Scenic crescent bay with kayaking and tranquil beach cabanas" },
      { name: "Reis Magos Fort", fee: 50, dslr: "Yes", activity: "Restored 16th-century river fort overlooking Panaji skyline" }
    ],
    hotels: [
      { name: "Grand Hyatt Goa Resort & Spa", price: 8500, rating: 4.8, address: "Bambolim Bay, Goa" },
      { name: "Taj Fort Aguada Resort", price: 12500, rating: 4.9, address: "Sinquerim, Candolim, Goa" },
      { name: "Alila Diwa Goa", price: 7500, rating: 4.7, address: "Majorda, South Goa" },
      { name: "Lemon Tree Amarante Beach Resort", price: 4200, rating: 4.4, address: "Candolim, North Goa" },
      { name: "Hotel Residency Tower Goa", price: 2400, rating: 4.1, address: "Panaji, Goa" }
    ],
    dining: [
      { name: "Britto's Bar & Restaurant", rate: 1200, note: "Baga Beach; Goan fish curry & fresh tiger prawns" },
      { name: "Thalassa Greek Taverna", rate: 2000, cuisine: "Vagator Cliff; Sunset Mediterranean dining & cocktails" },
      { name: "Fisherman's Wharf", rate: 1400, cuisine: "Cavelossim; Riverside Goan seafood thali & kingfish" },
      { name: "Artjuna Garden Cafe", rate: 600, cuisine: "Anjuna; Organic smoothie bowls, falafel & fresh bakery" },
      { name: "Curlies Beach Shack", rate: 800, cuisine: "Anjuna Beachfront; Woodfired pizza & chilled beverage" },
      { name: "Vinayak Family Restaurant", rate: 500, cuisine: "Assagao; Authentic Goan prawn thali & fried fish" }
    ]
  },
  manali: {
    spots: [
      { name: "Hadimba Devi Temple", fee: 50, dslr: "Yes", activity: "1553 CE pagoda wooden shrine inside Dhungri cedar forest" },
      { name: "Solang Valley Snow Point", fee: 500, dslr: "Yes", activity: "Paragliding, ropeway rides, and snow adventure sports" },
      { name: "Vashisht Hot Springs", fee: 0, dslr: "Yes", activity: "Natural sulfur thermal baths and stone temple" },
      { name: "Jogini Waterfall Trek", fee: 0, dslr: "Yes", activity: "3km nature trek along mountain streams to waterfall" },
      { name: "Old Manali Cafe Circuit", fee: 0, dslr: "Yes", activity: "Apple orchards, bohemian cafes & handmade wooden crafts" },
      { name: "Atal Tunnel & Sissu", fee: 200, dslr: "Yes", activity: "Drive through world's longest high-altitude tunnel into Lahaul valley" }
    ],
    hotels: [
      { name: "Solang Valley Resort Manali", price: 6500, rating: 4.6, address: "Palchan, Manali" },
      { name: "Manu Allaya Resort & Spa", price: 8000, rating: 4.7, address: "Chhial, Manali" },
      { name: "Snow Valley Resorts Manali", price: 3200, rating: 4.3, address: "Log Huts Area, Manali" }
    ],
    dining: [
      { name: "Johnson's Cafe", rate: 900, note: "Model Town; Fresh Himalayan trout & warm apple crumble" },
      { name: "Cafe 1947", rate: 800, note: "Old Manali; Riverside Italian pasta & acoustic music" },
      { name: "Chopsticks Restaurant", rate: 600, note: "Mall Road; Authentic Tibetan momos & hot thukpa" }
    ]
  },
  jaipur: {
    spots: [
      { name: "Amer Fort & Sheesh Mahal", fee: 500, dslr: "Yes", activity: "16th-century hilltop palace, mirror hall & elephant ramparts" },
      { name: "Hawa Mahal (Palace of Winds)", fee: 200, dslr: "Yes", activity: "Iconic 953-window pink sandstone facade built for royal court" },
      { name: "City Palace Jaipur", fee: 700, dslr: "Yes", activity: "Royal courtyards, Peacock Gate, and museum of maharaja textiles" },
      { name: "Jantar Mantar Observatory", fee: 200, dslr: "Yes", activity: "UNESCO World Heritage site with giant stone astronomical instruments" },
      { name: "Nahargarh Fort Sunset Point", fee: 200, dslr: "Yes", activity: "Panoramas of Pink City at sunset from fort ramparts" },
      { name: "Jal Mahal (Water Palace)", fee: 0, dslr: "Yes", activity: "5-story palace floating on Man Sagar Lake" }
    ],
    hotels: [
      { name: "Trident Jaipur", price: 9500, rating: 4.8, address: "Amber Fort Road, Jaipur" },
      { name: "Hotel Pearl Palace", price: 2800, rating: 4.6, address: "Hathroi Fort, Jaipur" },
      { name: "Shahpura House Heritage Hotel", price: 6200, rating: 4.7, address: "Bani Park, Jaipur" }
    ],
    dining: [
      { name: "LMB (Laxmi Misthan Bhandar)", rate: 700, note: "Johari Bazaar; Iconic Rajasthani Dal Baati Churma" },
      { name: "Tapri Central Rooftop Cafe", rate: 500, note: "C-Scheme; Rooftop Kulhad Chai & fusion snacks" },
      { name: "Chokhi Dhani Ethnic Resort", rate: 1800, note: "Tonk Road; Royal Rajasthani thali & folk dance show" }
    ]
  }
};

function generateFallbackTripPlan(config) {
  const {
    locations = ['Goa'], 
    fromDate, 
    toDate, 
    mode = 'Flight', 
    budget = 'balanced', 
    tripType = 'Family Trip',
    fromCity = 'Delhi', 
    travellerCount = 2, 
    selectedHotels = [],
    customPlaces = [],
    scheduleData = {},
    selectedRides = [],
    selectedCafes = [],
    selectedRestaurants = [],
    outboundTransport = null,
    returnTransport = null
  } = config;

  const destCity = (locations[0] || 'Goa').trim();
  const destKey = destCity.toLowerCase();
  const dbKey = Object.keys(CITY_FALLBACK_DB).find(k => destKey.includes(k)) || 'goa';
  const cityData = CITY_FALLBACK_DB[dbKey];

  const start = new Date(fromDate || Date.now());
  const end = new Date(toDate || Date.now() + 3 * 86400000);
  const diffTime = Math.abs(end - start);
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const vibeThemes = {
    'Family Trip': ['Heritage & Temple Trail', 'Scenic Promenade & Lake Walk', 'Cultural Market & Local Delights', 'Relaxed Family Exploration', 'Artisans & Gardens'],
    'Friends Trip': ['Adventure & Viewpoints', 'Trendy Cafes & Night Markets', 'Water Sports & Coastal Drive', 'Thrilling Exploration', 'Sunset Party & Music'],
    'Couples / Romantic Trip': ['Romantic Sunset Viewpoint', 'Candlelight Dining & Strolls', 'Boutique Heritage Walk', 'Scenic Coastal Serenity', 'Intimate Beach Walk'],
    'Solo Trip': ['Solo Heritage Discovery', 'Authentic Local Food Crawl', 'Artisan Markets & Photo Walk', 'Peaceful Exploration', 'Cultural Heritage Circuit'],
    'Corporate / Business Trip': ['Executive Heritage Highlights', 'High-Speed Networking Dining', 'Iconic Landmark Tour', 'Smooth Transit & Return', 'Boutique Lounge Evening']
  };

  const themes = vibeThemes[tripType] || vibeThemes['Family Trip'];
  const daysArr = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNum = i + 1;

    // Filter user custom places for this day, or pick DISTINCT spots from cityData
    const userDayPlaces = customPlaces.filter(p => {
      const s = scheduleData[p.id];
      return s ? s.day === `Day ${dayNum}` : false;
    });

    const spot1 = userDayPlaces[0] || cityData.spots[(i * 2) % cityData.spots.length];
    const spot2 = userDayPlaces[1] || cityData.spots[(i * 2 + 1) % cityData.spots.length];

    const dayHotel = selectedHotels[i % Math.max(1, selectedHotels.length)] || cityData.hotels[i % cityData.hotels.length];
    const dayCafe = selectedCafes.find(c => c.day === `Day ${dayNum}`) || cityData.dining[(i * 2) % cityData.dining.length];
    const dayRest = selectedRestaurants.find(r => r.day === `Day ${dayNum}`) || cityData.dining[(i * 2 + 1) % cityData.dining.length];
    const dayRide = selectedRides[i % Math.max(1, selectedRides.length)];

    const schedule = [
      {
        time: '09:00',
        place: spot1.name || spot1.place,
        activity: spot1.activity || `Morning sightseeing curated for ${tripType}`,
        type: 'sightseeing',
        duration_min: 120,
        cost_inr: spot1.entrance_fee_inr ?? spot1.fee ?? 100,
        notes: spot1.dslr_allowed === 'Yes' ? 'DSLR Photography Permitted' : undefined
      },
      {
        time: '13:00',
        place: dayCafe.name || dayCafe.place || 'Local Gourmet Cafe',
        activity: `Lunch break (${dayCafe.cuisine || dayCafe.note || 'local culinary specialties'})`,
        type: 'meal',
        duration_min: 60,
        cost_inr: dayCafe.rate ? Math.round(dayCafe.rate / 2) : (dayCafe.rate_for_two ? Math.round(dayCafe.rate_for_two / 2) : 400)
      },
      {
        time: '16:00',
        place: spot2.name || spot2.place,
        activity: spot2.activity || `Afternoon sightseeing & photo walk`,
        type: 'sightseeing',
        duration_min: 90,
        cost_inr: spot2.entrance_fee_inr ?? spot2.fee ?? 150
      },
      {
        time: '20:00',
        place: dayRest.name || dayRest.place || 'Heritage Restaurant',
        activity: `Evening dinner & relaxation (${dayRest.cuisine || dayRest.note || 'signature dishes'})`,
        type: 'meal',
        duration_min: 90,
        cost_inr: dayRest.rate ? Math.round(dayRest.rate / 2) : (dayRest.price ? Math.round(dayRest.price / 2) : 600)
      }
    ];

    if (dayRide) {
      schedule.unshift({
        time: '08:30',
        place: `${dayRide.vehicle_model} Ground Ride`,
        activity: `Private ground transit via ${dayRide.vehicle_model} (${dayRide.vehicle_category})`,
        type: 'transport',
        duration_min: 30,
        cost_inr: dayRide.price || 500
      });
    }

    const hotelPrice = dayHotel.price_per_night_inr || dayHotel.price_inr || dayHotel.price || 3500;

    daysArr.push({
      day: dayNum,
      date: dateStr,
      city: (locations[0] || 'Goa').trim(),
      theme: `Day ${dayNum}: ${themes[i % themes.length]}`,
      hotel: {
        hotel_id: dayHotel.hotel_id || `h_${dayNum}`,
        name: dayHotel.name || dayHotel.property_name || `Grand ${locations[0]} Hotel`,
        price_per_night_inr: hotelPrice,
        rating: dayHotel.rating || dayHotel.hotel_stars || 4.5,
        address: dayHotel.address || `Central Promenade, ${locations[0]}`
      },
      schedule,
      day_total_inr: schedule.reduce((sum, s) => sum + (s.cost_inr || 0), 0) + hotelPrice
    });
  }

  const outboundTotal = (outboundTransport?.price || 0) * travellerCount;
  const returnTotal = (returnTransport?.price || 0) * travellerCount;
  const intercityTotal = outboundTotal + returnTotal;

  const spotsTotal = customPlaces.reduce((sum, p) => sum + (p.entrance_fee_inr || 0) * travellerCount, 0);
  const hotelsTotal = selectedHotels.reduce((sum, h) => sum + ((h.price_per_night_inr || h.price_inr || 0) * (h.nights || 1) * (h.rooms || 1)), 0);
  const ridesTotal = selectedRides.reduce((sum, r) => sum + (r.price || 0), 0);
  const cafesTotal = selectedCafes.reduce((sum, c) => sum + (c.rate_for_two || 500) * Math.ceil((c.seats || 2) / 2), 0);
  const restTotal = selectedRestaurants.reduce((sum, r) => sum + (r.price || 400) * Math.ceil((r.seats || 2) / 2), 0);
  const diningTotal = cafesTotal + restTotal;

  const sumDaysTotal = daysArr.reduce((sum, d) => sum + (d.day_total_inr || 0), 0) + intercityTotal;
  const finalCost = sumDaysTotal > 0 ? sumDaysTotal : (budget === 'budget' ? 12000 : (budget === 'comfort' ? 45000 : 25000));

  return {
    trip_name: `${destCity} ${tripType} Experience`,
    type: 'national',
    from_city: fromCity,
    destinations: locations,
    travel_mode: mode,
    budget_tier: budget,
    trip_type: tripType,
    tripType: tripType,
    total_days: totalDays,
    total_nights: Math.max(1, totalDays - 1),
    from_date: fromDate,
    to_date: toDate,
    estimated_budget_inr: { min: finalCost, max: Math.round(finalCost * 1.15) },
    currency: { local: 'INR', inr_rate: 1 },
    intercity_transport: {
      outbound: outboundTransport ? {
        mode: outboundTransport.mode || 'Flight',
        operator: outboundTransport.operator || 'Air India',
        from: fromCity,
        to: destCity,
        dep_time: outboundTransport.depTime || '09:00 AM',
        arr_time: outboundTransport.arrTime || '11:30 AM',
        duration: '2h 30m',
        cost_inr: outboundTransport.price || 5000
      } : undefined,
      return: returnTransport ? {
        mode: returnTransport.mode || 'Flight',
        operator: returnTransport.operator || 'SpiceJet',
        from: destCity,
        to: fromCity,
        dep_time: returnTransport.depTime || '03:00 PM',
        arr_time: returnTransport.arrTime || '05:30 PM',
        duration: '2h 30m',
        cost_inr: returnTransport.price || 5000
      } : undefined
    },
    days: daysArr,
    trip_summary: {
      total_cost_inr: finalCost,
      budget_breakdown: {
        intercity_transport_inr: intercityTotal,
        local_transport_inr: ridesTotal,
        accommodation_inr: hotelsTotal,
        food_inr: diningTotal,
        activities_inr: spotsTotal,
        shopping_inr: 0,
        misc_inr: 0
      },
      highlights: [
        `Curated for ${tripType} with tailored activity pacing`,
        `Explore top attractions in ${destCity}`,
        `Hygienic local dining and verified accommodations`
      ],
      weather_note: 'Pleasant weather expected during travel dates.'
    }
  };
}

/**
 * Main itinerary generator.
 * Sends the full system prompt as systemInstruction + a clean user query.
 */
export async function generateTripPlan(config) {
  const {
    locations = ['Goa'], 
    fromDate, 
    toDate, 
    mode, 
    budget, 
    tripType = 'Family Trip',
    fromCity = 'Delhi', 
    travellerCount = 2, 
    selectedHotel = null,
    selectedHotels = [],
    customPlaces = [],
    scheduleData = {},
    selectedRide = null,
    selectedRides = [],
    selectedCafes = [],
    selectedRestaurants = [],
    outboundTransport = null,
    returnTransport = null
  } = config;

  let userMessage = `Generate a complete travel itinerary with the following inputs:

- destinations: ${locations.join(', ')}
- from_date: ${fromDate}
- to_date: ${toDate}
- travel_mode: ${mode}
- trip_type: ${tripType}
- budget_tier: ${budget}
- from_city: ${fromCity}
- traveller_count: ${travellerCount}`;

  // Custom Scheduled Tourist Hubs
  if (customPlaces && customPlaces.length > 0) {
    const placesDetails = customPlaces.map(p => {
      const sched = scheduleData[p.id] || { day: 'Day 1', timeSlot: 'Morning' };
      return `* ${p.name} (City: ${p.city}, Assigned: ${sched.day} ${sched.timeSlot}, Fee: ₹${p.entrance_fee_inr}, DSLR Allowed: ${p.dslr_allowed}, Weekly Off: ${p.weekly_off})`;
    }).join('\n');

    userMessage += `\n\n- CUSTOMER_SELECTED_TOURIST_HUBS_AND_SCHEDULE:\n${placesDetails}`;
    userMessage += `\n\nCRITICAL INSTRUCTION: You MUST place each selected attraction into the itinerary on its assigned Day and Time Slot. In the tips and precautions section, explicitly highlight the DSLR policies and Weekly Off days for these selected places.`;
  }

  // Multi-Hotel Stay Sequence
  const hotelsList = selectedHotels.length > 0 ? selectedHotels : (selectedHotel ? [selectedHotel] : []);
  if (hotelsList.length > 0) {
    const sorted = [...hotelsList].sort((a, b) => (a.stayOrder || 1) - (b.stayOrder || 1));
    const hotelDetails = sorted.map((h, i) => {
      const name = h.property_name || h.name;
      return `* Stay #${i + 1}: "${name}" (${h.hotel_stars || 3} Stars, ₹${h.price_per_night_inr || h.price_inr || 0}/night, Duration: ${h.nights || 1} Night(s))`;
    }).join('\n');

    userMessage += `\n\n- CUSTOMER_SELECTED_HOTEL_STAY_SEQUENCE:\n${hotelDetails}`;
    userMessage += `\n\nCRITICAL INSTRUCTION: You MUST follow this exact hotel stay sequence across the itinerary days. Allocate the exact number of nights to each hotel in order. Do not invent other hotels.`;
  }

  // Multi-Ride Bookings
  const ridesList = selectedRides.length > 0 ? selectedRides : (selectedRide ? [selectedRide] : []);
  if (ridesList.length > 0) {
    const rideDetails = ridesList.map(r => `* Vehicle: ${r.vehicle_model} (${r.vehicle_category}, Type: ${r.booking_type}, Price: ₹${r.price}, Destination: ${r.tourist_place || r.city})`).join('\n');
    userMessage += `\n\n- BOOKED_GROUND_TRANSPORT_RIDES:\n${rideDetails}`;
  }

  // Intercity Outbound & Return Transport
  if (outboundTransport || returnTransport) {
    userMessage += `\n\n- INTERCITY_TRANSPORT_TICKETS:`;
    if (outboundTransport) {
      userMessage += `\n* Outbound (Day 1): ${outboundTransport.mode} via ${outboundTransport.operator} (${outboundTransport.depTime} - ${outboundTransport.arrTime}, ₹${outboundTransport.price}/person)`;
    }
    if (returnTransport) {
      userMessage += `\n* Return (Last Day): ${returnTransport.mode} via ${returnTransport.operator} (${returnTransport.depTime} - ${returnTransport.arrTime}, ₹${returnTransport.price}/person)`;
    }
  }

  // Scheduled Dining (Cafes & Restaurants)
  if (selectedCafes.length > 0 || selectedRestaurants.length > 0) {
    const cafesText = selectedCafes.map(c => `* Cafe: ${c.name} (${c.seats} guests, Assigned: ${c.day || 'Day 1'} ${c.timeSlot || 'Lunch'}, Rate for two: ₹${c.rate_for_two})`).join('\n');
    const restText = selectedRestaurants.map(r => `* Restaurant: ${r.name} (${r.seats} guests, Assigned: ${r.day || 'Day 1'} ${r.timeSlot || 'Dinner'}, Price for two: ₹${r.price})`).join('\n');
    userMessage += `\n\n- RESERVED_DINING_SCHEDULE:\n${cafesText}\n${restText}`;
    userMessage += `\n\nCRITICAL INSTRUCTION: Place the reserved cafes and restaurants into the itinerary on their requested Day and Time Slot (Meal time).`;
  }

  userMessage += `\n\nCRITICAL BUDGET INSTRUCTION: You MUST calculate estimated_budget_inr and trip_summary.total_cost_inr to reflect the REAL total sum of all user-selected transport, hotels, rides, dining, and sightseeing fees. Do not output a low default estimate.`;

  let parsed = null;
  try {
    const text = await callGemini(userMessage, SYSTEM_PROMPT, true);
    parsed = extractJSON(text);
    if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
      console.warn("AI returned empty or missing days array. Utilizing smart fallback trip plan generator.");
      parsed = generateFallbackTripPlan(config);
    }
  } catch (err) {
    console.warn("AI API request failed. Utilizing smart customized offline fallback generator:", err.message);
    parsed = generateFallbackTripPlan(config);
  }

  // Compute exact verified budget from custom user choices
  const outboundTotal = (outboundTransport?.price || 0) * travellerCount;
  const returnTotal = (returnTransport?.price || 0) * travellerCount;
  const intercityTotal = outboundTotal + returnTotal;
  
  const spotsTotal = customPlaces.reduce((sum, p) => sum + (p.entrance_fee_inr || 0) * travellerCount, 0);
  const hotelsTotal = selectedHotels.reduce((sum, h) => sum + ((h.price_per_night_inr || h.price_inr || 0) * (h.nights || 1) * (h.rooms || 1)), 0);
  const ridesTotal = selectedRides.reduce((sum, r) => sum + (r.price || 0), 0);
  const cafesTotal = selectedCafes.reduce((sum, c) => sum + (c.rate_for_two || 500) * Math.ceil((c.seats || 2) / 2), 0);
  const restTotal = selectedRestaurants.reduce((sum, r) => sum + (r.price || 400) * Math.ceil((r.seats || 2) / 2), 0);
  const diningTotal = cafesTotal + restTotal;

  const grandTotal = intercityTotal + spotsTotal + hotelsTotal + ridesTotal + diningTotal;

  if (grandTotal > 0 && parsed && !parsed.error) {
    parsed.estimated_budget_inr = { min: grandTotal, max: grandTotal };
    if (!parsed.trip_summary) parsed.trip_summary = {};
    parsed.trip_summary.total_cost_inr = grandTotal;
    parsed.trip_summary.budget_breakdown = {
      intercity_transport_inr: intercityTotal,
      local_transport_inr: ridesTotal,
      accommodation_inr: hotelsTotal,
      food_inr: diningTotal,
      activities_inr: spotsTotal,
      shopping_inr: 0,
      misc_inr: 0
    };
  }

  // Inject XWeather forecast and precautions into output (for both Auto & Customized)
  try {
    const mainCity = (locations[0] || 'Delhi').trim();
    const wData = await fetchWeather(mainCity);
    if (wData && parsed && !parsed.error) {
      if (!parsed.trip_summary) parsed.trip_summary = {};
      const day1Summary = wData.dailySummary?.[0];
      const weatherText = day1Summary 
        ? `${day1Summary.maxTemp}°C / ${day1Summary.minTemp}°C, ${day1Summary.mainWeather} (Rain chance: ${day1Summary.maxRain}%)`
        : 'Pleasant weather expected';

      if (!parsed.trip_summary.weather_note) {
        parsed.trip_summary.weather_note = weatherText;
      }

      if (wData.alerts) {
        const precautions = getPrecautions(wData.alerts);
        if (precautions.length > 0) {
          if (!parsed.tips) parsed.tips = [];
          precautions.forEach(p => {
            const pText = `Weather Precaution: ${p.icon} ${p.text}`;
            if (!parsed.tips.includes(pText)) {
              parsed.tips.push(pText);
            }
          });
        }
      }
    }
  } catch (wErr) {
    console.warn("Post-processing weather injection skipped:", wErr);
  }

  return parsed;
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

  const text = await callGemini(userMessage, systemInstruction, true);
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
