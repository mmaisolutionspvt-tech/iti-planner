import { getCached, setCache, TTL } from '../utils/cache';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

export async function fetchWeather(city) {
  const cacheKey = `weather:${city}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { allowed } = checkRateLimit(RATE_LIMITS.WEATHER.key, RATE_LIMITS.WEATHER.max, RATE_LIMITS.WEATHER.windowMs);
  if (!allowed) throw new Error('Weather API rate limit reached. Try again in a minute.');

  const res = await fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
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
