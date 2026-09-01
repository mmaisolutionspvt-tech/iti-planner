const FSQ_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY || '';
const FSQ_BASE = 'https://api.foursquare.com/v3';
const FSQ_HEADERS = { 'Authorization': FSQ_API_KEY, 'Accept': 'application/json' };

// In-memory cache so same place isn't fetched twice
const imageCache = new Map();

/**
 * Fetches a single image URL for a place using Foursquare Places API v3.
 * Returns null on failure so callers can show fallback UI.
 */
export async function fetchFoursquareImage(placeName, cityName) {
  const cacheKey = `${placeName}::${cityName}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    // Step 1: Search for the place by name near city
    const searchRes = await fetch(
      `${FSQ_BASE}/places/search?query=${encodeURIComponent(placeName)}&near=${encodeURIComponent(cityName + ', India')}&limit=1`,
      { headers: FSQ_HEADERS }
    );
    if (!searchRes.ok) { imageCache.set(cacheKey, null); return null; }
    const searchData = await searchRes.json();
    const fsqId = searchData.results?.[0]?.fsq_id;
    if (!fsqId) { imageCache.set(cacheKey, null); return null; }

    // Step 2: Get photos for that place
    const photoRes = await fetch(
      `${FSQ_BASE}/places/${fsqId}/photos?limit=1`,
      { headers: FSQ_HEADERS }
    );
    if (!photoRes.ok) { imageCache.set(cacheKey, null); return null; }
    const photos = await photoRes.json();
    const photo = photos?.[0];
    if (!photo?.prefix || !photo?.suffix) { imageCache.set(cacheKey, null); return null; }

    const imageUrl = `${photo.prefix}400x300${photo.suffix}`;
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (err) {
    console.warn('[Foursquare] Image fetch failed for', placeName, err.message);
    imageCache.set(cacheKey, null);
    return null;
  }
}
