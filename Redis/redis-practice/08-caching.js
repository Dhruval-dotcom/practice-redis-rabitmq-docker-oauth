/**
 * 08 - Caching Pattern (Most Common Use Case!)
 *
 * Run: node 08-caching.js
 *
 * THE PROBLEM:
 * Your app calls an API or database. It takes 2 seconds.
 * Users do this 1000 times/day. That's 2000 seconds wasted!
 *
 * THE SOLUTION:
 * First call  → fetch from API (slow) → save result in Redis
 * Next calls  → get from Redis (fast) → skip the API
 *
 * This is called "Cache Aside" pattern.
 */

const { createClient } = require("redis");

const client = createClient();

// Simulate a slow API call (like fetching from a database)
async function fetchUserFromDatabase(userId) {
  console.log("  ⏳ Fetching from database... (slow - 2 seconds)");
  // Simulate 2 second delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Pretend this came from a database
  return {
    id: userId,
    name: "Dhruval",
    email: "dhruval@example.com",
    plan: "premium",
  };
}

/**
 * GET USER WITH CACHING
 *
 * 1. Check Redis first (fast)
 * 2. If found in Redis → return it (cache HIT)
 * 3. If NOT found → fetch from DB → save in Redis → return it (cache MISS)
 */
async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // Step 1: Check Redis cache
  const cached = await client.get(cacheKey);

  if (cached) {
    console.log("  ✅ Cache HIT - got from Redis (instant!)");
    return JSON.parse(cached); // Redis stores strings, so we parse JSON
  }

  // Step 2: Cache MISS - fetch from database
  console.log("  ❌ Cache MISS - not in Redis");
  const user = await fetchUserFromDatabase(userId);

  // Step 3: Save in Redis for next time (expire in 1 hour = 3600 seconds)
  await client.set(cacheKey, JSON.stringify(user), { EX: 3600 });
  console.log("  💾 Saved to Redis cache (expires in 1 hour)");

  return user;
}

async function main() {
  await client.connect();
  console.log("Connected to Redis!\n");

  // First call - will be SLOW (cache miss, fetches from DB)
  console.log("--- Request 1 ---");
  let start = Date.now();
  let user = await getUser(42);
  console.log(`  Result: ${user.name}`);
  console.log(`  Time: ${Date.now() - start}ms\n`);

  // Second call - will be FAST (cache hit, from Redis)
  console.log("--- Request 2 ---");
  start = Date.now();
  user = await getUser(42);
  console.log(`  Result: ${user.name}`);
  console.log(`  Time: ${Date.now() - start}ms\n`);

  // Third call - still FAST
  console.log("--- Request 3 ---");
  start = Date.now();
  user = await getUser(42);
  console.log(`  Result: ${user.name}`);
  console.log(`  Time: ${Date.now() - start}ms\n`);

  console.log("See the difference? First call ~2000ms, rest ~1ms!");
  console.log("Imagine this with 1000 users hitting your API.");

  await client.disconnect();
}

main();
