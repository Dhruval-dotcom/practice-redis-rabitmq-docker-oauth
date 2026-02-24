/**
 * Rate Limiter Middleware
 *
 * HOW IT WORKS:
 * - Each IP address gets a counter in Redis: "ratelimit:<ip>"
 * - Every request increments the counter
 * - Counter auto-resets after the time window (using TTL)
 * - If counter > limit → block the request with 429 status
 *
 * WHY REDIS?
 * If you stored this in memory (a JS object), it would:
 * - Reset when server restarts
 * - Not work with multiple servers (each has its own memory)
 * Redis solves both problems.
 */

const redis = require("../config/redis");

function rateLimiter({ maxRequests = 10, windowSeconds = 60 } = {}) {
  return async (req, res, next) => {
    const ip = req.ip;
    const key = `ratelimit:${ip}`;

    // INCR creates the key if it doesn't exist (starts at 1)
    const requests = await redis.incr(key);

    // First request? Set the expiry window
    if (requests === 1) {
      await redis.expire(key, windowSeconds);
    }

    // How many seconds until the window resets?
    const ttl = await redis.ttl(key);

    // Add info to response headers (industry standard)
    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": Math.max(0, maxRequests - requests),
      "X-RateLimit-Reset": ttl,
    });

    // Too many requests? Block!
    if (requests > maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Too many requests",
        retryAfter: `${ttl} seconds`,
      });
    }

    next(); // Allow request through
  };
}

module.exports = rateLimiter;
