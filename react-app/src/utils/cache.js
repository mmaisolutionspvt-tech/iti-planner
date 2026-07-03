export function getCached(key) {
  try {
    const raw = localStorage.getItem(`ff_cache_${key}`);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(`ff_cache_${key}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(key, data, ttlMs) {
  try {
    localStorage.setItem(`ff_cache_${key}`, JSON.stringify({
      data,
      expiry: Date.now() + ttlMs,
    }));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}

export function clearCache(key) {
  localStorage.removeItem(`ff_cache_${key}`);
}

// TTL presets
export const TTL = {
  WEATHER: 3 * 60 * 60 * 1000,     // 3 hours
  RESTAURANTS: 7 * 24 * 60 * 60 * 1000, // 7 days
  DISTANCE: 30 * 24 * 60 * 60 * 1000,   // 30 days
};
