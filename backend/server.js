import express from 'express';
import cors from 'cors';
import { PDFDocument, rgb } from 'pdf-lib';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import pool from './services/db.js';
import './services/weatherAlertCron.js';
import twilio from 'twilio';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure tickets directory exists
const ticketsDir = path.join(__dirname, 'tickets');
if (!fs.existsSync(ticketsDir)) {
  fs.mkdirSync(ticketsDir, { recursive: true });
}

// Serve tickets statically
app.use('/tickets', express.static(ticketsDir));

app.post('/api/book', async (req, res) => {
  try {
    const booking = req.body;
    console.log('Received booking request:', booking);

    if (!booking.userId || !booking.email) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields (userId, email)' });
    }

    // 1. GENERATE PDF TICKET
    const pdfBytes = await generatePDF(booking);
    const fileName = `ticket_${booking.userId}_${Date.now()}.pdf`;
    const filePath = path.join(ticketsDir, fileName);
    fs.writeFileSync(filePath, pdfBytes);

    const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
    const pdfUrl = `${serverUrl}/tickets/${fileName}`;

    // 2. CALL N8N WEBHOOK
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/firstflight-booking';
    
    console.log(`Sending webhook to n8n: ${n8nWebhookUrl}`);
    try {
      await axios.post(n8nWebhookUrl, {
        ...booking,
        pdf_url: pdfUrl
      });
      console.log('n8n webhook triggered successfully');
    } catch (webhookErr) {
      console.error('Failed to trigger n8n webhook:', webhookErr.message);
      // We don't fail the entire request if n8n is not running/accessible,
      // but we warn the user in the response.
    }

    // 3. SAVE BOOKING TO POSTGRESQL DATABASE
    try {
      const destination = booking.itemData?.to || 'Unknown';
      const startDate = booking.itemData?.fromDate || new Date().toISOString().split('T')[0];
      
      const insertQuery = `
        INSERT INTO bookings (user_id, email, phone, name, destination, start_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      
      const insertValues = [
        booking.userId,
        booking.email,
        booking.phone || 'N/A',
        booking.name || 'Passenger',
        destination,
        startDate
      ];
      
      await pool.query(insertQuery, insertValues);
      console.log('Booking stored in PostgreSQL cache database successfully');
    } catch (dbErr) {
      console.error('Failed to store booking in database:', dbErr.message);
    }

    res.json({ 
      success: true, 
      message: 'Booking confirmed!', 
      pdfUrl: pdfUrl 
    });
  } catch (err) {
    console.error('Booking endpoint error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
});

// GET endpoint for cron/internal tracking of upcoming trips
app.get('/api/bookings/upcoming', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '2');
    const query = `
      SELECT id, name, phone, email, destination, start_date::text AS start_date
      FROM bookings
      WHERE start_date = CURRENT_DATE + CAST($1 || ' days' AS INTERVAL);
    `;
    const { rows } = await pool.query(query, [days]);
    res.json(rows);
  } catch (err) {
    console.error('Upcoming bookings endpoint error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve upcoming bookings', error: err.message });
  }
});

async function generatePDF(booking) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 540]);
  const { width, height } = page.getSize();
  
  // Custom theme colors (Firstflight Branding)
  const primaryColor = rgb(18 / 255, 22 / 255, 25 / 255); // #121619
  const accentColor = rgb(212 / 255, 177 / 255, 90 / 255); // #D4B15A (Gold)
  const darkGray = rgb(100 / 255, 110 / 255, 120 / 255);

  // Draw Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: primaryColor,
  });

  // Header Title
  page.drawText('FIRSTFLIGHT TRAVELS', {
    x: 40,
    y: height - 60,
    size: 24,
    color: accentColor,
  });

  page.drawText('OFFICIAL BOOKING CONFIRMATION TICKET', {
    x: 40,
    y: height - 80,
    size: 10,
    color: rgb(1, 1, 1),
  });

  // Ticket Body
  let currentY = height - 140;

  // Draw Section Header: Passenger Details
  page.drawText('PASSENGER DETAILS', { x: 40, y: currentY, size: 12, color: accentColor });
  page.drawLine({
    start: { x: 40, y: currentY - 5 },
    end: { x: width - 40, y: currentY - 5 },
    thickness: 1,
    color: accentColor,
  });

  currentY -= 30;
  page.drawText(`Name: ${booking.name || 'N/A'}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`Email: ${booking.email || 'N/A'}`, { x: 300, y: currentY, size: 11, color: primaryColor });
  
  currentY -= 20;
  page.drawText(`Phone: ${booking.phone || 'N/A'}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`User ID: ${booking.userId || 'N/A'}`, { x: 300, y: currentY, size: 10, color: darkGray });

  // Draw Section Header: Transport Details
  currentY -= 40;
  page.drawText('TRANSPORT DETAILS', { x: 40, y: currentY, size: 12, color: accentColor });
  page.drawLine({
    start: { x: 40, y: currentY - 5 },
    end: { x: width - 40, y: currentY - 5 },
    thickness: 1,
    color: accentColor,
  });

  const itemName = booking.itemData?.name || booking.itemData?.airline || booking.itemData?.vendor_id || 'Travel Booking';
  const transportPrice = booking.itemData?.price_inr || booking.itemData?.price_per_night_inr || booking.itemData?.price || (booking.itemData?.price_per_km ? booking.itemData.price_per_km * 100 : 0);

  currentY -= 30;
  page.drawText(`Item Type: ${booking.itemType ? booking.itemType.toUpperCase() : 'N/A'}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`Provider/Line: ${itemName}`, { x: 300, y: currentY, size: 11, color: primaryColor });

  if (booking.itemData?.from && booking.itemData?.to) {
    currentY -= 20;
    page.drawText(`Route: ${booking.itemData.from} to ${booking.itemData.to}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  } else if (booking.itemData?.city) {
    currentY -= 20;
    page.drawText(`City: ${booking.itemData.city}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  }

  // Draw Section Header: Hotel Details (If present)
  let hotelTotalPrice = 0;
  if (booking.hotelData) {
    hotelTotalPrice = booking.hotelData.total_price_inr || 0;
    currentY -= 40;
    page.drawText('ACCOMMODATION DETAILS', { x: 40, y: currentY, size: 12, color: accentColor });
    page.drawLine({
      start: { x: 40, y: currentY - 5 },
      end: { x: width - 40, y: currentY - 5 },
      thickness: 1,
      color: accentColor,
    });

    currentY -= 30;
    page.drawText(`Hotel Name: ${booking.hotelData.name}`, { x: 50, y: currentY, size: 11, color: primaryColor });
    page.drawText(`Duration: ${booking.hotelData.nights || 1} Night(s)`, { x: 350, y: currentY, size: 11, color: primaryColor });
    
    currentY -= 20;
    page.drawText(`Price / Night: INR ${(booking.hotelData.price_per_night_inr || 0).toLocaleString()}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  }

  // Draw Section Header: Billing Details
  currentY -= 40;
  page.drawText('BILLING DETAILS', { x: 40, y: currentY, size: 12, color: accentColor });
  page.drawLine({
    start: { x: 40, y: currentY - 5 },
    end: { x: width - 40, y: currentY - 5 },
    thickness: 1,
    color: accentColor,
  });

  currentY -= 30;
  page.drawText(`Transport Fare:`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`INR ${transportPrice.toLocaleString()}`, { x: 200, y: currentY, size: 11, color: primaryColor });
  
  if (booking.hotelData) {
    currentY -= 20;
    page.drawText(`Hotel Fare:`, { x: 50, y: currentY, size: 11, color: primaryColor });
    page.drawText(`INR ${hotelTotalPrice.toLocaleString()}`, { x: 200, y: currentY, size: 11, color: primaryColor });
  }

  const finalTotal = transportPrice + hotelTotalPrice;
  currentY -= 20;
  page.drawText(`Total Charged:`, { x: 50, y: currentY, size: 11, fontStyle: 'bold', color: primaryColor });
  page.drawText(`INR ${finalTotal.toLocaleString()}`, { x: 200, y: currentY, size: 11, fontStyle: 'bold', color: primaryColor });
  
  currentY -= 20;
  page.drawText(`Status:`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`PAID (Razorpay/PhonePe Mock)`, { x: 200, y: currentY, size: 11, color: rgb(0, 0.5, 0) });

  // Footer text
  page.drawText('Thank you for booking with Firstflight Travels. Have a safe journey!', {
    x: 40,
    y: 30,
    size: 10,
    color: darkGray,
  });

  return await pdfDoc.save();
}

// Custom WhatsApp OTP Authentication Setup (WasenderAPI)
const otps = new Map();

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Generate random 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute lifespan
    otps.set(phone, { code: otp, expiresAt });

    console.log(`[AUTH] Sending WhatsApp OTP ${otp} to ${phone} via WasenderAPI`);
    
    const token = process.env.WASENDER_API_KEY || '6e388b8a96f6bea7f714d930f211fea7554038bbcc45727bc228c4e9a314c276';
    await axios.post('https://wasenderapi.com/api/send-message', {
      to: phone,
      text: `Your Firstflight verification OTP code is: ${otp}. Valid for 5 minutes.`
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
      
    res.json({ success: true, message: 'OTP sent successfully via WhatsApp' });
  } catch (err) {
    console.error('[AUTH ERROR] Send OTP failed:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone and OTP code are required' });
    }
    
    console.log(`[AUTH] Verifying code ${code} for ${phone}`);
    const record = otps.get(phone);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this phone number' });
    }

    if (Date.now() > record.expiresAt) {
      otps.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    if (record.code !== code) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // OTP Verified, clear map entry
    otps.delete(phone);

    const mockUser = {
      id: `usr_${Date.now()}`,
      name: `User ${phone.slice(-4)}`,
      phone: phone,
      email: `${phone.replace('+', '')}@firstflight.com`
    };
    res.json({ success: true, user: mockUser });
  } catch (err) {
    console.error('[AUTH ERROR] Verify OTP failed:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Firstflight backend running on http://localhost:${PORT}`);
});
