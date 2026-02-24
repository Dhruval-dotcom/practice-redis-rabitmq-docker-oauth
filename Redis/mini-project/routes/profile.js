/**
 * Profile Route - Protected endpoint (requires login)
 *
 * This shows how auth middleware protects routes.
 * Only logged-in users with a valid token can access these.
 */

const express = require("express");
const authMiddleware = require("../middleware/auth");
const redis = require("../config/redis");

const router = express.Router();

// ==========================================
// GET /profile - Get your profile (PROTECTED)
// ==========================================
router.get("/", authMiddleware, async (req, res) => {
  // req.user is set by auth middleware (from JWT token)
  const user = await redis.hGetAll(`user:${req.user.email}`);

  // Get session TTL (how long until auto-logout)
  const sessionTTL = await redis.ttl(`session:${req.user.userId}`);

  res.json({
    success: true,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      memberSince: user.createdAt,
    },
    session: {
      expiresIn: `${Math.floor(sessionTTL / 3600)}h ${Math.floor((sessionTTL % 3600) / 60)}m`,
      secondsLeft: sessionTTL,
    },
  });
});

module.exports = router;
