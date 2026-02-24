# Upstash - Serverless Data Platform

## What is Upstash?

Upstash is a **cloud platform** that gives you databases and messaging services that work without servers. You don't install anything, don't manage servers, and don't worry about scaling. Just create an account, get a URL + token, and start using it in your code.

It's built for **serverless apps** (Vercel, Netlify, Cloudflare Workers, AWS Lambda) where traditional databases don't work well because connections keep opening and closing.

**In simple words:** It's like renting a database that you pay per use (or use free within limits), instead of running your own.

---

## All Upstash Services

Upstash provides **5 main services**:

| # | Service | What It Does | Think of It As |
|---|---------|-------------|----------------|
| 1 | **Redis** | Fast key-value database | A super-fast dictionary in the cloud |
| 2 | **QStash** | Message queue & scheduler | A postal service for your app |
| 3 | **Vector** | Vector database for AI | A brain that finds similar things |
| 4 | **Workflow** | Durable serverless functions | A to-do list that never forgets |
| 5 | **Kafka** | Event streaming | A news channel for your services |

---

## Free Tier Limits (All Services)

### 1. Redis (Free)

| Feature | Free Limit |
|---------|-----------|
| Commands/month | 500K |
| Data size | 256 MB |
| Bandwidth | First 200 GB free |
| Databases | Up to 10 |

### 2. QStash (Free)

| Feature | Free Limit |
|---------|-----------|
| Messages/day | 1,000 |
| Max message size | 1 MB |
| Monthly bandwidth | 50 GB |
| Active schedules | 10 |
| Queues | 10 |
| Queue parallelism | 2 |
| Max delay | 7 days |
| Log retention | 3 days |

### 3. Vector (Free)

| Feature | Free Limit |
|---------|-----------|
| Daily queries/updates | 10K |
| Max vectors x dimensions | 200 million |
| Max dimensions | 1,536 |
| Max namespaces | 100 |
| Data/metadata size | 1 GB |

### 4. Workflow (Free)

| Feature | Free Limit |
|---------|-----------|
| Steps/day | 1,000 |
| Monthly bandwidth | 50 GB |
| Steps per workflow run | 1,000 |
| Concurrent steps | 10 |
| Max message size | 1 MB |
| Max sleep duration | 7 days |
| Log retention | 3 days |

### 5. Kafka

