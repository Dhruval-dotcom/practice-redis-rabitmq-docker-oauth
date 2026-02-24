# Mini Project: Image Processing Job Manager (BullMQ)

## How to Run (3 Terminals)

`cd mini-project-bullmq` then:

**Terminal 1** - API server:
```bash
npm run server
```

**Terminal 2** - Worker:
```bash
npm run worker
```

**Terminal 3** - Dashboard (optional, nice web UI):
```bash
npm run dashboard
```

---

## Try These Scenarios

### 1. Normal job (~13 sec)

```bash
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -d '{"image":"photo.jpg","tasks":["resize","grayscale","blur"]}'
```

### 2. Delayed job (starts after 10 seconds)

```bash
curl -X POST http://localhost:3001/jobs/delayed \
  -H "Content-Type: application/json" \
  -d '{"image":"photo.jpg","tasks":["resize"],"delaySeconds":10}'
```

### 3. Failing job with auto-retry (the fun one!)

```bash
curl -X POST http://localhost:3001/jobs/fail-test
```

Watch the worker terminal — it will:
- **Attempt 1:** crash on `FAIL_ON_PURPOSE` task
- **Wait 2s** (exponential backoff)
- **Attempt 2:** crash again
- **Wait 4s** (backoff doubles)
- **Attempt 3:** recover and complete!

### 4. Check job states

```bash
curl http://localhost:3001/jobs | jq
```

### 5. Dashboard

Open http://localhost:3002/dashboard to see all jobs visually.

---

## Project Structure

```
mini-project-bullmq/
├── server.js      ← Express API - queues jobs (3 endpoints: normal, delayed, fail-test)
├── worker.js      ← Processes images, handles failures, auto-retry
├── dashboard.js   ← Bull Board web UI on port 3002
├── uploads/       ← Put real images here (optional)
└── output/        ← Processed images appear here
```

---

## What's Different from RabbitMQ Version

| Feature | RabbitMQ (you built) | BullMQ (built-in) |
|---------|---------------------|-------------------|
| **Retry on failure** | Not implemented | `attempts: 3, backoff: "exponential"` |
| **Progress tracking** | Manual pub/sub exchange + logger.js | `job.updateProgress(50)` |
| **Job status** | Manual jobStore.js | `job.getState()` auto-tracked |
| **Delayed jobs** | Not possible without plugins | `delay: 10000` one line |
| **Dashboard** | None | Bull Board free |
| **Files needed** | 5 files | 3 files |
| **Connection setup** | channel, assertQueue, assertExchange, bind | `new Queue("name")` done |
