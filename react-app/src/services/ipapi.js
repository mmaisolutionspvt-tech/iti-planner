import { getCached, setCache } from '../utils/cache';

export async function getUserCity() {
  const cached = getCached('user_city');
  if (cached) return cached;

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return { city: 'Delhi', region: 'Delhi', country: 'IN' };
    const data = await res.json();
    const result = { city: data.city, region: data.region, country: data.country_code, lat: data.latitude, lng: data.longitude };
    setCache('user_city', result, 24 * 60 * 60 * 1000);
    return result;
  } catch {
    return { city: 'Delhi', region: 'Delhi', country: 'IN' };
  }
}