Kafka is available but primarily through pay-as-you-go plans. Check [upstash.com/pricing](https://upstash.com/pricing) for current details.

---

## Detailed Guide: Each Service

---

### 1. Redis — Fast Cloud Database

#### What it does
Same as regular Redis but hosted in the cloud. Store and retrieve data in milliseconds. Works over **HTTP** (REST API), so it works everywhere — even in serverless functions.

#### When to use it
- **Caching**: Store API responses so you don't hit your database every time
- **Session storage**: Keep users logged in
- **Rate limiting**: Block spam/abuse
- **Counters**: Track page views, likes, votes
- **Temporary data**: OTPs, verification codes, short-lived tokens

#### How it works

```
Your App  --(HTTP request)-->  Upstash Redis  --(response in ~1ms)-->  Your App
```

No persistent connection needed. Each request is independent — perfect for serverless.

#### Code Example (Full Working)

```bash
npm install @upstash/redis
```

```javascript
// redis-example.js
import { Redis } from "@upstash/redis";

// Create connection (get these from Upstash dashboard)
const redis = new Redis({
  url: "https://your-redis-url.upstash.io",
  token: "your-token-here",
});

// --- Basic Operations ---

// SET and GET
await redis.set("username", "dhruval");
const name = await redis.get("username");
console.log(name); // "dhruval"

// SET with expiry (60 seconds)
await redis.set("otp:dhruval", "482910", { ex: 60 });

// Counter
await redis.incr("page-views"); // 1
await redis.incr("page-views"); // 2

// --- Caching Example ---

async function getUser(userId) {
  // Check cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    console.log("Cache HIT");
    return cached;
  }

  // Cache miss — fetch from database
  console.log("Cache MISS — fetching from DB");
  const user = await fetchFromDatabase(userId); // your DB call

  // Store in cache for 1 hour
  await redis.set(`user:${userId}`, JSON.stringify(user), { ex: 3600 });

  return user;
}
```

---

### 2. QStash — Message Queue & Scheduler

#### What it does
Sends messages (HTTP requests) to your endpoints **reliably**. If the request fails, it retries automatically. You can also **schedule** messages to be sent later or on a recurring basis (like cron jobs).

#### When to use it
- **Background jobs**: Send email after user signs up (don't make user wait)
- **Scheduled tasks**: Run a cleanup job every night at midnight
- **Delayed actions**: Send a reminder 24 hours after registration
- **Webhooks**: Reliably deliver webhooks with automatic retries
- **Decouple services**: Service A tells Service B to do something without waiting

#### How it works

```
Your App  --"send email to user"--> QStash  --(delivers reliably)--> Your Email API
                                      |
                                      ├── Retries on failure (automatic)
                                      ├── Schedules for later (cron/delay)
                                      └── Logs everything (3 days)
```

You publish a message to QStash with a destination URL. QStash guarantees it will be delivered, retrying if the destination is down.

#### Code Example

```bash
npm install @upstash/qstash
```

```javascript
// qstash-example.js
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: "your-qstash-token",
});

// --- Send a one-time message ---
// QStash will POST to this URL with your data
await qstash.publishJSON({
  url: "https://your-app.vercel.app/api/send-email",
  body: {
    to: "user@example.com",
    subject: "Welcome!",
    message: "Thanks for signing up.",
  },
});

// --- Send with a delay (30 minutes later) ---
await qstash.publishJSON({
  url: "https://your-app.vercel.app/api/send-reminder",
  body: { userId: "123", type: "cart-abandoned" },
  delay: 1800, // seconds (30 min)
});

// --- Schedule a recurring job (every day at 9 AM) ---
await qstash.schedules.create({
  destination: "https://your-app.vercel.app/api/daily-report",
  cron: "0 9 * * *", // every day at 9:00 AM
  body: JSON.stringify({ report: "daily-summary" }),
});

// --- The receiving endpoint (Next.js API route) ---
// app/api/send-email/route.ts
export async function POST(request) {
  const body = await request.json();
  // Actually send the email here
  await sendEmail(body.to, body.subject, body.message);
  return new Response("OK");
}
```

---

### 3. Vector — AI Vector Database

#### What it does
Stores **vectors** (lists of numbers that represent meaning). When you search, it finds the **most similar** vectors. This is how AI apps do "semantic search" — finding things by meaning, not exact keywords.

#### When to use it
- **AI chatbots**: Find relevant documents to answer questions (RAG)
- **Semantic search**: Search by meaning, not keywords ("happy" finds "joyful")
- **Recommendation systems**: "Users who liked X also liked Y"
- **Image search**: Find visually similar images
- **Content discovery**: Show related articles/products

#### How it works

```
"How to cook pasta"  -->  AI Model (OpenAI/etc)  -->  [0.23, -0.45, 0.12, ...]
                                                            |
                                                            v
                                                      Upstash Vector
                                                            |
                                                    Finds similar vectors
                                                            |
                                                            v
                                                   "Italian recipes guide"
                                                   "Pasta making basics"
                                                   "Quick dinner ideas"
```

Text gets converted to numbers (embeddings) → stored in Vector → search finds the closest matches.

#### Code Example

```bash
npm install @upstash/vector
```

```javascript
// vector-example.js
import { Index } from "@upstash/vector";

const index = new Index({
  url: "https://your-vector-url.upstash.io",
  token: "your-token",
});

// --- Store documents as vectors ---
// (In real apps, you'd use OpenAI/etc to generate embeddings)
await index.upsert([
  {
    id: "doc-1",
    vector: [0.23, -0.45, 0.12, 0.89], // embedding from AI model
    metadata: { title: "Italian Pasta Guide", category: "cooking" },
  },
  {
    id: "doc-2",
    vector: [0.21, -0.43, 0.15, 0.87], // similar to doc-1
    metadata: { title: "Quick Dinner Recipes", category: "cooking" },
  },
  {
    id: "doc-3",
    vector: [-0.91, 0.33, 0.78, -0.12], // very different
    metadata: { title: "JavaScript Basics", category: "programming" },
  },
]);

// --- Search for similar documents ---
const results = await index.query({
  vector: [0.22, -0.44, 0.13, 0.88], // query: "how to make pasta"
  topK: 2, // return top 2 matches
  includeMetadata: true,
});

console.log(results);
// [
//   { id: "doc-1", score: 0.99, metadata: { title: "Italian Pasta Guide" } },
//   { id: "doc-2", score: 0.97, metadata: { title: "Quick Dinner Recipes" } },
// ]
// Notice: "JavaScript Basics" is NOT returned — it's not similar
```

---

### 4. Workflow — Durable Serverless Functions

#### What it does
Breaks long-running tasks into **steps**. If a step fails, it retries just that step (not the whole thing). If your serverless function times out, it picks up where it left off. No work is lost.

#### When to use it
- **Multi-step processes**: Sign up → send email → create profile → notify team
- **Long tasks on Vercel**: Vercel functions timeout at 10s, Workflow handles hours
- **Payment flows**: Charge card → create order → send receipt → update inventory
- **AI pipelines**: Generate embedding → search → summarize → respond

#### How it works

```
Step 1: Charge payment    ✅ Done (saved)
Step 2: Create order      ✅ Done (saved)
Step 3: Send email        ❌ Failed!
         ↓
    Auto-retry Step 3     ✅ Done (saved)
Step 4: Update inventory  ✅ Done

Each step's result is saved. If anything fails,
it resumes from the failed step — not from scratch.
```

#### Code Example

```bash
npm install @upstash/workflow
```

```javascript
// workflow-example.js (Next.js API route)
import { serve } from "@upstash/workflow/nextjs";

export const { POST } = serve(async (context) => {
  const { userId, plan } = context.requestPayload;

  // Step 1: Charge payment
  const payment = await context.run("charge-payment", async () => {
    const result = await stripe.charges.create({
      amount: plan.price,
      customer: userId,
    });
    return result;
  });

  // Step 2: Create order (only runs if Step 1 succeeded)
  const order = await context.run("create-order", async () => {
    return await db.orders.create({
      userId,
      paymentId: payment.id,
      plan: plan.name,
    });
  });

  // Step 3: Send confirmation email
  await context.run("send-email", async () => {
    await sendEmail({
      to: userId,
      subject: "Order Confirmed!",
      body: `Your order #${order.id} is confirmed.`,
    });
  });

  // Step 4: Wait 24 hours, then send follow-up
  await context.sleep("wait-for-followup", 60 * 60 * 24); // 24 hours

  // Step 5: Send follow-up (runs 24 hours later)
  await context.run("send-followup", async () => {
    await sendEmail({
      to: userId,
      subject: "How's everything going?",
      body: "Let us know if you need help with your new plan!",
    });
  });
});
```

---

### 5. Kafka — Event Streaming

#### What it does
Like a message queue, but designed for **high-volume event streaming**. Multiple services can produce and consume events from topics. Messages are stored and can be replayed.

#### When to use it
- **Event-driven architecture**: Services communicate through events
- **Activity tracking**: Log every user action for analytics
- **Log aggregation**: Collect logs from multiple services
- **Data pipelines**: Stream data from one system to another
- **Real-time processing**: Process events as they happen

#### How it works

```
Service A (Producer)  ──"user signed up"──→  Kafka Topic: "user-events"
                                                    |
                                    ┌───────────────┼───────────────┐
                                    ↓               ↓               ↓
                              Consumer 1      Consumer 2      Consumer 3
                             (Send email)   (Update stats)  (Create profile)
