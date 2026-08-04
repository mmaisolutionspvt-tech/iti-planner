import cron from 'node-cron';
import axios from 'axios';
import 'dotenv/config';
import pool from './db.js';

const X_URL = process.env.XWEATHER_BASE_URL || 'https://data.api.xweather.com';
const ID = process.env.XWEATHER_CLIENT_ID;
const SECRET = process.env.XWEATHER_CLIENT_SECRET;

// Run every day at 9:00 AM India time
//cron.schedule('0 9 * * *'
cron.schedule('*/1 * * * *', async () => {
  console.log("[CRON] Starting weather check for trips in 2 days...");
  try {
    const trips = await getTripsHappeningIn2Days();
    console.log(`[CRON] Found ${trips.length} upcoming trips.`);

    for (const trip of trips) {
      await processTrip(trip);
    }
  } catch (err) {
    console.error("[CRON ERROR]", err.message);
  }
}, {
  timezone: "Asia/Kolkata"
});

async function getTripsHappeningIn2Days() {
  // Query PostgreSQL directly
  const query = `
    SELECT id, name, phone, email, destination, start_date::text AS start_date
    FROM bookings
    WHERE start_date = CURRENT_DATE + INTERVAL '2 days'
  `;
  const { rows } = await pool.query(query);
  return rows;
}

async function processTrip(trip) {
  const { destination, start_date, name, phone, email } = trip;

  // STEP 2: Check original 4-day window D-1 to D+2
  const dates1 = getDateRange(start_date, 0);
  const risk1 = 80; // Force high risk (> 30%)
  // const risk1 = await getRiskScore(destination, dates1);

  if (risk1 < 30) {
    console.log(`[OK] ${destination} on ${start_date} is clear. Risk score: ${risk1}%`);
    return;
  }

  console.log(`[RISKY] ${destination} on ${start_date}. Risk: ${risk1}%. Checking +3 days...`);

  // STEP 3: If risky, check shifted 4-day window D+2 to D+5 (offset by 3 days)
  const dates2 = getDateRange(start_date, 3);
  const risk2 = 10; // Force safe reschedule (< 30%)
  // const risk2 = await getRiskScore(destination, dates2);

  let message;
  if (risk2 < 30) {
    // STEP 4: Suggest D+3
    const newStartDate = addDays(start_date, 3);
    message = `Hi ${name}, ⚠️ Weather alert for your ${destination} trip on ${start_date}.\n\nForecast shows risky weather.\n\nBetter option: Start on ${newStartDate} instead. Weather looks clear.\n\nReply RESCHEDULE to confirm. -Team Firstflight`;
  } else {
    // STEP 5: Still risky, ask to contact
    message = `Hi ${name}, ⚠️ Weather alert for your ${destination} trip on ${start_date}.\n\nForecast shows risky weather for next few days.\n\nPlease contact us to reschedule to a safer date. -Team Firstflight`;
  }

  // Send notifications across all configured channels
  await Promise.allSettled([
    sendWhatsApp(phone, message),
    sendEmail(email, name, destination, start_date, message)
  ]);
}

async function getRiskScore(destination, dates) {
  try {
    const res = await axios.get(`${X_URL}/forecasts/${destination}`, {
      params: {
        client_id: ID,
        client_secret: SECRET,
        from: dates[0],
        to: dates[3],
        filter: 'day'
      }
    });

    const periods = res.data.response?.[0]?.periods || [];
    if (periods.length === 0) return 0;

    let risk = 0;
    periods.forEach(p => {
      const isThunder = p.thunderstorm || p.isThunder || (p.weather && p.weather.toLowerCase().includes('thunder'));
      const precip = p.precipIN !== undefined ? p.precipIN : (p.precipMM !== undefined ? p.precipMM / 25.4 : 0);
      const windSpeed = p.windSpeedMPH !== undefined ? p.windSpeedMPH : (p.windSpeedKPH !== undefined ? p.windSpeedKPH / 1.609 : 0);

      if (isThunder) risk += 50;
      if (precip > 0.4) risk += 30; // >10mm rain
      if (windSpeed > 25) risk += 20; // >40 kmph
    });

    return Math.round(risk / periods.length);
  } catch (err) {
    console.error(`[WEATHER API ERROR] Failed to fetch forecast for ${destination}:`, err.message);
    return 0; // Fallback to safe score to prevent stopping the cron
  }
}

function parseLocalDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

function getDateRange(startDate, offsetDays) {
  const d = parseLocalDate(startDate);
  d.setDate(d.getDate() + offsetDays);
  const arr = [];
  for (let i = -1; i <= 2; i++) { // D-1, D, D+1, D+2
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    arr.push(`${yyyy}-${mm}-${dd}`);
  }
  return arr;
}

function addDays(date, days) {
  const d = parseLocalDate(date);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function sendWhatsApp(phone, text) {
  const token = process.env.WASENDER_API_KEY || '6e388b8a96f6bea7f714d930f211fea7554038bbcc45727bc228c4e9a314c276';
  try {
    await axios.post('https://wasenderapi.com/api/send-message', {
      to: phone,
      text: text
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`[ALERT SENT WA] successfully to ${phone}`);
  } catch (err) {
    console.error(`[ALERT FAILED WA] for ${phone}:`, err.response?.data || err.message);
  }
}

async function sendEmail(email, name, destination, startDate, message) {
  if (!process.env.RESEND_API_KEY || !email || email === 'N/A') {
    return;
  }
  try {
    await axios.post('https://api.resend.com/emails', {
      from: 'Firstflight Travels <onboarding@resend.dev>',
      to: email,
      subject: `⚠️ Weather Alert: Your trip to ${destination} on ${startDate}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #d9534f;">Weather Advisory Alert</h2>
          <p>Dear ${name},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            This is an automated weather warning system from Firstflight Travels.
          </p>
        </div>
      `
    }, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
    });
    console.log(`[ALERT SENT EMAIL] successfully to ${email}`);
  } catch (err) {
    console.error(`[ALERT FAILED EMAIL] for ${email}:`, err.response?.data || err.message);
  }
}

export default {};
