/**
 * 12 - Real-time Leaderboard API
 *
 * Run: node 12-leaderboard.js
 * Then open: http://localhost:3000
 *
 * THE PROBLEM:
 * You have a game with 1 million players. You need to show:
 * - Top 10 players
 * - Any player's rank
 * - Update scores in real-time
 *
 * With a database: Complex queries, slow with millions of rows.
 * With Redis Sorted Sets: Instant! O(log N) for all operations.
 *
 * HOW IT WORKS:
 * Redis Sorted Set keeps items sorted by score automatically.
 * Adding, updating, ranking - all super fast even with millions of items.
 */

const { createClient } = require("redis");
const express = require("express");

const app = express();
const client = createClient();

const LEADERBOARD_KEY = "game:leaderboard";

// -------- Routes --------

// Home - instructions
app.get("/", (req, res) => {
  res.json({
    message: "Redis Leaderboard Demo",
    routes: {
      "GET /seed": "Add sample players (run this first!)",
      "GET /top/:count": "Get top N players (e.g., /top/5)",
      "GET /rank/:player": "Get a player's rank and score",
      "GET /add-score/:player/:points": "Add points to a player",
      "GET /around/:player": "Show players around a player's rank",
    },
  });
});

// Seed sample data
app.get("/seed", async (req, res) => {
  // Clear old data
  await client.del(LEADERBOARD_KEY);

  // Add players with scores
  const players = [
    { score: 2500, value: "Alice" },
    { score: 1800, value: "Bob" },
    { score: 3200, value: "Charlie" },
    { score: 950, value: "David" },
    { score: 4100, value: "Eve" },
    { score: 2100, value: "Frank" },
    { score: 1500, value: "Grace" },
    { score: 3800, value: "Henry" },
    { score: 2800, value: "Ivy" },
    { score: 1200, value: "Jack" },
    { score: 3500, value: "Karen" },
    { score: 600, value: "Leo" },
    { score: 2900, value: "Mia" },
    { score: 4500, value: "Nathan" },
    { score: 1700, value: "Olivia" },
  ];

  // ZADD adds all players to the sorted set
  for (const player of players) {
    await client.zAdd(LEADERBOARD_KEY, player);
  }

  res.json({
    message: "Leaderboard seeded with 15 players!",
    next: "Visit /top/5 to see top 5, or /rank/Alice to see Alice's rank",
  });
});

// Get top N players
app.get("/top/:count", async (req, res) => {
  const count = parseInt(req.params.count) || 10;

  // ZRANGE with REV gives highest scores first
  const players = await client.zRangeWithScores(LEADERBOARD_KEY, 0, count - 1, {
    REV: true,
  });

  const leaderboard = players.map((player, index) => ({
    rank: index + 1,
    player: player.value,
    score: player.score,
  }));

  const total = await client.zCard(LEADERBOARD_KEY);

  res.json({
    title: `Top ${count} Players`,
    totalPlayers: total,
    leaderboard: leaderboard,
  });
});

// Get a specific player's rank
app.get("/rank/:player", async (req, res) => {
  const player = req.params.player;

  // ZREVRANK gives rank (0-based, highest score = 0)
  const rank = await client.zRevRank(LEADERBOARD_KEY, player);
  const score = await client.zScore(LEADERBOARD_KEY, player);

  if (rank === null) {
    return res.status(404).json({ error: `Player "${player}" not found` });
  }

  res.json({
    player: player,
    rank: rank + 1, // make it 1-based
    score: score,
    tip: `Try /add-score/${player}/500 to add 500 points!`,
  });
});

// Add score to a player
app.get("/add-score/:player/:points", async (req, res) => {
  const player = req.params.player;
  const points = parseInt(req.params.points) || 0;

  // Get old score
  const oldScore = (await client.zScore(LEADERBOARD_KEY, player)) || 0;
  const oldRank = await client.zRevRank(LEADERBOARD_KEY, player);

  // ZINCRBY adds to existing score (or creates new player)
  const newScore = await client.zIncrBy(LEADERBOARD_KEY, points, player);

  // Get new rank
  const newRank = await client.zRevRank(LEADERBOARD_KEY, player);

  res.json({
    player: player,
    pointsAdded: points,
    oldScore: oldScore,
    newScore: newScore,
    rankChange: {
      from: oldRank !== null ? oldRank + 1 : "new player",
      to: newRank + 1,
    },
  });
});

// Show players around a specific player (context)
app.get("/around/:player", async (req, res) => {
  const player = req.params.player;

  const rank = await client.zRevRank(LEADERBOARD_KEY, player);

  if (rank === null) {
    return res.status(404).json({ error: `Player "${player}" not found` });
  }

  // Show 2 players above and 2 below
  const start = Math.max(0, rank - 2);
  const end = rank + 2;

  const players = await client.zRangeWithScores(LEADERBOARD_KEY, start, end, {
    REV: true,
  });

  const neighborhood = players.map((p, index) => ({
    rank: start + index + 1,
    player: p.value,
    score: p.score,
    isTarget: p.value === player ? "◀ YOU" : "",
  }));

  res.json({
    message: `Players around ${player}`,
    neighborhood: neighborhood,
  });
});

// -------- Start Server --------

async function main() {
  await client.connect();
  console.log("Connected to Redis!");

  app.listen(3000, () => {
    console.log("\nServer running on http://localhost:3000");
    console.log("\nTry this flow:");
    console.log("  1. http://localhost:3000/seed          (add sample players)");
    console.log("  2. http://localhost:3000/top/5          (see top 5)");
    console.log("  3. http://localhost:3000/rank/Alice     (Alice's rank)");
    console.log("  4. http://localhost:3000/add-score/Alice/5000  (boost Alice!)");
    console.log("  5. http://localhost:3000/top/5          (Alice moved up!)");
    console.log("  6. http://localhost:3000/around/Bob     (players near Bob)\n");
    console.log("Press Ctrl+C to stop the server.");
  });
}

main();
