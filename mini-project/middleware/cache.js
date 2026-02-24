/**
 * Cache Middleware
 *
 * HOW IT WORKS:
 * 1. Request comes in → check if response is cached in Redis
 * 2. If YES (cache HIT) → send cached response immediately, skip route handler
 * 3. If NO (cache MISS) → run route handler → save response in Redis for next time
 *
 * THE TRICK:
 * We override res.json() to intercept the response.
 * When the route handler calls res.json(data), we:
 * - Save the data in Redis
 * - Send the data to the client
 * Next time, we skip the route handler entirely!
 *
 * CACHE KEY:
 * We use the URL as the cache key: "cache:GET:/api/posts"
 * Different URLs = different cache entries
 */

const redis = require("../config/redis");

function cache({ ttl = 300 } = {}) {
  // ttl = time to live in seconds (default 5 minutes)

  return async (req, res, next) => {
    // Only cache GET requests (don't cache POST, PUT, DELETE)
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.method}:${req.originalUrl}`;

    // Step 1: Check Redis for cached response
    const cached = await redis.get(cacheKey);

    if (cached) {
      // Cache HIT! Send cached data immediately
      console.log(`  CACHE HIT: ${req.originalUrl}`);
      const data = JSON.parse(cached);
      return res.json({ ...data, _cached: true });
    }

    // Cache MISS - let the route handler run
    console.log(`  CACHE MISS: ${req.originalUrl}`);

    // Step 2: Override res.json to intercept the response
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      // Save to Redis before sending to client
      await redis.set(cacheKey, JSON.stringify(data), { EX: ttl });
      console.log(`  CACHED: ${req.originalUrl} (TTL: ${ttl}s)`);

      // Send to client
      return originalJson({ ...data, _cached: false });
    };

    next();
  };
}

module.exports = cache;
