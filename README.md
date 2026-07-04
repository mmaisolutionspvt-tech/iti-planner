# Firstflight Travels (AI Trip Planner)

Firstflight Travels is a modern, dynamic web application designed to help users plan their trips effortlessly. It combines a premium-looking React experience with AI-generated travel suggestions, booking exploration, and a growing automation layer for user auth and communication.

## 🚀 Core Features

- **Modern travel UI** with a dark charcoal and amber-gold aesthetic.
- **AI-powered trip planning** using Gemini-style travel suggestions.
- **Trip package browsing** for flights, buses, hotels, and destinations.
- **Weather diagnostics** for travel safety awareness.
- **PDF itinerary generation** for trip summaries.
- **User authentication flow** through the existing login/registration system.

## 🛠️ Technology Stack

- **Frontend**: React, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **Maps & Visualization**: Leaflet.js, Recharts
- **PDF Generation**: html2pdf.js
- **Authentication / Automation**: Clerk, Python-based login automation flow
- **AI Integration**: Gemini API

## 🧭 Draft Workflow for the Application

Here is a practical workflow draft for how the app can function end-to-end:

1. **User discovers the app**
   - The user lands on the homepage and explores destinations, packages, or travel recommendations.

2. **User selects travel preferences**
   - The user chooses a destination, budget, travel style, number of days, and preferred transport mode.

3. **AI creates a draft itinerary**
   - The React frontend sends the preference data to the AI planning layer.
   - Gemini generates a travel plan using destination data, hotels, flights, vendors, and weather-aware logic.

4. **User reviews and customizes the trip**
   - The user can refine the itinerary, choose transport, swap hotels, or adjust the route.
   - The experience feels interactive and personalized.

5. **User signs up or logs in**
   - Authentication is handled through the current login/register system.
   - In the future, Google sign-in can be added for faster onboarding.

6. **Trip is saved and managed**
   - The selected itinerary, user preferences, booking status, and feedback can be stored in a database.
   - This allows the app to support future features like saved trips, history, and recurring bookings.

7. **Automation handles follow-ups**
   - OTP verification, booking confirmations, reminders, and email updates can be automated.
   - This makes the travel experience feel more complete and professional.

8. **Future analytics and growth**
   - Trip data, user behavior, and booking trends can be analyzed to improve recommendations and marketing.

## 🔐 How to Add Google Console and Google Sign-In

To make the app more trustworthy and production-ready, Google Cloud Console integration is a strong next step.

### Suggested implementation plan

1. **Create a Google Cloud project**
   - Go to Google Cloud Console and create a new project.

2. **Enable the right APIs**
   - Enable Google Identity Services for authentication.
   - Enable Maps, Places, and Geocoding APIs if you want location-based features.
   - Enable Analytics if you want visitor and conversion tracking.

3. **Add OAuth credentials**
   - Create OAuth client IDs for your frontend and backend.
   - Add the redirect URLs for your local development and production domains.

4. **Connect Google Sign-In to the app**
   - Use Google OAuth in the React app for a smoother login experience.
   - You can also combine it with Clerk if you want a cleaner auth experience.

5. **Optional upgrades**
   - Add Google reCAPTCHA to registration/contact forms.
   - Add Google Analytics 4 to measure user journeys.
   - Integrate Google Calendar or Gmail APIs for reminders and trip alerts.

### Why this helps

- Better user trust and login experience
- Faster onboarding for users
- Easier future integration with maps, calendars, and travel services

## 🤖 How to Add Automation to This App

Automation will make the app feel much more complete and business-ready.

### Good automation ideas

- **OTP and email automation** for signup, verification, and booking confirmations
- **Trip reminder emails** before departure dates
- **Weather-based travel alerts** for active itineraries
- **Booking follow-ups** after the user completes a trip plan
- **Admin notifications** when a booking or inquiry is created

### Recommended tools

- **Python automation layer** for custom logic and email/OTP flows
- **n8n or Make** for no-code workflow automation
- **Google Apps Script** for lightweight automations tied to Google services
- **Cloud Functions / scheduled jobs** for background tasks and reminders

### Best practical approach

For this project, the most balanced approach is:
- Keep the React frontend for the user experience
- Use Python for verification and business logic
- Use a managed database for storing trip and user data
- Add lightweight automation tools for reminders and notifications

## 🗄️ Recommended Database

The best database choice for this application is **PostgreSQL through Supabase**.

### Why PostgreSQL / Supabase is the best fit

This app deals with structured data such as:
- users
- trip plans
- bookings
- itinerary details
- feedback and preferences

A relational database is a better fit than a simple document store because these records are strongly connected.

Supabase is a very good choice because it gives you:
- **PostgreSQL** as the database engine
- **Built-in auth** support
- **Easy API access** for frontend and backend
- **Storage support** for images and documents
- **Simple deployment** for MVP and small production apps

### Cost estimate

Please verify current pricing on the provider website, but a typical estimate is:

- **Free tier**: enough for development, testing, and small MVP traffic
  - usually includes a small database size limit
  - enough for early prototypes and limited users
- **After free tier**: typically starts around **$25/month or more**, depending on usage, storage, and bandwidth

### Why not NoSQL first?

MongoDB or Firebase-style NoSQL can work for simple prototypes, but they are less natural for relational trip-booking data where users, itineraries, bookings, and payments are connected. PostgreSQL is usually the safer long-term choice.

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
   Create a `.env` file in the `react-app` directory and add your required API keys such as Gemini and Clerk-related values.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📂 Data Architecture

The application currently uses structured JSON data to simulate backend responses, including:
- `hotels.json`
- `flights_demo.json`
- `vendors.json` (for buses)
- `locations.json`
- `packages.json`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. This project is a strong foundation for turning a travel demo into a full AI-powered booking platform.
