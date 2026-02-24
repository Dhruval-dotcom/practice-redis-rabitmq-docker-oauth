/**
 * 10 - Rate Limiting with Redis
 *
 * Run: node 10-rate-limiter.js
 * Then open: http://localhost:3000
 *
 * THE PROBLEM:
 * Someone sends 10,000 requests per second to your API.
 * Your server crashes. Your database melts.
 *
 * THE SOLUTION:
 * Use Redis to count requests per user. If they exceed the limit → block them.
 *
 * HOW IT WORKS (Sliding Window):
 * - Each user gets a counter in Redis: "ratelimit:user_ip"
 * - Counter expires after the time window (e.g., 60 seconds)
 * - Each request increments the counter
 * - If counter > limit → return 429 Too Many Requests
 */

const { createClient } = require("redis");
const express = require("express");

const app = express();
const client = createClient();

const RATE_LIMIT = 5; // max 5 requests
const WINDOW_SECONDS = 60; // per 60 seconds

/**
 * Rate Limiter Middleware
 * Sits between the request and your route handler.
 * Checks if user has exceeded their limit.
 */
async function rateLimiter(req, res, next) {
  // Use IP address as the identifier (in real apps, use user ID or API key)
  const ip = req.ip;
  const key = `ratelimit:${ip}`;

  // Increment the counter
  const requests = await client.incr(key);

  if (requests === 1) {
    // First request - set the expiry window
    await client.expire(key, WINDOW_SECONDS);
  }

  // Get remaining time
  const ttl = await client.ttl(key);

  // Add rate limit info to response headers (industry standard)
  res.set({
    "X-RateLimit-Limit": RATE_LIMIT,
    "X-RateLimit-Remaining": Math.max(0, RATE_LIMIT - requests),
    "X-RateLimit-Reset": ttl,
  });

  if (requests > RATE_LIMIT) {
    console.log(`  BLOCKED ${ip} - ${requests}/${RATE_LIMIT} requests`);
    return res.status(429).json({
      error: "Too many requests!",
      message: `You can make ${RATE_LIMIT} requests per ${WINDOW_SECONDS} seconds`,
      retryAfter: ttl + " seconds",
      currentCount: requests,
    });
  }

  console.log(`  ALLOWED ${ip} - ${requests}/${RATE_LIMIT} requests`);
  next(); // Allow the request through
}

// -------- Routes --------

// Apply rate limiter to all routes
app.use(rateLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "Redis Rate Limiter Demo",
    instructions: "Refresh this page quickly 6+ times to get rate limited!",
    routes: {
      "GET /api/data": "A fake API endpoint (also rate limited)",
    },
  });
});

app.get("/api/data", (req, res) => {
  res.json({
    message: "Here's your data!",
    data: { price: 42.5, symbol: "AAPL", change: "+1.2%" },
    tip: "Keep refreshing - you'll get blocked after 5 requests!",
  });
});

// -------- Start Server --------

async function main() {
  await client.connect();
  console.log("Connected to Redis!");

  app.listen(3000, () => {
    console.log("\nServer running on http://localhost:3000");
    console.log(`\nRate limit: ${RATE_LIMIT} requests per ${WINDOW_SECONDS} seconds`);
    console.log("Refresh the page quickly 6+ times to see rate limiting in action!\n");
    console.log("Press Ctrl+C to stop the server.");
  });
}

main();
