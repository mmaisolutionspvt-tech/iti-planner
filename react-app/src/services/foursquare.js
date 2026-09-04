// Free image fetcher using Wikipedia search API (no key required, CORS-enabled)
// Uses full-text search so "Chowpatty Beach" finds "Girgaon Chowpatty" etc.

const imageCache = new Map();

/**
 * Fetches a thumbnail image URL for a place via Wikipedia search.
 * Tries "PlaceName CityName" first, then just "PlaceName".
 * Returns a URL string or null.
 */
export async function fetchFoursquareImage(placeName, cityName) {
  const cacheKey = `${placeName}::${cityName}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  const queries = [
    `${placeName} ${cityName}`,
    placeName,
  ];

  for (const q of queries) {
    try {
      // Step 1: Search Wikipedia for the best matching article
      const searchUrl =
        `https://en.wikipedia.org/w/api.php?action=query&list=search` +
        `&srsearch=${encodeURIComponent(q)}&srlimit=1&format=json&origin=*`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const pageId = searchData?.query?.search?.[0]?.pageid;
      if (!pageId) continue;

      // Step 2: Get the thumbnail for that page
      const imgUrl =
        `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}` +
        `&prop=pageimages&pithumbsize=500&format=json&origin=*`;

      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) continue;
      const imgData = await imgRes.json();
      const src = imgData?.query?.pages?.[pageId]?.thumbnail?.source;

      if (src) {
        imageCache.set(cacheKey, src);
        return src;
      }
    } catch (err) {
      console.warn('[PlaceImage] Wikipedia search failed for', q, err.message);
    }
  }

  imageCache.set(cacheKey, null);
  return null;
}
