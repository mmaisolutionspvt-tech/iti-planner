// Foursquare Places API v2 — uses client_id + client_secret (confirmed working for India)
const FSQ_CLIENT_ID     = import.meta.env.VITE_FOURSQUARE_CLIENT_ID     || '';
const FSQ_CLIENT_SECRET = import.meta.env.VITE_FOURSQUARE_CLIENT_SECRET || '';
const FSQ_VERSION       = '20231001'; // v2 date-versioning
const FSQ_BASE          = 'https://api.foursquare.com/v2';

// Build common query-string auth params
function authParams() {
  return `client_id=${FSQ_CLIENT_ID}&client_secret=${FSQ_CLIENT_SECRET}&v=${FSQ_VERSION}`;
}

// In-memory cache — same place is never fetched twice per session
const imageCache = new Map();

/**
 * Fetches a real photo URL for a place using Foursquare Places API v2.
 * Returns null on any failure so callers can render without an image.
 */
export async function fetchFoursquareImage(placeName, cityName) {
  if (!FSQ_CLIENT_ID || !FSQ_CLIENT_SECRET) return null;

  const cacheKey = `${placeName}::${cityName}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    // Step 1: Search for the venue by name near city
    const searchUrl = `${FSQ_BASE}/venues/search?near=${encodeURIComponent(cityName + ', India')}&query=${encodeURIComponent(placeName)}&limit=1&intent=checkin&${authParams()}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) { imageCache.set(cacheKey, null); return null; }
    const searchData = await searchRes.json();
    const venueId = searchData.response?.venues?.[0]?.id;
    if (!venueId) { imageCache.set(cacheKey, null); return null; }

    // Step 2: Get photos for that venue
    const photoUrl = `${FSQ_BASE}/venues/${venueId}/photos?limit=1&${authParams()}`;
    const photoRes = await fetch(photoUrl);
    if (!photoRes.ok) { imageCache.set(cacheKey, null); return null; }
    const photoData = await photoRes.json();
    const photo = photoData.response?.photos?.items?.[0];
    if (!photo?.prefix || !photo?.suffix) { imageCache.set(cacheKey, null); return null; }

    const imageUrl = `${photo.prefix}400x300${photo.suffix}`;
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (err) {
    console.warn('[Foursquare] Failed for', placeName, err.message);
    imageCache.set(cacheKey, null);
    return null;
  }
}
