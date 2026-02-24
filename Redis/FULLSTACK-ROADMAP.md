# Fullstack Developer Roadmap

A practical, no-fluff roadmap for becoming a strong fullstack developer.
Not just code — habits, communication, and thinking like a senior.

---

## Where You Are Now

```
✅ Frontend        → React, TypeScript, HTML/CSS
✅ Backend         → Node.js, Express
✅ Databases       → SQL, NoSQL
✅ Caching         → Redis (data types, caching, sessions, rate limiting)
✅ Message Queues  → BullMQ, RabbitMQ
✅ Real-time       → Socket.io basics
✅ Testing         → Playwright E2E
```

You have a solid foundation. Now it's about going deeper and wider in the right places.

---

## Part 1: Technical Skills Roadmap

### Level 1: Must Know (Learn These First)

These are expected in almost every fullstack job. Not optional.

---

#### 1. Docker & Docker Compose

**What**: Package your app + all its dependencies into a container that runs anywhere.

**Why**: Every company uses Docker. "It works on my machine" becomes "It works everywhere."

**What to learn**:
- What are containers and images (think: image = recipe, container = the cooked dish)
- Write a `Dockerfile` for a Node.js app
- Use `docker-compose.yml` to run app + Redis + database together with one command
- Docker volumes (so data survives container restarts)
- Docker networking (how containers talk to each other)
- Push images to Docker Hub
- Multi-stage builds (smaller production images)

**Practice project**: Dockerize your Redis mini-project. One `docker compose up` should start Express + Redis together.

**Time**: 1-2 weeks

---

#### 2. CI/CD (Continuous Integration / Continuous Deployment)

**What**: Automate testing and deployment. Push code → tests run automatically → deploys automatically.

**Why**: Every professional team uses CI/CD. Manual deployments are a risk.

**What to learn**:
- GitHub Actions (most popular, free for public repos)
  - Run tests on every pull request
  - Run linting on every push
  - Auto-deploy when merging to main
- Understand the pipeline: Code → Build → Test → Deploy
- Environment variables and secrets in CI
- Branch protection rules (require tests to pass before merge)
- Basic YAML syntax (GitHub Actions config files)

**Practice project**: Add a GitHub Action to your project that runs tests on every push.

**Time**: 3-5 days

---

#### 3. Cloud Basics (AWS or any one cloud)

**What**: Where your code actually runs in production. Not your laptop.

**Why**: Someone has to deploy and manage the app. Fullstack devs who understand cloud are 2x more valuable.

**Pick one cloud and go deep** (AWS is most popular, but any works):

**What to learn**:
- **EC2** → Virtual servers (run your Node.js app)
- **S3** → File storage (images, PDFs, backups)
- **RDS** → Managed databases (PostgreSQL, MySQL)
- **Lambda** → Serverless functions (run code without managing servers)
- **CloudFront** → CDN (serve static files fast globally)
- **IAM** → Permissions (who can access what)
- **Route 53** → DNS (connect your domain to your server)
- Basic networking: VPC, subnets, security groups

**Don't try to learn all 200+ AWS services.** These 7-8 cover 90% of what fullstack devs need.

**Practice project**: Deploy your Express app to EC2. Connect it to RDS. Serve frontend from S3 + CloudFront.

**Time**: 2-3 weeks

---

#### 4. Nginx & Reverse Proxy

**What**: Nginx sits in front of your Node.js app and handles traffic.

**Why**: In production, you never expose Node.js directly to the internet.

**What to learn**:
- What is a reverse proxy (Nginx receives requests → forwards to your app)
- Basic Nginx config for Node.js
- SSL/HTTPS setup with Let's Encrypt (free SSL certificates)
- Serve static files (images, CSS, JS) through Nginx (faster than Node.js)
- Load balancing (send traffic to multiple app instances)
- Rate limiting at Nginx level
- Gzip compression

**Practice project**: Put Nginx in front of your Express app. Add HTTPS. Serve static files.

**Time**: 3-5 days

---

#### 5. Authentication & Security (Deep Dive)

**What**: Go beyond basic login/signup. Understand how auth works in real apps.

**Why**: Auth is in EVERY app. Doing it wrong = security breach = company in the news for wrong reasons.

