// Simple in-memory response cache
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  });
}, 10 * 60 * 1000);

export function createCacheMiddleware(ttl: number = 5 * 60 * 1000) {
  return (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.method}:${req.originalUrl || req.url}`;
    const entry = cache.get(key);
    const now = Date.now();

    // Check if we have a valid cached response
    if (entry && (now - entry.timestamp) < entry.ttl) {
      return res.json(entry.data);
    }

    // Intercept the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, {
          data,
          timestamp: now,
          ttl
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

// Cache configurations for different endpoints
export const shortCache = createCacheMiddleware(2 * 60 * 1000); // 2 minutes
export const mediumCache = createCacheMiddleware(5 * 60 * 1000); // 5 minutes
export const longCache = createCacheMiddleware(15 * 60 * 1000); // 15 minutes

// Function to invalidate cache patterns
export function invalidateCache(pattern: string) {
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}