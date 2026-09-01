import { getCached, setCache, TTL } from '../utils/cache';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

const XWEATHER_ID = import.meta.env.VITE_XWEATHER_CLIENT_ID;
const XWEATHER_SECRET = import.meta.env.VITE_XWEATHER_CLIENT_SECRET;

function mapIcon(xweatherIcon) {
  if (!xweatherIcon) return '02d';
  const name = xweatherIcon.toLowerCase();
  if (name.includes('sunny') || name.includes('clear')) return '01d';
  if (name.includes('mostlycloudy') || name.includes('partlycloudy') || name.includes('cloudy')) return '03d';
  if (name.includes('rain') || name.includes('showers')) return '10d';
  if (name.includes('snow')) return '13d';
  if (name.includes('tstorm') || name.includes('storm')) return '11d';
  return '02d';
}

function parseXweatherData(data, city) {
  const period = data.response?.[0]?.periods || [];
  const forecasts = period.map(p => {
    const dtMs = new Date(p.validTime || p.dateTimeISO).getTime();
    const currentTemp = p.avgTempC ?? p.tempC ?? p.maxTempC ?? 28;
    const maxT = p.maxTempC ?? currentTemp;
    const minT = p.minTempC ?? currentTemp;
    const feels = p.avgFeelslikeC ?? p.feelslikeC ?? p.maxFeelslikeC ?? currentTemp;

    return {
      dt: dtMs,
      date: new Date(dtMs).toLocaleDateString('en-IN'),
      time: new Date(dtMs).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(currentTemp),
      maxTemp: Math.round(maxT),
      minTemp: Math.round(minT),
      feels_like: Math.round(feels),
      humidity: p.humidity || 50,
      description: p.weather || 'Cloudy',
      icon: mapIcon(p.icon),
      wind_speed: Math.round((p.windSpeedKPH || (p.windSpeedMPH || 0) * 1.609) / 3.6),
      rain_chance: p.pop || 0,
      main: p.weatherPrimary || p.weather || 'Clouds',
    };
  });

  // Group by date
  const daily = {};
  forecasts.forEach(f => {
    if (!daily[f.date]) daily[f.date] = [];
    daily[f.date].push(f);
  });

  const dailySummary = Object.entries(daily).map(([date, items]) => ({
    date,
    avgTemp: Math.round(items.reduce((s, i) => s + i.temp, 0) / items.length),
    maxTemp: Math.max(...items.map(i => i.maxTemp || i.temp)),
    minTemp: Math.min(...items.map(i => i.minTemp || i.temp)),
    maxRain: Math.max(...items.map(i => i.rain_chance)),
    mainWeather: items[Math.floor(items.length / 2)].main,
    icon: items[Math.floor(items.length / 2)].icon,
  }));

  return { city, forecasts, dailySummary, alerts: getWeatherAlerts(dailySummary) };
}

