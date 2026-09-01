# Trip Planner Only - Isolated Code Reference

This folder contains a COPY of all files that make up the AI Trip Itinerary Planner feature.
The main project at the root is UNTOUCHED. These are reference copies only.

## Folder Structure

Trip-planner-only/
├── frontend/
│   ├── public/data/               <- Static JSON datasets (hotels, places, cafes, rides)
│   └── src/
│       ├── components/planner/    <- ALL 16 planner wizard step components
│       │   Step1Places.jsx, Step2SchedulePlaces.jsx, Step3Hotels.jsx,
│       │   Step4Rides.jsx, Step5Dining.jsx, Step6Review.jsx,
│       │   StepTransport.jsx, TripOutput.jsx, TripPDFDocument.jsx,
│       │   RouteMapPanel.jsx, ItineraryRouteMap.jsx, LiveRouteModal.jsx,
│       │   LiveRouteCard.jsx, CustomizationHeader.jsx, DraftHistory.jsx
│       ├── pages/
│       │   ScheduleTrip.jsx       <- Main planner page (wizard orchestration)
│       │   BookingGrid.jsx        <- Final booking + checkout page
│       │   SelectHotel.jsx        <- Hotel detail selection page
│       │   MyTrips.jsx            <- Saved trip drafts
│       │   WeatherDiagnostics.jsx <- Weather debug utility
│       ├── services/
│       │   gemini.js              <- AI itinerary generation (Gemini API)
│       │   systemPrompt.js        <- Full AI system prompt and rules
│       │   places.js              <- Google Places / Nominatim geocoding
│       │   routing.js             <- ORS route calculation
│       │   weather.js             <- OpenWeatherMap API
│       │   ipapi.js               <- User location detection
│       ├── stores/useAppStore.js  <- Global state (drafts, toasts, auth)
│       └── utils/                 <- cache.js, haversine.js, rateLimit.js
│
├── backend/
│   ├── server.js                  <- Express backend (DSA APIs: flights/buses/hotels)
│   ├── package.json               <- Backend dependencies
│   ├── .env.example               <- Template for env vars (NO SECRETS - create own .env)
│   └── services/
│       ├── db.js                  <- PostgreSQL connection pool
│       └── weatherAlertCron.js    <- Cron: sends weather SMS alerts via Twilio
│
└── data/
    ├── city_code.json             <- DSA Bus city code lookup (34,497 cities)
    └── hotel_city_code_special.json <- DSA Hotel city ID lookup (89,242 cities)

## KEY NOTES
- .env is NOT copied - contains secrets. Use .env.example as template to create your own.
- These are REFERENCE COPIES ONLY. Running project is at firstflight-travels/ (parent).
- Backend reads city_code.json and hotel_city_code_special.json from project root (../).
  If running standalone, update paths in server.js.

## Technologies Used
- AI Generation:     Google Gemini 2.0 Flash
- Route Maps:        Leaflet.js + OpenRouteService (ORS)
- Live Travel Data:  DSA APIs (Flights, Buses, Hotels)
- Place/Hotel Search:Google Places API + Nominatim
- Weather:           OpenWeatherMap API
- SMS Alerts:        Twilio
- Database:          PostgreSQL (booking storage + cron)
- PDF Generation:    pdf-lib
- State Management:  Zustand (useAppStore)
