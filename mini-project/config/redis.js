/**
 * Redis Connection
 *
 * This file creates ONE Redis client that the entire app shares.
 * We export it so other files can use it.
 */

const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => {
  console.log("Redis error:", err.message);
});

client.on("connect", () => {
  console.log("Redis connected!");
});

module.exports = client;