**What to learn**:
- **JWT deep dive** → Access tokens, refresh tokens, token rotation
- **OAuth 2.0** → "Login with Google/GitHub" (understand the flow, not just copy-paste)
- **Session vs Token** → When to use which
- **RBAC** → Role-Based Access Control (admin, editor, viewer)
- **Password security** → bcrypt, argon2, salt, pepper
- **CORS** → Why it exists, how to configure properly
- **OWASP Top 10** → The 10 most common security vulnerabilities
  - XSS (Cross-Site Scripting)
  - CSRF (Cross-Site Request Forgery)
  - SQL Injection
  - Broken Authentication
- **Rate limiting** → You already know this from Redis!
- **Helmet.js** → Security headers for Express
- **Input validation** → Never trust user input (use Zod or Joi)

**Practice project**: Add Google OAuth + refresh token rotation + RBAC to an app.

**Time**: 1-2 weeks

---

#### 6. Testing (Beyond E2E)

**What**: You know Playwright (E2E). Now learn the full testing picture.

**Why**: Good tests = confidence to change code without breaking things. Companies love developers who write tests.

**What to learn**:
- **Unit tests** → Test individual functions (Jest or Vitest)
- **Integration tests** → Test API endpoints (Supertest)
- **E2E tests** → Test full user flows (Playwright - you know this!)
- **Test pyramid** → Many unit tests, some integration, few E2E
- **Mocking** → Fake external services in tests (don't call real APIs in tests)
- **Code coverage** → Aim for 80%+ on critical code
- **TDD basics** → Write test first, then code (not always, but know the approach)

```
        /  E2E  \          ← Few (slow, expensive)
       / Integra \         ← Some (medium speed)
      /   Unit    \        ← Many (fast, cheap)
     ──────────────
```

**Practice project**: Write unit + integration tests for your Redis mini-project API.

**Time**: 1-2 weeks

---

### Level 2: Should Know (Learn After Level 1)

These make you stand out. Most juniors and many mid-level devs skip these.

---

#### 7. Linux & Command Line

**What**: Be comfortable in the terminal. Most servers run Linux.

**Why**: You'll SSH into servers, read logs, debug production issues. Can't click buttons on a server.

**What to learn**:
- File navigation: `ls`, `cd`, `pwd`, `find`, `grep`
- File operations: `cat`, `head`, `tail`, `less`, `wc`
- Permissions: `chmod`, `chown`, `chgrp`
- Process management: `ps`, `top`, `htop`, `kill`
- Networking: `curl`, `wget`, `ping`, `netstat`, `ss`
- Text processing: `awk`, `sed`, `sort`, `uniq`
- Shell scripting basics (write simple bash scripts)
- SSH and SCP (connect to remote servers, copy files)
- Environment variables
- Cron jobs (schedule tasks)
- `systemd` (manage services)

**Time**: 1 week (then keep practicing daily)

---

#### 8. API Design

**What**: Design APIs that other developers actually want to use.

**Why**: Bad APIs cause pain for everyone. Good APIs make teams productive.

**What to learn**:
- **REST best practices**
  - Use nouns not verbs (`/users` not `/getUsers`)
  - Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
  - Proper status codes (200, 201, 400, 401, 403, 404, 500)
  - Pagination (`?page=1&limit=20`)
  - Filtering (`?status=active&role=admin`)
  - Sorting (`?sort=createdAt&order=desc`)
  - Versioning (`/api/v1/users`)
- **API documentation** → Swagger/OpenAPI
- **Error handling** → Consistent error response format
- **Validation** → Zod, Joi, or express-validator
- **GraphQL basics** → Understand what it is, when to use it (don't go deep yet)

**Time**: 1 week

---

#### 9. Database Deep Dive

**What**: Go beyond basic CRUD. Understand how databases actually work.

**Why**: Slow app? 80% of the time it's a database problem.

**What to learn**:
- **Indexing** → What indexes are, when to add them, when they hurt
- **Query optimization** → EXPLAIN ANALYZE, slow query logs
- **Transactions** → ACID properties, isolation levels
- **Database design** → Normalization, denormalization, when to use which
- **Migrations** → Schema changes without downtime (Prisma, Knex, TypeORM)
- **Connection pooling** → Don't open a new connection for every request
- **Replication** → Read replicas for scaling reads
- **Sharding basics** → Splitting data across multiple databases
- **ORM vs Raw SQL** → Know both, understand trade-offs
- **PostgreSQL features** → JSON columns, full-text search, CTEs, window functions

**Time**: 2-3 weeks

---

#### 10. Monitoring & Logging

**What**: Know what's happening in your app in production.

**Why**: You can't fix what you can't see. "The app is slow" isn't helpful. Logs and metrics tell you exactly why.

**What to learn**:
- **Structured logging** → Use Winston or Pino (not console.log in production)
- **Log levels** → debug, info, warn, error (and when to use each)
- **Application monitoring** → Sentry (error tracking), New Relic, Datadog
- **Metrics** → Response time, error rate, memory usage, CPU
- **Health checks** → `/health` endpoint that checks DB, Redis, etc.
- **Alerting** → Get notified when things break (before users notice)

**Time**: 1 week

---

#### 11. WebSockets (Deep Dive)

**What**: Real-time, two-way communication between browser and server.

**Why**: Chat, notifications, live dashboards, collaborative editing — all need WebSockets.

**What to learn**:
- Raw WebSocket API (understand the protocol)
- Socket.io advanced features (rooms, namespaces, acknowledgments)
- Scaling WebSockets across multiple servers (Redis adapter)
- Reconnection handling
- Authentication with WebSockets
- Server-Sent Events (SSE) — simpler alternative for one-way updates

**Time**: 1 week

---

### Level 3: Senior-Level Skills

These separate senior developers from everyone else.

---

#### 12. System Design

**What**: Design entire systems, not just features. Think about scale, reliability, trade-offs.

**Why**: Asked in every senior interview. Required for building real products.

**What to learn**:
- **Fundamentals first**:
  - Client-Server model
  - DNS, how the internet works
  - HTTP/HTTPS in depth
  - Load balancers (what they do, types)
  - CDN (Content Delivery Network)
  - Caching strategies (cache-aside, write-through, write-behind)
  - Database scaling (replication, sharding, partitioning)
  - CAP theorem (you can only pick 2 of 3: Consistency, Availability, Partition tolerance)
  - Consistent hashing
  - Rate limiting algorithms (token bucket, sliding window — you've implemented this!)

- **Common patterns**:
  - Microservices vs Monolith (most apps should start as monolith)
  - Event-driven architecture
  - CQRS (Command Query Responsibility Segregation)
  - Saga pattern (distributed transactions)
  - Circuit breaker pattern
  - API Gateway pattern

- **Practice these designs**:
  - URL shortener (like bit.ly)
  - Chat system (like WhatsApp)
  - Social media feed (like Twitter/Instagram)
  - File storage (like Google Drive)
  - Notification system
  - Rate limiter
  - Search autocomplete
  - Video streaming (like YouTube)

**Resources**:
- "System Design Interview" by Alex Xu (the book, both volumes)
- ByteByteGo YouTube channel
- Designing Data-Intensive Applications (advanced, read after basics)

**Time**: Ongoing (start now, never stop)

---

#### 13. Architecture Patterns

**What**: How to structure large codebases so they don't become a mess.

**Why**: Small apps are easy. 100,000+ lines of code needs structure or everything falls apart.

**What to learn**:
- **Clean Architecture** → Separate business logic from frameworks
- **Repository Pattern** → Abstract database access
- **Service Layer** → Business logic lives here, not in controllers
- **Dependency Injection** → Makes code testable and flexible
- **Event-driven architecture** → Decouple services with events
- **Monorepo vs Multi-repo** → How to organize code across projects
- **Feature-based folder structure** → Group by feature, not by type

```
# Bad: organized by type
controllers/
  userController.js
  orderController.js
services/
  userService.js
  orderService.js

# Good: organized by feature
users/
  user.controller.js
  user.service.js
  user.test.js
orders/
  order.controller.js
  order.service.js
  order.test.js
```

**Time**: 2-3 weeks

---

#### 14. Performance Optimization

**What**: Make your app fast. Not just "it works" but "it works fast."

**Why**: Users leave if a page takes more than 3 seconds. Performance = money.

**What to learn**:
- **Frontend performance**:
  - Bundle size analysis (webpack-bundle-analyzer)
  - Code splitting and lazy loading
  - Image optimization (WebP, lazy loading, responsive images)
  - Core Web Vitals (LCP, FID, CLS)
  - Memoization (React.memo, useMemo, useCallback)
  - Virtual scrolling for large lists
  - Service Workers and PWA basics

- **Backend performance**:
  - Database query optimization (N+1 problem, eager loading)
  - Caching strategies (you already know Redis!)
  - Connection pooling
  - Compression (gzip, brotli)
  - Pagination (don't send 10,000 rows)
  - Background jobs for heavy work (you know BullMQ!)
  - Profiling Node.js (clinic.js, 0x flame graphs)

**Time**: 2 weeks

---

## Part 2: System Design Study Plan

System design deserves its own section because it's that important for career growth.

### Month 1: Fundamentals

| Week | Topic | Key Concepts |
|------|-------|-------------|
| 1 | Networking basics | DNS, HTTP, TCP/IP, WebSockets, REST |
| 2 | Scaling basics | Vertical vs horizontal, load balancing, CDN |
| 3 | Database scaling | Replication, sharding, indexing, caching |
| 4 | Reliability | Redundancy, failover, health checks, backups |

### Month 2: Building Blocks

| Week | Topic | Key Concepts |
|------|-------|-------------|
| 1 | Caching | Cache-aside, write-through, eviction policies, Redis |
| 2 | Message queues | Async processing, pub/sub, event-driven, RabbitMQ, BullMQ |
| 3 | Storage | SQL vs NoSQL, blob storage, file systems, S3 |
| 4 | Search | Full-text search, Elasticsearch basics, indexing |

### Month 3: Design Practice

| Week | Design Problem | Key Patterns |
|------|---------------|-------------|
| 1 | URL shortener | Hashing, base62, read-heavy system |
| 2 | Chat system | WebSockets, message queues, presence |
| 3 | News feed | Fan-out, ranking, caching, pagination |
| 4 | Notification system | Queue, priority, multi-channel delivery |

### How to Practice

For each design problem:
1. Define requirements (what does it need to do?)
2. Estimate scale (how many users? how much data?)
3. Draw the high-level architecture
4. Deep dive into each component
5. Discuss trade-offs (why this approach over another?)

---

## Part 3: Beyond Code — What Makes Great Developers

Technical skills get you hired. These skills get you promoted.

---

### Communication

This is THE most underrated skill. A developer who communicates well is worth 2 developers who don't.

**What to practice**:

- **Explain technical things simply**
  - If you can't explain it to a non-technical person, you don't understand it well enough
  - Practice: Explain Redis to a friend who doesn't code. If they get it, you're good.

- **Write clearly**
  - PR descriptions: explain WHAT changed, WHY it changed, HOW to test it
  - Commit messages: be specific ("Fix login timeout on slow networks" not "Fix bug")
  - Documentation: write it like you're explaining to your future self who forgot everything
  - Slack/email: get to the point fast, use bullet points

- **Ask good questions**
  - Bad: "It doesn't work"
  - Good: "Login fails with 401 when using Safari. Here's the error log. I tried X and Y but the issue persists. Could it be related to Z?"
  - Include: what you expected, what happened, what you already tried

- **Give good code reviews**
  - Don't just say "this is wrong" — explain why and suggest an alternative
  - Praise good code too, not just problems
  - Focus on logic and architecture, not style (let linters handle style)

- **Speak up in meetings**
  - If you don't understand something, ask. Others probably don't understand either.
  - Share your opinion even if you're junior. Bad idea? You learned. Good idea? You contributed.

---

### Habits That Make You Better

#### Daily habits

- **Read code, not just write it**
  - Read open source code on GitHub (Express, Fastify, BullMQ source code)
  - Reading good code teaches you patterns you'd never think of
  - Start with smaller libraries, then bigger ones

- **Use keyboard shortcuts**
  - Learn VS Code shortcuts. Every second saved adds up to hours per week.
  - Multi-cursor, quick open, go to definition, rename symbol
  - Learn to navigate without touching the mouse

- **Write one thing down every day**
  - Learned a new concept? Write a 2-line note
  - Found a tricky bug? Write how you fixed it
  - Use a simple markdown file, Notion, or even a physical notebook
  - After 6 months you'll have a personal knowledge base

#### Weekly habits

- **Read one tech article or watch one tech talk**
  - Follow: ByteByteGo, Fireship, Theo (t3.gg), The Primeagen
  - Read: engineering blogs from Stripe, Netflix, Uber, Airbnb
  - Not to copy them, but to see how they think about problems

- **Build something small every week or two**
  - A CLI tool, a small API, a script that automates something boring
  - Building > reading. You learn 10x faster by doing.

- **Review your own old code**
  - Look at code you wrote 3 months ago. If you cringe, you've grown.
  - If you don't cringe, you haven't grown enough.

#### Monthly habits

- **Learn one new tool deeply**
  - Not 5 tools superficially. ONE tool properly.
  - This month: Docker. Next month: AWS. Then Nginx. Etc.

- **Contribute to open source (even small things)**
  - Fix a typo in docs (it counts!)
  - Report a bug with a clear reproduction
  - Answer questions on Stack Overflow or GitHub discussions
  - You'll learn how real projects are built and maintained

---

### Debugging Mindset

Good developers write bugs. Great developers find them fast.

- **Read the error message first.** Fully. Most errors tell you exactly what's wrong.
- **Reproduce the bug** before trying to fix it. If you can't reproduce it, you can't fix it.
- **Change one thing at a time.** Don't change 5 things and hope one fixes it.
- **Use `git bisect`** to find which commit introduced the bug.
- **Rubber duck debugging** — explain the problem out loud (to a duck, a friend, or yourself). You'll often find the answer while explaining.
- **Sleep on it.** If you're stuck for 2+ hours, walk away. Your brain keeps working in the background. Seriously. This works.

---

### Career Growth Tips

- **Don't chase frameworks. Chase fundamentals.**
  - Frameworks change every 2 years. HTTP, databases, data structures, algorithms — they've been the same for decades.
  - A developer who understands fundamentals can pick up any framework in days.

- **T-shaped skills**
  - Be broad in many areas (know a little about everything)
  - Be DEEP in 2-3 areas (your specialties)
  - Example: Broad in frontend, backend, devops. Deep in React, Node.js, system design.

```
  ──────────────────────────  ← Know a little about many things
         |        |
         |        |           ← Go deep in 2-3 things
         |        |
      React    Node.js
```

- **Build a portfolio that shows depth**
  - One well-built project > ten todo apps
  - Show projects that solve real problems
  - Write about what you learned building them

- **Network with other developers**
  - Join local meetups or online communities
  - Help others (teaching is the best way to learn)
  - Twitter/X tech community is surprisingly helpful

- **Negotiate your salary**
  - Know your market value (check Glassdoor, levels.fyi)
  - Don't accept the first offer. Always negotiate. The worst they can say is no.
  - Skills in Docker, AWS, system design can add 20-40% to your salary.

---

### Tools Every Developer Should Know Well

| Category | Tools |
|----------|-------|
| **Editor** | VS Code (learn it deeply — shortcuts, extensions, debugging) |
| **Version control** | Git (rebase, cherry-pick, bisect, stash, reflog) |
| **Terminal** | Bash/Zsh, tmux or screen |
| **API testing** | Postman, Thunder Client, or curl |
| **Database GUI** | DBeaver, TablePlus, or pgAdmin |
| **Browser DevTools** | Network tab, Performance tab, React DevTools |
| **Diagramming** | Excalidraw, draw.io (for system design and architecture) |
| **Note-taking** | Notion, Obsidian, or simple markdown files |

---

### Books Worth Reading

| Book | Why |
|------|-----|
| **Clean Code** (Robert Martin) | Write code that humans can read, not just computers |
| **The Pragmatic Programmer** | Thinking and habits of effective developers |
| **System Design Interview Vol 1 & 2** (Alex Xu) | Practical system design for interviews and real work |
| **Designing Data-Intensive Applications** | Deep understanding of databases, queues, distributed systems (read after basics) |
| **You Don't Know JS** (Kyle Simpson) | Really understand JavaScript, not just use it |

---

## Part 4: The Priority Order

If you're overwhelmed, follow this exact order:

### Next 3 months (immediate priority)

```
Month 1: Docker + Docker Compose
         └── Dockerize your existing projects
         └── Learn docker compose for multi-service apps

Month 2: CI/CD + Cloud basics
         └── GitHub Actions for your projects
         └── Deploy one app to AWS EC2 or Railway/Render

Month 3: System Design fundamentals
         └── Start reading Alex Xu's book
         └── Design 1 system per week on paper
```

### Months 4-6

```
Month 4: Database deep dive + API design
Month 5: Authentication deep dive + Security
Month 6: Testing (unit + integration) + Monitoring
```

### Months 7-12

```
Month 7-8:  Architecture patterns + Performance
Month 9-10: Advanced system design + Practice designs
Month 11-12: Open source contribution + Portfolio projects
```

### Ongoing (never stop)

```
- Read engineering blogs weekly
- Build small projects regularly
- Practice system design
- Improve communication skills
- Help other developers
```

---

## One Last Thing

**You don't need to know everything to be a great developer.**

The best developers aren't the ones who know every technology.
They're the ones who can learn quickly, communicate clearly,
and solve problems systematically.

You're already building real projects and learning actively.
That puts you ahead of most people. Keep going.
