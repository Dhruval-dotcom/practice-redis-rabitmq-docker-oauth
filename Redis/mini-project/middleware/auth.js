/**
 * Auth Middleware
 *
 * HOW IT WORKS:
 * 1. User sends request with "Authorization: Bearer <token>" header
 * 2. We verify the JWT token is valid (not expired, not tampered)
 * 3. We check if the token exists in Redis (hasn't been logged out)
 * 4. If all good → attach user info to req.user → let request through
 *
 * WHY CHECK REDIS?
 * JWT tokens are valid until they expire. But what if user logs out?
 * The token is still valid! So we store active sessions in Redis.
 * On logout → delete from Redis → token becomes useless.
 */

const jwt = require("jsonwebtoken");
const redis = require("../config/redis");

async function auth(req, res, next) {
  // Step 1: Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "No token provided",
      tip: "Add header: Authorization: Bearer <your-token>",
    });
  }

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN" → "TOKEN"

  try {
    // Step 2: Verify JWT is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Check if session exists in Redis (user hasn't logged out)
    const session = await redis.get(`session:${decoded.userId}`);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Session expired or logged out",
        tip: "Login again to get a new token",
      });
    }

    // Step 4: Attach user info to request (available in route handlers)
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
}

module.exports = auth;
