const buckets = new Map();

export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  if (!buckets.has(key)) {
    buckets.set(key, { requests: [], windowMs, maxRequests });
  }
  const bucket = buckets.get(key);
  bucket.requests = bucket.requests.filter(t => now - t < windowMs);
  if (bucket.requests.length >= maxRequests) {
    return { allowed: false, retryAfterMs: windowMs - (now - bucket.requests[0]) };
  }
  bucket.requests.push(now);
  return { allowed: true };
}

// Pre-configured limiters
export const RATE_LIMITS = {
  GEMINI: { key: 'gemini', max: 30, windowMs: 60000 },
  FLIGHTS: { key: 'flights', max: 3, windowMs: 60000 },
  WEATHER: { key: 'weather', max: 50, windowMs: 60000 },
};
