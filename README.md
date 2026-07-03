# Firstflight Travels (AI Trip Planner)

Firstflight Travels is a modern, dynamic web application designed to help users plan their trips effortlessly. It features a stunning Dark Charcoal and Amber Gold aesthetic, offering a premium user experience.

## 🚀 Features

- **Global UI/UX Design**: A sleek, dark-themed interface (`#121619` & `#FFAA00`) featuring micro-animations, glassmorphism, and responsive layouts.
- **Interactive Booking Sidebar**: An intuitive slide-out drawer with segmented tabs for booking Buses, Flights, and Hotels.
- **Transport & Accommodations Grid**: A unified results stream with sticky sidebar filters (Price, Star Rating, FSSAI Certification) that intelligently maps data based on the selected transport mode.
- **Weather Diagnostics Dashboard**: A split-screen telemetry page (`/weather-diagnostics`) integrating the Open-Meteo API to provide real-time weather analytics, 7-day temperature trends (via Recharts), and actionable safety advisories.
- **Post-Checkout Review System**: An interactive 5-star rating matrix popup to gather user feedback after booking.
- **Journey Summary PDF Engine**: Powered by `html2pdf.js`, users can instantly generate and download a beautifully styled A4 PDF of their complete itinerary, including transport, hotel, and meteorological advisories.

## 🛠️ Technology Stack

- **Core**: React, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **Mapping**: Leaflet.js
- **Analytics**: Recharts (for weather data visualization)
- **PDF Generation**: html2pdf.js

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mindmastersaisolutions-beep/Ai-TRIP-PLANNER.git
   ```

2. **Install dependencies:**
   Navigate into the `react-app` directory and install the necessary npm packages.
   ```bash
   cd react-app
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the `react-app` directory (this is ignored by git for security) and add your required API keys (e.g., for Gemini, if applicable).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📂 Data Architecture

The application consumes structured static JSON data to simulate robust backend responses:
- `hotels.json`
- `flights_demo.json`
- `vendors.json` (for Buses)
- `locations.json`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
