// Haversine formula to calculate distance between two coordinates
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Calculate ETA at given average speed (default 50 km/h)
export function calculateETA(distanceKm, avgSpeedKmh = 50) {
  const hours = distanceKm / avgSpeedKmh;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return { hours: h, minutes: m, totalMinutes: Math.round(hours * 60), display: `${h}h ${m}m` };
}

// Calculate estimated fare
export function calculateFare(distanceKm, pricePerKm) {
  return Math.round(distanceKm * pricePerKm);
}
