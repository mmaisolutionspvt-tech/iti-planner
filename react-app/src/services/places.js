import { toast } from 'react-toastify';

const GOOGLE_PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY || "";
const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

let cachedLocalData = null;

/**
 * Load local datasets as fallback for offline or API errors.
 */
async function loadLocalDataset() {
  if (cachedLocalData) return cachedLocalData;
  try {
    const [placesRes, locationsRes, hotelsRes] = await Promise.all([
      fetch('/data/tourist_places.json').then(r => r.json()).catch(() => []),
      fetch('/data/locations.json').then(r => r.json()).catch(() => []),
      fetch('/data/hotels.json').then(r => r.json()).catch(() => [])
    ]);

    cachedLocalData = {
      places: Array.isArray(placesRes) ? placesRes : [],
      locations: Array.isArray(locationsRes) ? locationsRes : [],
      hotels: Array.isArray(hotelsRes) ? hotelsRes : []
    };
    return cachedLocalData;
  } catch (err) {
    console.error("Error loading local fallback datasets:", err);
    return { places: [], locations: [], hotels: [] };
  }
}

/**
 * Search local datasets when Google API fails
 */
async function searchLocalDataset(query) {
  const { places, locations, hotels } = await loadLocalDataset();
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];

  const results = [];

  places.forEach(p => {
    if ((p.name && p.name.toLowerCase().includes(q)) || (p.city && p.city.toLowerCase().includes(q))) {
      results.push({
        placeId: `local_p_${p.id || p.name}`,
        text: `${p.name} (${p.city || 'India'})`,
        displayName: p.name,
        rawItem: p,
        source: 'local'
      });
    }
  });

  locations.forEach(l => {
    if ((l.title && l.title.toLowerCase().includes(q)) || (l.country && l.country.toLowerCase().includes(q))) {
      results.push({
        placeId: `local_l_${l.id || l.title}`,
        text: `${l.title} (${l.country || 'India'})`,
        displayName: l.title,
        rawItem: l,
        source: 'local'
      });
    }
  });

  hotels.forEach(h => {
    const name = h.property_name || h.name || 'Hotel';
    if (name.toLowerCase().includes(q) || (h.city && h.city.toLowerCase().includes(q))) {
      results.push({
        placeId: `local_h_${h.id || name}`,
        text: `${name} (${h.city || 'India'})`,
        displayName: name,
        rawItem: h,
        source: 'local'
      });
    }
  });

  return results.slice(0, 8);
}

/**
 * Get place details from local fallback dataset
 */
async function getLocalPlaceDetails(placeId) {
  const { places, locations, hotels } = await loadLocalDataset();

  let found = places.find(p => `local_p_${p.id || p.name}` === placeId);
  if (found) {
    return {
      id: placeId,
      placeId,
      name: found.name,
      displayName: found.name,
      lat: found.lat || 15.4989,
      lng: found.lng || 73.8278,
      location: { latitude: found.lat || 15.4989, longitude: found.lng || 73.8278 },
      rating: found.rating || 4.5,
      formattedAddress: `${found.name}, ${found.city || 'India'}`,
      address: `${found.name}, ${found.city || 'India'}`,
      entrance_fee_inr: found.entrance_fee_inr || 0,
      dslr_allowed: found.dslr_allowed || 'Yes',
      weekly_off: found.weekly_off || 'None',
      source: 'local'
    };
  }

  found = locations.find(l => `local_l_${l.id || l.title}` === placeId);
  if (found) {
    return {
      id: placeId,
      placeId,
      name: found.title,
      displayName: found.title,
      lat: found.lat || 20.5937,
      lng: found.lng || 78.9629,
      location: { latitude: found.lat || 20.5937, longitude: found.lng || 78.9629 },
      rating: found.rating || 4.7,
      formattedAddress: `${found.title}, ${found.country || 'India'}`,
      address: `${found.title}, ${found.country || 'India'}`,
      source: 'local'
    };
  }

  found = hotels.find(h => `local_h_${h.id || h.property_name}` === placeId);
  if (found) {
    const name = found.property_name || found.name || 'Hotel';
    return {
      id: placeId,
      placeId,
      name,
      displayName: name,
      lat: found.lat || 15.2993,
      lng: found.lng || 74.124,
      location: { latitude: found.lat || 15.2993, longitude: found.lng || 74.124 },
      rating: found.hotel_stars || 4.2,
      formattedAddress: `${name}, ${found.city || 'India'}`,
      address: `${name}, ${found.city || 'India'}`,
      source: 'local'
    };
  }

  return {
    id: placeId,
    placeId,
    name: 'India Landmark',
    displayName: 'India Landmark',
    lat: 20.5937,
    lng: 78.9629,
    location: { latitude: 20.5937, longitude: 78.9629 },
    rating: 4.5,
    formattedAddress: 'India',
    address: 'India',
    source: 'local'
  };
}

