# Redis Auth API - Mini Project

## Project Structure

```
mini-project/
├── server.js                 ← Entry point (start here)
├── .env                      ← Config (port, JWT secret, Redis URL)
├── config/
│   └── redis.js              ← Shared Redis connection
├── middleware/
│   ├── auth.js               ← JWT + Redis session check
│   ├── cache.js              ← Cache GET responses in Redis
│   └── rateLimiter.js        ← Block spam with Redis counters
└── routes/
    ├── auth.js               ← Signup, Login, Logout
    ├── posts.js              ← Blog posts (cached + protected)
    └── profile.js            ← User profile (protected)
```

## Redis Patterns Used

| Pattern | Where | Redis Command |
|---------|-------|---------------|
| **User storage** | `routes/auth.js` | `HSET user:email {name, password...}` |
| **Sessions** | `routes/auth.js` | `SET session:userId token EX 86400` |
| **Session check** | `middleware/auth.js` | `GET session:userId` |
| **Logout** | `routes/auth.js` | `DEL session:userId` |
| **Caching** | `middleware/cache.js` | `SET cache:GET:/posts json EX 30` |
| **Rate limiting** | `middleware/rateLimiter.js` | `INCR ratelimit:ip` + `EXPIRE` |

## How to Run & Test

```bash
cd mini-project
node server.js
```

Then in another terminal, follow the curl commands printed in the console. The key things to observe:

1. **Signup → Login → Profile → Logout → Profile fails** (session lifecycle)
2. **GET /posts twice** - first is 2s, second is instant (`_cached: true`)
3. **Refresh 20+ times fast** - you'll get rate limited (429 error)
