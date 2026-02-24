/**
 * Redis Auth API - Mini Project
 *
 * Run: node server.js
 * Then test with the curl commands below or use Postman/Thunder Client
 *
 * ============================================
 * ARCHITECTURE:
 * ============================================
 *
 *   Client (Browser/Postman)
 *      │
 *      ▼
 *   Express Server
 *      │
 *      ├── Rate Limiter Middleware ──→ Redis (request counters)
 *      │
 *      ├── Auth Routes (/auth/*)
 *      │     ├── signup ──→ Redis Hash (user data)
 *      │     ├── login  ──→ Redis String (session token)
 *      │     └── logout ──→ Redis DEL (destroy session)
 *      │
 *      ├── Posts Routes (/posts/*)
 *      │     ├── GET  ──→ Cache Middleware ──→ Redis (cached responses)
 *      │     └── POST ──→ Auth Middleware  ──→ Redis (verify session)
 *      │
 *      └── Profile Route (/profile)
 *            └── GET ──→ Auth Middleware ──→ Redis (verify + get user)
 *
 * ============================================
 * HOW TO TEST (copy-paste these commands):
 * ============================================
 *
 * 1. SIGNUP:
 *    curl -X POST http://localhost:3000/auth/signup \
 *      -H "Content-Type: application/json" \
 *      -d '{"name": "Dhruval", "email": "dhruval@test.com", "password": "123456"}'
 *
 * 2. LOGIN (copy the token from response):
 *    curl -X POST http://localhost:3000/auth/login \
 *      -H "Content-Type: application/json" \
 *      -d '{"email": "dhruval@test.com", "password": "123456"}'
 *
 * 3. VIEW PROFILE (replace TOKEN):
 *    curl http://localhost:3000/profile \
 *      -H "Authorization: Bearer TOKEN"
 *
 * 4. GET POSTS (try twice - second is cached!):
 *    curl http://localhost:3000/posts
 *
 * 5. CREATE POST (requires login):
 *    curl -X POST http://localhost:3000/posts \
 *      -H "Content-Type: application/json" \
 *      -H "Authorization: Bearer TOKEN" \
 *      -d '{"title": "My First Post", "body": "Hello World!"}'
 *
 * 6. LOGOUT:
 *    curl -X POST http://localhost:3000/auth/logout \
 *      -H "Authorization: Bearer TOKEN"
 *
 * 7. TRY PROFILE AGAIN (should fail - logged out!):
 *    curl http://localhost:3000/profile \
 *      -H "Authorization: Bearer TOKEN"
 *
 * 8. RATE LIMIT TEST (run this fast, 20+ times):
 *    curl http://localhost:3000/posts
 */

require("dotenv").config();
const express = require("express");
const redis = require("./config/redis");
const rateLimiter = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const profileRoutes = require("./routes/profile");

const app = express();

// -------- Global Middleware --------

// Parse JSON request bodies
app.use(express.json());

// Rate limit ALL routes: 20 requests per 60 seconds
app.use(rateLimiter({ maxRequests: 20, windowSeconds: 60 }));

// -------- Routes --------

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/profile", profileRoutes);

// Home - API documentation
app.get("/", (req, res) => {
  res.json({
    name: "Redis Auth API",
    message: "A mini project to learn Redis with Express",
    redisPatterns: {
      "Hash": "Stores user data (user:email → {name, email, password})",
      "String + TTL": "Stores sessions (session:userId → token, expires 24h)",
      "INCR + TTL": "Rate limiting (ratelimit:ip → count, expires 60s)",
      "String + TTL": "Response caching (cache:GET:/posts → JSON, expires 30s)",
    },
    routes: {
      "POST /auth/signup": "Create account (name, email, password)",
      "POST /auth/login": "Login and get JWT token",
      "POST /auth/logout": "Logout (destroys session in Redis)",
      "GET  /profile": "View your profile (requires token)",
      "GET  /posts": "List all posts (cached 30s)",
      "GET  /posts/:id": "Get one post (cached 60s)",
      "POST /posts": "Create a post (requires token)",
    },
  });
});

// -------- Start Server --------

async function main() {
  await redis.connect();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log("\n--- Quick Test Commands ---\n");
    console.log("1. Signup:");
    console.log(
      `   curl -X POST http://localhost:${PORT}/auth/signup -H "Content-Type: application/json" -d '{"name":"Dhruval","email":"dhruval@test.com","password":"123456"}'`
    );
    console.log("\n2. Login:");
    console.log(
      `   curl -X POST http://localhost:${PORT}/auth/login -H "Content-Type: application/json" -d '{"email":"dhruval@test.com","password":"123456"}'`
    );
    console.log("\n3. Posts (try twice - second is instant!):");
    console.log(`   curl http://localhost:${PORT}/posts`);
    console.log("\nPress Ctrl+C to stop.\n");
  });
}

main();