/**
 * 1. PLACES SEARCH + AUTOCOMPLETE
 * Replace local CSV search with Google Places API (New).
 */
export async function searchPlaces(query) {
  if (!query || !query.trim()) return [];

  try {
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
      },
      body: JSON.stringify({
        input: query.trim(),
        includedRegionCodes: ['in']
      })
    });

    if (!res.ok) {
      throw new Error(`Google Places API returned status ${res.status}`);
    }

    const data = await res.json();
    const suggestions = data.suggestions || [];

    if (suggestions.length === 0) {
      return searchLocalDataset(query);
    }

    return suggestions.map(s => {
      const pred = s.placePrediction || {};
      const textVal = pred.text?.text || (typeof pred.text === 'string' ? pred.text : 'Unknown Place');
      const mainText = pred.structuredFormat?.mainText?.text || textVal;
      return {
        placeId: pred.placeId,
        text: textVal, // Full text for display in dropdown
        displayName: mainText, // Short name for the input field
        source: 'google'
      };
    }).filter(item => item.placeId);

  } catch (err) {
    console.error("Google API failed, falling back to local dataset:", err.message || err);
    toast.warn("Using offline data. Some suggestions may be limited", { toastId: 'google-fallback-warn' });
    return searchLocalDataset(query);
  }
}

/**
 * Get detailed place information by placeId
 */
export async function getPlaceDetails(placeId) {
  if (!placeId) return null;

  if (placeId.startsWith('local_')) {
    return getLocalPlaceDetails(placeId);
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'id,displayName,location,rating,formattedAddress,websiteUri,photos'
      }
    });

    if (!res.ok) {
      throw new Error(`Google Place Details API returned status ${res.status}`);
    }

    const data = await res.json();
    const name = data.displayName?.text || 'Attraction';
    const lat = data.location?.latitude || 0;
    const lng = data.location?.longitude || 0;

    return {
      id: data.id || placeId,
      placeId: data.id || placeId,
      name,
      displayName: name,
      lat,
      lng,
      location: data.location || { latitude: lat, longitude: lng },
      rating: data.rating || 4.5,
      formattedAddress: data.formattedAddress || '',
      address: data.formattedAddress || '',
      websiteUri: data.websiteUri || null,
      photos: data.photos || [],
      source: 'google'
    };

  } catch (err) {
    console.error("Google API failed, falling back to local dataset:", err.message || err);
    toast.warn("Using offline data. Some suggestions may be limited", { toastId: 'google-details-fallback-warn' });
    return getLocalPlaceDetails(placeId);
  }
}

/**
 * Helper to geocode a city name into {lat, lng} coordinates
 */
export async function geocodeCity(cityName) {
  if (!cityName) return null;
  const q = cityName.toLowerCase().trim();
  
  // Try local hardcoded first for speed
  const CITY_COORDS = {
    'shimla': { lat: 31.1048, lng: 77.1734 },
    'goa': { lat: 15.2993, lng: 74.1240 },
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'manali': { lat: 32.2432, lng: 77.1892 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'rishikesh': { lat: 30.0869, lng: 78.2676 }
  };

  const localMatch = Object.keys(CITY_COORDS).find(k => q.includes(k));
  if (localMatch) {
    return CITY_COORDS[localMatch];
  }

  // Fallback to Google API
  try {
    const suggestions = await searchPlaces(cityName);
    if (suggestions && suggestions.length > 0) {
      const details = await getPlaceDetails(suggestions[0].placeId);
      if (details && details.lat && details.lng) {
        return { lat: details.lat, lng: details.lng };
      }
    }
  } catch (err) {
    console.error("Geocoding failed for:", cityName, err);
  }

  return null;
}
