# BullMQ vs RabbitMQ

**BullMQ** is a job queue library for Node.js built on top of **Redis**. It solves a similar problem (queuing jobs) but in a very different way.

---

## How They Compare

| Feature | RabbitMQ | BullMQ |
|---------|----------|--------|
| Type | Standalone server (Erlang) | Node.js library + Redis |
| Purpose | General-purpose message broker | Purpose-built job queue for Node.js |
| Job tracking | You build it yourself | Built-in (status, progress, retries) |
| Language support | Works with any language | Node.js only |
| Retry logic | Manual | Auto-retry, backoff, delay built-in |
| Progress tracking | Manual (publish to exchanges) | `job.updateProgress(50)` built-in |
| Dashboard | No dashboard included | Free Bull Board dashboard |

---

## When to Use What

| Use Case | Winner |
|----------|--------|
| Node.js background jobs (emails, image processing) | **BullMQ** — built for this |
| Microservices talking to each other (Node + Python + Go) | **RabbitMQ** — language agnostic |
| Need retries, delays, rate limiting, repeatable jobs | **BullMQ** — all built-in |
| Pub/Sub, routing, complex message patterns | **RabbitMQ** — more flexible |
| Quick setup, less infrastructure | **BullMQ** — just needs Redis |
| Enterprise scale, millions of messages/sec | **RabbitMQ** — battle-tested at massive scale |

---

## BullMQ's Killer Features

Things you had to build manually in RabbitMQ:

1. **Auto-retry with backoff** — job fails? Auto-retry 3 times with increasing delays
2. **Job progress** — `job.updateProgress(50)` instead of manually publishing to exchanges
3. **Job states** — waiting → active → completed/failed (tracked automatically)
4. **Delayed jobs** — "run this job 5 minutes from now"
5. **Rate limiting** — "process max 10 jobs per second"
6. **Repeatable jobs** — "run this every hour" (like cron)
7. **Dashboard** — Bull Board gives you a web UI for free

---

## Simple Comparison

What you built in RabbitMQ mini-project (5 files, ~200 lines) becomes this in BullMQ:

```js
// Producer - 3 lines
const queue = new Queue("image-jobs");
await queue.add("process", { image: "photo.jpg", tasks: ["resize"] });
// Done. Job is tracked automatically.

// Worker - just the processing logic
const worker = new Worker("image-jobs", async (job) => {
  await job.updateProgress(50); // built-in!
  // ... process image ...
  return { outputFile: "result.jpg" }; // auto-saved as job result
});
```

---

## Bottom Line

> **RabbitMQ** = powerful message broker for connecting different services
> **BullMQ** = batteries-included job queue for Node.js apps

Since you're working in Node.js and doing job processing, **BullMQ is the simpler, more practical choice**. RabbitMQ is great to know for when you need cross-language messaging or complex routing.
