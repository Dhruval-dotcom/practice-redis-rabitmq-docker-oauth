# Redis from Scratch

## What is Redis?

Redis = **Re**mote **Di**ctionary **S**erver

Think of it as a **super fast notebook** that stores data in your
computer's **memory (RAM)** instead of on disk. That's why it's blazing
fast.

## Why Use Redis?

| Problem | Without Redis | With Redis |
|---------|--------------|------------|
| Database query takes 500ms | User waits every time | First time 500ms, then **1ms** from cache |
| Session storage | Stored on disk, slow | Stored in memory, instant |
| Real-time leaderboard | Complex SQL queries | Built-in sorted sets |
| Rate limiting | Custom logic needed | Simple counter with expiry |
| Message queues | Need Kafka/RabbitMQ | Redis Pub/Sub or Streams |

**In simple words**: Redis sits between your app and your database. It
remembers frequently asked answers so your app doesn't keep asking
the database the same questions.

## Advantages

1. **Speed** - Data lives in RAM, reads/writes in microseconds
2. **Simple** - Uses key-value pairs (like a dictionary/object)
3. **Versatile** - Supports strings, lists, sets, hashes, sorted sets
4. **Built-in expiry** - Data can auto-delete after X seconds (perfect for caching)
5. **Lightweight** - Uses very little resources

---

## Step 1: Install Redis

Open your terminal (Ctrl+Alt+T) and run these commands one by one:

```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install -y redis-server
```

## Step 2: Start Redis

```bash
# Start Redis server
sudo systemctl start redis-server

# Make Redis start automatically on boot
sudo systemctl enable redis-server

# Check if it's running
sudo systemctl status redis-server
```

You should see **"active (running)"** in green.

## Step 3: Test It

```bash
# Open Redis CLI (command line interface)
redis-cli

# You should see: 127.0.0.1:6379>
# Now type:
ping
```

If Redis replies **`PONG`** - you're all set!

## Step 4: Try Basic Commands

Once you're inside `redis-cli`, try these:

```bash
# Store a value
SET name "Dhruval"

# Get the value back
GET name
# Output: "Dhruval"

# Store with expiry (disappears after 10 seconds)
SET token "abc123" EX 10

# Check remaining time
TTL token

# Wait 10 seconds, then:
GET token
# Output: (nil)  <-- it's gone!

# Exit redis-cli
quit
```

## What Just Happened?

```
Your App  ──→  Redis (RAM - super fast)  ──→  Database (Disk - slower)
                  ↑
          "I already know the answer,
           no need to ask the database!"
```

---

## Redis Data Types - The Building Blocks

Redis has **5 main data types**. Think of them like this:

| Type | Real World Analogy |
|------|-------------------|
| **String** | A sticky note (one key = one value) |
| **List** | A to-do list (ordered, can add/remove from both ends) |
| **Hash** | A contact card (name, phone, email in one place) |
| **Set** | A bag of unique marbles (no duplicates) |
| **Sorted Set** | A leaderboard (unique items with scores) |