```

Multiple consumers can independently read from the same topic at their own pace.

#### Code Example

```bash
npm install @upstash/kafka
```

```javascript
// kafka-example.js
import { Kafka } from "@upstash/kafka";

const kafka = new Kafka({
  url: "https://your-kafka-url.upstash.io",
  username: "your-username",
  password: "your-password",
});

// --- Producer: Send events ---
const producer = kafka.producer();

await producer.produce("user-events", JSON.stringify({
  event: "user_signed_up",
  userId: "user-123",
  email: "dhruval@example.com",
  timestamp: Date.now(),
}));

await producer.produce("user-events", JSON.stringify({
  event: "order_placed",
  userId: "user-123",
  orderId: "order-456",
  amount: 2999,
}));

// --- Consumer: Read events ---
const consumer = kafka.consumer();

const messages = await consumer.consume({
  consumerGroupId: "email-service",
  instanceId: "instance-1",
  topics: ["user-events"],
  autoOffsetReset: "earliest",
});

for (const msg of messages) {
  const event = JSON.parse(msg.value);
  console.log(`Got event: ${event.event} for user: ${event.userId}`);
}
```

---

## Quick Comparison: When to Use What

| Need | Use This | Why |
|------|----------|-----|
| Cache API responses | **Redis** | Fastest reads, simple key-value |
| Send background jobs | **QStash** | Guaranteed delivery, retries |
| AI/semantic search | **Vector** | Finds similar items by meaning |
| Multi-step processes | **Workflow** | Survives timeouts, auto-retries steps |
| Stream events between services | **Kafka** | High volume, multiple consumers |
| Rate limiting | **Redis** | Built-in counters with expiry |
| Cron jobs / scheduling | **QStash** | Cron syntax, no server needed |
| User sessions | **Redis** | Fast reads, TTL support |

---

## Getting Started

1. Go to [console.upstash.com](https://console.upstash.com) and create a free account
2. Create a Redis database (or any service)
3. Copy your REST URL and Token
4. Install the SDK: `npm install @upstash/redis`
5. Use it in your code

No credit card required for the free tier.

---

## Sources

- [Upstash Official Website](https://upstash.com)
- [Upstash Redis Pricing](https://upstash.com/pricing/redis)
- [Upstash QStash Pricing](https://upstash.com/pricing/qstash)
- [Upstash Vector Pricing](https://upstash.com/pricing/vector)
- [Upstash Workflow Pricing](https://upstash.com/pricing/workflow)
- [Upstash New Redis Pricing Blog](https://upstash.com/blog/redis-new-pricing)
- [Upstash Redis Documentation](https://upstash.com/docs/redis/overall/pricing)