const CITY_COORDS = {
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'nainital': { lat: 29.3803, lng: 79.4636 },
  'manali': { lat: 32.2396, lng: 77.1887 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'goa': { lat: 15.2993, lng: 74.1240 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'mussoorie': { lat: 30.4598, lng: 78.0796 }
};

export async function fetchWeather(city, targetLat = null, targetLng = null) {
  // Use coordinates in cache key if provided to ensure unique caching
  const cacheKey = (targetLat && targetLng) ? `weather:coords:${targetLat}:${targetLng}` : `weather:${city}`;
  const cached = getCached(cacheKey);
  if (cached && cached.dailySummary?.[0]?.maxTemp !== 0 && cached.dailySummary?.[0]?.avgTemp !== 0) {
    return cached;
  }

  const { allowed } = checkRateLimit(RATE_LIMITS.WEATHER.key, RATE_LIMITS.WEATHER.max, RATE_LIMITS.WEATHER.windowMs);
  if (!allowed) throw new Error('Weather API rate limit reached. Try again in a minute.');

  // Find coordinates
  let lat = targetLat;
  let lng = targetLng;
  
  if (!lat || !lng) {
    const cleanCity = city.toLowerCase().trim();
    if (CITY_COORDS[cleanCity]) {
      lat = CITY_COORDS[cleanCity].lat;
      lng = CITY_COORDS[cleanCity].lng;
    } else {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lng = geoData.results[0].longitude;
          }
        }
      } catch (err) {
        console.warn("Geocoding failed inside fetchWeather:", err);
      }
    }
  }

  // Try Xweather first if configured
  if (XWEATHER_ID && XWEATHER_SECRET && XWEATHER_ID.length > 5) {
    try {
      console.log("Attempting to fetch weather from Vaisala Xweather...");
      const queryLoc = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(city);
      const url = `https://data.api.xweather.com/forecasts/${queryLoc}?client_id=${XWEATHER_ID}&client_secret=${XWEATHER_SECRET}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.response?.length > 0) {
          const result = parseXweatherData(data, city);
          setCache(cacheKey, result, TTL.WEATHER);
          return result;
        }
      }
      console.warn(`Xweather API returned status ${res.status}. Falling back to OpenWeatherMap.`);
    } catch (err) {
      console.warn("Xweather fetch failed, falling back to OpenWeatherMap:", err);
    }
  }

  // Fallback to OpenWeatherMap
  let url = `${BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  if (lat && lng) {
    url = `${BASE}/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data = await res.json();

  const result = parseWeatherData(data, city);
  setCache(cacheKey, result, TTL.WEATHER);
  return result;
}

export async function fetchAQI(lat, lon) {
  const cacheKey = `aqi:${lat}:${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  const aqi = data?.list?.[0]?.main?.aqi;
  const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const result = { aqi, label: labels[(aqi || 1) - 1] || 'Unknown' };
  setCache(cacheKey, result, TTL.WEATHER);
  return result;
}

function parseWeatherData(data, city) {
  const forecasts = data.list.map(item => ({
    dt: item.dt * 1000,
    date: new Date(item.dt * 1000).toLocaleDateString('en-IN'),
    time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
    feels_like: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    wind_speed: item.wind.speed,
    rain_chance: Math.round((item.pop || 0) * 100),
    main: item.weather[0].main,
  }));

  // Group by date
  const daily = {};
  forecasts.forEach(f => {
    if (!daily[f.date]) daily[f.date] = [];
    daily[f.date].push(f);
  });

  const dailySummary = Object.entries(daily).map(([date, items]) => ({
    date,
    avgTemp: Math.round(items.reduce((s, i) => s + i.temp, 0) / items.length),
    maxTemp: Math.max(...items.map(i => i.temp)),
    minTemp: Math.min(...items.map(i => i.temp)),
    maxRain: Math.max(...items.map(i => i.rain_chance)),
    mainWeather: items[Math.floor(items.length / 2)].main,
    icon: items[Math.floor(items.length / 2)].icon,
  }));

  return { city, forecasts, dailySummary, alerts: getWeatherAlerts(dailySummary) };
}

function getWeatherAlerts(dailySummary) {
  const alerts = [];
  dailySummary.forEach(day => {
    if (day.maxRain >= 70) alerts.push({ date: day.date, type: 'heavy_rain', message: `Heavy rain expected on ${day.date}`, severity: 'high' });
    else if (day.maxRain >= 40) alerts.push({ date: day.date, type: 'rain', message: `Rain likely on ${day.date}`, severity: 'medium' });
    if (day.maxTemp >= 42) alerts.push({ date: day.date, type: 'heat', message: `Extreme heat on ${day.date} (${day.maxTemp}°C)`, severity: 'high' });
    if (day.minTemp <= 2) alerts.push({ date: day.date, type: 'cold', message: `Near-freezing temperatures on ${day.date}`, severity: 'medium' });
  });
  return alerts;
}

export function getPrecautions(alerts) {
  const precautions = [];
  const types = new Set(alerts.map(a => a.type));
  if (types.has('heavy_rain')) precautions.push({ icon: '🌧️', text: 'Carry raincoat & umbrella', priority: 'high' }, { icon: '🚗', text: 'Expect road delays, drive slow', priority: 'high' });
  if (types.has('rain')) precautions.push({ icon: '☂️', text: 'Keep umbrella handy', priority: 'medium' });
  if (types.has('heat')) precautions.push({ icon: '🥤', text: 'Stay hydrated, carry water', priority: 'high' }, { icon: '🧴', text: 'Apply sunscreen SPF 50+', priority: 'medium' });
  if (types.has('cold')) precautions.push({ icon: '🧥', text: 'Pack warm layers & thermals', priority: 'high' });
  return precautions;
}

export const REROUTE_SUGGESTIONS = {
  'Nainital': { alternatives: ['Mukteshwar', 'Almora', 'Bhimtal'], reason: 'Heavy rain/landslide risk' },
  'Manali': { alternatives: ['Kullu', 'Kasol', 'Tirthan Valley'], reason: 'Road closures likely' },
  'Shimla': { alternatives: ['Kasauli', 'Chail', 'Narkanda'], reason: 'Heavy snow/rain' },
  'Mumbai': { alternatives: ['Pune', 'Lonavala', 'Nashik'], reason: 'Cyclone/flooding risk' },
  'Goa': { alternatives: ['Gokarna', 'Pondicherry', 'Alibaug'], reason: 'Cyclone alert' },
  'Rishikesh': { alternatives: ['Haridwar', 'Dehradun', 'Mussoorie'], reason: 'Flash flood risk' },
};
