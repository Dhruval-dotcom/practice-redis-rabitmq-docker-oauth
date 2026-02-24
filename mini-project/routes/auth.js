/**
 * Auth Routes - Signup, Login, Logout
 *
 * REDIS USAGE:
 * - User data stored as Hash:   "user:<email>" → { name, email, password }
 * - Session stored as String:   "session:<userId>" → JWT token
 * - Session has TTL (auto-expires after 24 hours)
 *
 * WHY STORE USERS IN REDIS?
 * In a real app, users go in a database (PostgreSQL, MongoDB).
 * Here we use Redis to keep things simple and focused on learning Redis.
 * The patterns (hashing, sessions, TTL) are the same regardless.
 */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redis = require("../config/redis");

const router = express.Router();

const SESSION_TTL = 86400; // 24 hours in seconds

// ==========================================
// POST /auth/signup - Create a new account
// ==========================================
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "name, email, and password are required",
    });
  }

  // Check if user already exists (check Redis hash)
  const existingUser = await redis.hGetAll(`user:${email}`);

  if (existingUser && existingUser.email) {
    return res.status(409).json({
      success: false,
      error: "Email already registered",
    });
  }

  // Hash the password (NEVER store plain text passwords!)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user in Redis as a Hash
  // Key: "user:dhruval@example.com"
  // Fields: { name, email, password, createdAt }
  const userId = Date.now().toString(); // simple unique ID

  await redis.hSet(`user:${email}`, {
    id: userId,
    name: name,
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });

  console.log(`  New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: "Account created! Now login with POST /auth/login",
  });
});

// ==========================================
// POST /auth/login - Login and get a token
// ==========================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "email and password are required",
    });
  }

  // Find user in Redis
  const user = await redis.hGetAll(`user:${email}`);

  if (!user || !user.email) {
    return res.status(401).json({
      success: false,
      error: "Invalid email or password",
    });
  }

  // Compare password with stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      error: "Invalid email or password",
    });
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Store session in Redis (so we can invalidate it on logout)
  // Key: "session:<userId>" → token
  // TTL: 24 hours (auto-deletes = auto-logout)
  await redis.set(`session:${user.id}`, token, { EX: SESSION_TTL });

  console.log(`  User logged in: ${email}`);

  res.json({
    success: true,
    message: "Logged in!",
    token: token,
    tip: 'Use this token in header: "Authorization: Bearer <token>"',
  });
});

// ==========================================
// POST /auth/logout - Destroy session
// ==========================================
router.post("/logout", async (req, res) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ success: true, message: "Already logged out" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Delete session from Redis → token becomes useless
    await redis.del(`session:${decoded.userId}`);

    console.log(`  User logged out: ${decoded.email}`);

    res.json({
      success: true,
      message: "Logged out! Token is now invalid.",
    });
  } catch {
    res.json({ success: true, message: "Already logged out" });
  }
});

module.exports = router;
