import { toast } from 'react-toastify';
import { haversineDistance, calculateETA } from '../utils/haversine';

const ORS_KEY = import.meta.env.VITE_ORS_KEY || "";
const ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

/**
 * 2. ROUTING + TIME/DISTANCE
 * Use OpenRouteService for accurate driving time between states.
 * 
 * @param {Array} coordinatesArray - Array of coordinates [ [lng, lat], [lng, lat], ... ] or [ {lat, lng}, ... ]
 */
export async function getRoute(coordinatesArray) {
  if (!coordinatesArray || coordinatesArray.length < 2) {
    return null;
  }

  // Normalize coordinates to [ [lng, lat], [lng, lat] ]
  const formattedCoords = coordinatesArray.map(c => {
    if (Array.isArray(c)) {
      // Assuming array input is already [lng, lat] based on RouteMapPanel
      return [Number(c[0]), Number(c[1])];
    }
    if (typeof c === 'object' && c.lat !== undefined && c.lng !== undefined) {
      return [Number(c.lng), Number(c.lat)];
    }
    return [78.9629, 20.5937];
  });

  try {
    const requestBody = {
      coordinates: formattedCoords,
      instructions: false
    };
    console.log("ORS Request:", JSON.stringify(requestBody));

    const res = await fetch(ORS_URL, {
      method: 'POST',
      headers: {
        'Authorization': ORS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      throw new Error(`OpenRouteService API returned status ${res.status}`);
    }

    const data = await res.json();
    console.log("ORS Response:", data);
    const routeFeature = data.features?.[0];

    if (!routeFeature) {
      throw new Error("No route feature returned from ORS API");
    }

    const summary = routeFeature.properties?.summary || {};
    const distanceKm = Math.round((summary.distance || 0) / 1000 * 10) / 10;
    
    let durationSec = summary.duration || 0;
    // ORS calculates theoretical duration assuming free-flowing traffic at max speed limits.
    // For Indian road conditions (tolls, traffic, terrain), we cap the average speed to 60 km/h.
    const avgSpeedKmH = distanceKm / (durationSec / 3600);
    if (avgSpeedKmH > 60) {
      durationSec = (distanceKm / 60) * 3600;
    }

    const hours = Math.floor(durationSec / 3600);
    const minutes = Math.round((durationSec % 3600) / 60);

    // ORS geometry coordinates are [[lng, lat], [lng, lat], ...]
    // Leaflet Polyline expects [[lat, lng], [lat, lng], ...]
    const rawGeometry = routeFeature.geometry?.coordinates || [];
    const leafletPolyline = rawGeometry.map(coord => [coord[1], coord[0]]);

    // Calculate fuel cost (assuming 15 km/L @ ₹96/L)
    const fuelCostInr = Math.round((distanceKm / 15) * 96);

    return {
      distanceKm,
      durationDisplay: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      totalMinutes: Math.round(durationSec / 60),
      fuelCostInr,
      polylineCoords: leafletPolyline,
      source: 'ors'
    };

  } catch (err) {
    console.error("ORS failed, using haversine distance fallback:", err.message || err);
    toast.warn("Routing offline. Time estimates are approximate", { toastId: 'ors-fallback-warn' });
    return getHaversineFallbackRoute(formattedCoords);
  }
}

/**
 * Fallback route using straight-line Haversine formula + 50 km/h average speed
 */
function getHaversineFallbackRoute(formattedCoords) {
  let totalDistanceKm = 0;
  const polylineCoords = [];

  for (let i = 0; i < formattedCoords.length; i++) {
    const [lng, lat] = formattedCoords[i];
    polylineCoords.push([lat, lng]);

    if (i > 0) {
      const [prevLng, prevLat] = formattedCoords[i - 1];
      totalDistanceKm += haversineDistance(prevLat, prevLng, lat, lng);
    }
  }

  const distKm = Math.round(totalDistanceKm * 10) / 10;
  const eta = calculateETA(distKm, 50); // 50 km/h avg speed
  const fuelCostInr = Math.round((distKm / 15) * 96);

  return {
    distanceKm: distKm,
    durationDisplay: eta.display,
    totalMinutes: eta.totalMinutes,
    fuelCostInr,
    polylineCoords,
    source: 'haversine'
  };
}
