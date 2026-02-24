/**
 * Posts Routes - A fake blog API to demonstrate caching
 *
 * REDIS USAGE:
 * - Cache middleware caches GET responses in Redis
 * - First request: slow (simulated) → saved to Redis
 * - Next requests: instant from Redis cache
 * - Cache auto-expires (TTL)
 *
 * In a real app, these would fetch from a database.
 * We simulate a slow database to show the caching benefit.
 */

const express = require("express");
const authMiddleware = require("../middleware/auth");
const cacheMiddleware = require("../middleware/cache");

const router = express.Router();

// Fake "database" of posts
const fakePosts = [
  {
    id: 1,
    title: "Getting Started with Redis",
    body: "Redis is an in-memory data store...",
    author: "Dhruval",
    likes: 42,
  },
  {
    id: 2,
    title: "Express.js Best Practices",
    body: "When building APIs with Express...",
    author: "Alice",
    likes: 38,
  },
  {
    id: 3,
    title: "Caching Strategies Explained",
    body: "Caching is one of the most effective...",
    author: "Bob",
    likes: 55,
  },
  {
    id: 4,
    title: "Building Real-time Apps",
    body: "WebSockets and Redis Pub/Sub...",
    author: "Charlie",
    likes: 29,
  },
  {
    id: 5,
    title: "Database vs Cache",
    body: "When to use a database and when to cache...",
    author: "Dhruval",
    likes: 61,
  },
];

// Simulate slow database query
async function simulateSlowDB(ms = 2000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================================
// GET /posts - List all posts (CACHED)
// ==========================================
// cache({ ttl: 30 }) = cache for 30 seconds
router.get("/", cacheMiddleware({ ttl: 30 }), async (req, res) => {
  // This simulates a slow database query
  await simulateSlowDB(2000);

  res.json({
    success: true,
    count: fakePosts.length,
    data: fakePosts,
  });
});

// ==========================================
// GET /posts/:id - Get one post (CACHED)
// ==========================================
router.get("/:id", cacheMiddleware({ ttl: 60 }), async (req, res) => {
  await simulateSlowDB(1000);

  const post = fakePosts.find((p) => p.id === parseInt(req.params.id));

  if (!post) {
    return res.status(404).json({
      success: false,
      error: "Post not found",
    });
  }

  res.json({
    success: true,
    data: post,
  });
});

// ==========================================
// POST /posts - Create a post (PROTECTED)
// Requires login! Uses auth middleware
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      error: "title and body are required",
    });
  }

  const newPost = {
    id: fakePosts.length + 1,
    title,
    body,
    author: req.user.name, // comes from JWT token via auth middleware
    likes: 0,
  };

  fakePosts.push(newPost);

  console.log(`  New post by ${req.user.name}: "${title}"`);

  res.status(201).json({
    success: true,
    message: "Post created!",
    data: newPost,
    note: "The GET /posts cache will still show old data until it expires (30s)",
  });
});

module.exports = router;
