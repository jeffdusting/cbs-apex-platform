// Simple in-memory rate limiting middleware
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const clients = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  clients.forEach((entry, key) => {
    if (now > entry.resetTime) {
      clients.delete(key);
    }
  });
}, 5 * 60 * 1000);

export function createRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: any, res: any, next: any) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const resetTime = now + windowMs;

    let entry = clients.get(clientId);

    if (!entry || now > entry.resetTime) {
      // New client or window expired
      entry = { count: 1, resetTime };
      clients.set(clientId, entry);
      return next();
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }

    // Increment count
    entry.count++;
    clients.set(clientId, entry);
    next();
  };
}

// Different rate limits for different endpoints
export const apiRateLimit = createRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const strictRateLimit = createRateLimit(20, 15 * 60 * 1000); // 20 requests per 15 minutes for expensive operations
export const conversationRateLimit = createRateLimit(30, 5 * 60 * 1000); // 30 conversations per 5 minutes