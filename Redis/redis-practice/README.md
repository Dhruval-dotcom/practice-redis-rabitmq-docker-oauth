# Redis Practice

Learn Redis through practical examples — from basic commands to real-world patterns.

## What is Redis?

Redis is an **in-memory database** that stores data in RAM, making it extremely fast (microseconds). Think of it as a super-powered dictionary that lives in your server's memory.

## Files Overview

| # | File | What It Covers |
|---|------|---------------|
| 07 | `connect-redis.js` | Connecting to Redis and basic commands |
| 08 | `caching.js` | Speed up your app by caching slow queries |
| 09 | `session-store.js` | Keep users logged in across server restarts |
| 10 | `rate-limiter.js` | Protect APIs from too many requests |
| 11 | `pub-sub.js` | Real-time messaging between services |
| 12 | `leaderboard.js` | Rankings and scoreboards using sorted sets |
| 13 | `queue.js` | Background job processing |

## Where is Redis Used? (Real World)

### 1. Caching (Most Common)
Your database query takes 2 seconds. Store the result in Redis — next time it takes 1ms.

**Used by:** Every major website. Twitter caches tweets, Facebook caches user profiles.

### 2. Session Storage
When a user logs in, their session data is stored in Redis. Even if your server restarts, the user stays logged in.

**Used by:** E-commerce sites (shopping carts), banking apps (login sessions).

### 3. Rate Limiting
Block users who send too many requests. Example: allow only 100 API calls per minute per user.

**Used by:** APIs everywhere — GitHub, Stripe, Twitter all rate-limit their APIs.

### 4. Pub/Sub (Real-Time Messaging)
One service publishes a message, all subscribers receive it instantly. Great for live updates.

**Used by:** Chat apps, live notifications, stock tickers, multiplayer games.

### 5. Leaderboards & Rankings
Redis sorted sets can rank millions of items and return the top 10 in milliseconds.

**Used by:** Gaming platforms, fitness apps, any app with rankings.

### 6. Job Queues
User uploads a video? Don't make them wait. Push the job to a Redis queue and process it in the background.

**Used by:** YouTube (video processing), email services (bulk sending), report generators.

## Setup

```bash
# Install Redis (Ubuntu/Debian)
sudo apt install redis-server

# Start Redis
sudo systemctl start redis

# Install dependencies
npm install redis express

# Run any file
node 07-connect-redis.js
```

## Key Redis Data Types

| Type | What It Is | Example Use |
|------|-----------|-------------|
| **String** | Simple key-value | Caching, counters |
| **Hash** | Object/dictionary | User profiles, settings |
| **List** | Ordered collection | Queues, activity feeds |
| **Set** | Unique values | Tags, unique visitors |
| **Sorted Set** | Set with scores | Leaderboards, rankings |

## Why Redis Over a Regular Database?

| | Redis | Traditional DB |
|---|-------|---------------|
| **Speed** | Microseconds | Milliseconds |
| **Storage** | RAM (memory) | Disk |
| **Best for** | Temporary/fast-access data | Permanent data |
| **Data size** | Limited by RAM | Limited by disk |

Redis doesn't replace your database — it **sits in front of it** to make things faster.
