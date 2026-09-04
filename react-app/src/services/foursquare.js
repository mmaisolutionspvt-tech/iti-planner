// Free image fetcher — NO API key required
// Uses Wikipedia's public page-images API (CORS-enabled with origin=*)
// Falls back gracefully to null so callers can skip the image block.

const imageCache = new Map();

/**
 * Fetches a thumbnail image URL for a place/attraction via Wikipedia.
 * Returns a URL string or null.
 */
export async function fetchFoursquareImage(placeName, cityName) {
  const cacheKey = `${placeName}::${cityName}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  // Try exact place name first, then "PlaceName CityName" as fallback
  const queries = [placeName, `${placeName} ${cityName}`];

  for (const query of queries) {
    try {
      const url =
        `https://en.wikipedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(query)}` +
        `&prop=pageimages&format=json&pithumbsize=400&origin=*`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const pages = data?.query?.pages || {};
      const page  = Object.values(pages)[0];
      const src   = page?.thumbnail?.source;

      if (src) {
        imageCache.set(cacheKey, src);
        return src;
      }
    } catch (err) {
      console.warn('[PlaceImage] Wikipedia fetch failed for', query, err.message);
    }
  }

  imageCache.set(cacheKey, null);
  return null;
}
