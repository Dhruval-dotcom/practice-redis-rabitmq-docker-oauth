/**
 * 09 - Session Management with Redis
 *
 * Run: node 09-session-store.js
 * Then open: http://localhost:3000
 *
 * THE PROBLEM:
 * When a user logs in, you need to remember "this user is logged in".
 * Without Redis, you store sessions in memory → lost when server restarts!
 *
 * THE SOLUTION:
 * Store sessions in Redis → survives server restarts, shared across servers.
 *
 * HOW IT WORKS:
 * 1. User logs in → create a random session ID → save user data in Redis
 * 2. Send session ID to browser as a cookie
 * 3. Next request → browser sends cookie → look up session in Redis
 * 4. User logs out → delete session from Redis
 */

const { createClient } = require("redis");
const express = require("express");
const crypto = require("crypto");

const app = express();
const client = createClient();

const SESSION_TTL = 3600; // 1 hour in seconds

// -------- Session Helper Functions --------

async function createSession(userData) {
  // Generate a random session ID (like: "sess_a3f8b2c1d4e5...")
  const sessionId = "sess_" + crypto.randomBytes(16).toString("hex");

  // Save user data in Redis with expiry
  await client.set(`session:${sessionId}`, JSON.stringify(userData), {
    EX: SESSION_TTL,
  });

  console.log(`  Created session: ${sessionId}`);
  return sessionId;
}

async function getSession(sessionId) {
  const data = await client.get(`session:${sessionId}`);
  if (!data) return null;

  // Reset expiry on every access (sliding expiration)
  // User stays logged in as long as they're active
  await client.expire(`session:${sessionId}`, SESSION_TTL);

  return JSON.parse(data);
}

async function deleteSession(sessionId) {
  await client.del(`session:${sessionId}`);
  console.log(`  Deleted session: ${sessionId}`);
}

// -------- API Routes --------

// Login - creates a session
app.get("/login", async (req, res) => {
  const user = {
    id: 1,
    name: "Dhruval",
    email: "dhruval@example.com",
    loginAt: new Date().toISOString(),
  };

  const sessionId = await createSession(user);

  // In real app, you'd set this as an HTTP-only cookie
  // For simplicity, we return it in JSON
  res.json({
    message: "Logged in!",
    sessionId: sessionId,
    tip: "Copy the sessionId and visit /profile?session=<sessionId>",
  });
});

// Profile - requires valid session
app.get("/profile", async (req, res) => {
  const sessionId = req.query.session;

  if (!sessionId) {
    return res.status(401).json({
      error: "No session provided",
      tip: "Visit /login first, then use the sessionId",
    });
  }

  const user = await getSession(sessionId);

  if (!user) {
    return res.status(401).json({
      error: "Session expired or invalid",
      tip: "Visit /login to get a new session",
    });
  }

  res.json({
    message: "Welcome back!",
    user: user,
    sessionTTL: await client.ttl(`session:${sessionId}`),
  });
});

// Logout - deletes the session
app.get("/logout", async (req, res) => {
  const sessionId = req.query.session;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.json({ message: "Logged out! Session destroyed." });
});

// Home - instructions
app.get("/", (req, res) => {
  res.json({
    message: "Redis Session Demo",
    routes: {
      "GET /login": "Login and get a session ID",
      "GET /profile?session=<id>": "View profile (needs valid session)",
      "GET /logout?session=<id>": "Logout and destroy session",
    },
  });
});

// -------- Start Server --------

async function main() {
  await client.connect();
  console.log("Connected to Redis!");

  app.listen(3000, () => {
    console.log("\nServer running on http://localhost:3000");
    console.log("\nTry this flow:");
    console.log("  1. Visit http://localhost:3000/login");
    console.log("  2. Copy the sessionId from response");
    console.log("  3. Visit http://localhost:3000/profile?session=YOUR_SESSION_ID");
    console.log("  4. Visit http://localhost:3000/logout?session=YOUR_SESSION_ID");
    console.log("  5. Try /profile again - session is gone!\n");
    console.log("Press Ctrl+C to stop the server.");
  });
}

main();
