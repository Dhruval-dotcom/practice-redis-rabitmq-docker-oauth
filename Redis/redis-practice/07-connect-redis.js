/**
 * 07 - Connecting to Redis from Node.js
 *
 * Run: node 07-connect-redis.js
 *
 * This is the foundation - every other file builds on this.
 */

const { createClient } = require("redis");

async function main() {
  // Step 1: Create a Redis client
  // By default it connects to localhost:6379
  const client = createClient();

  // Step 2: Handle errors (always do this!)
  client.on("error", (err) => {
    console.log("Redis error:", err.message);
  });

  // Step 3: Connect
  await client.connect();
  console.log("Connected to Redis!");

  // Step 4: Basic operations (same commands you learned in redis-cli)
  await client.set("greeting", "Hello from Node.js!");
  const value = await client.get("greeting");
  console.log("greeting:", value);

  // Numbers
  await client.set("counter", 0);
  await client.incr("counter"); // 1
  await client.incr("counter"); // 2
  await client.incrBy("counter", 10); // 12
  const counter = await client.get("counter");
  console.log("counter:", counter);

  // Set with expiry (60 seconds)
  await client.set("temp-key", "I will disappear", { EX: 60 });
  const ttl = await client.ttl("temp-key");
  console.log("temp-key TTL:", ttl, "seconds");

  // Hash
  await client.hSet("user:1", {
    name: "Dhruval",
    city: "Ahmedabad",
    role: "developer",
  });
  const user = await client.hGetAll("user:1");
  console.log("user:1:", user);

  // List
  await client.del("fruits"); // clean up first
  await client.rPush("fruits", ["apple", "banana", "mango"]);
  const fruits = await client.lRange("fruits", 0, -1);
  console.log("fruits:", fruits);

  // Set (unique values)
  await client.del("tags"); // clean up first
  await client.sAdd("tags", ["redis", "nodejs", "redis"]); // duplicate ignored
  const tags = await client.sMembers("tags");
  console.log("tags:", tags);

  // Step 5: Always disconnect when done
  await client.disconnect();
  console.log("\nDisconnected. Done!");
}

main();
