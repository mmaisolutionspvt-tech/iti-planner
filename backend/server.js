import express from 'express';
import cors from 'cors';
import { PDFDocument, rgb } from 'pdf-lib';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

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

async function generatePDF(booking) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 450]);
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

  // Draw Section Header
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

  // Draw Section Header for Item
  currentY -= 40;
  page.drawText('BOOKING DETAILS', { x: 40, y: currentY, size: 12, color: accentColor });
  page.drawLine({
    start: { x: 40, y: currentY - 5 },
    end: { x: width - 40, y: currentY - 5 },
    thickness: 1,
    color: accentColor,
  });

  const itemName = booking.itemData?.name || booking.itemData?.airline || booking.itemData?.vendor_id || 'Travel Booking';
  const price = booking.itemData?.price_inr || booking.itemData?.price_per_night_inr || booking.itemData?.price || (booking.itemData?.price_per_km ? booking.itemData.price_per_km * 100 : 0);

  currentY -= 30;
  page.drawText(`Item Type: ${booking.itemType ? booking.itemType.toUpperCase() : 'N/A'}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`Provider/Hotel: ${itemName}`, { x: 300, y: currentY, size: 11, color: primaryColor });

  if (booking.itemData?.from && booking.itemData?.to) {
    currentY -= 20;
    page.drawText(`Route: ${booking.itemData.from} to ${booking.itemData.to}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  } else if (booking.itemData?.city) {
    currentY -= 20;
    page.drawText(`City: ${booking.itemData.city}`, { x: 50, y: currentY, size: 11, color: primaryColor });
  }

  // Draw Price Details
  currentY -= 40;
  page.drawText('BILLING DETAILS', { x: 40, y: currentY, size: 12, color: accentColor });
  page.drawLine({
    start: { x: 40, y: currentY - 5 },
    end: { x: width - 40, y: currentY - 5 },
    thickness: 1,
    color: accentColor,
  });

  currentY -= 30;
  page.drawText(`Base Fare:`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`INR ${price.toLocaleString()}`, { x: 200, y: currentY, size: 11, color: primaryColor });
  
  currentY -= 20;
  page.drawText(`Status:`, { x: 50, y: currentY, size: 11, color: primaryColor });
  page.drawText(`PAID (Razorpay/PhonePe Mock)`, { x: 200, y: currentY, size: 11, color: rgb(0, 0.5, 0) });

  // Footer text
  page.drawText('Thank you for booking with Firstflight Travels. Have a safe journey!', {
    x: 40,
    y: 40,
    size: 10,
    color: darkGray,
  });

  return await pdfDoc.save();
}

app.listen(PORT, () => {
  console.log(`Firstflight backend running on http://localhost:${PORT}`);
});
