// server.js - Express API (the PRODUCER)
// Receives image job requests and adds them to the BullMQ queue
// Compare with RabbitMQ version - no channel/exchange setup needed!

const express = require("express");
const { Queue } = require("bullmq");

const app = express();
app.use(express.json());

// ─── Create the queue (that's it! no channel, no exchange, no assertQueue) ───
const imageQueue = new Queue("image-jobs", {
  connection: { host: "localhost", port: 6379 },
});

// ─── API Routes ───

// POST /jobs - Submit a new image processing job
app.post("/jobs", async (req, res) => {
  const { image, tasks } = req.body;

  if (!image || !tasks || !tasks.length) {
    return res.status(400).json({
      error: 'Send { "image": "photo.jpg", "tasks": ["resize", "grayscale", "blur"] }',
    });
  }

  // Add job to the queue
  // BullMQ auto-generates an ID and tracks everything
  const job = await imageQueue.add(
    "process-image", // job name
    { image, tasks }, // job data
    {
      attempts: 3, // ← auto-retry up to 3 times on failure!
      backoff: {
        type: "exponential", // wait longer between each retry
        delay: 2000, // 1st retry: 2s, 2nd: 4s, 3rd: 8s
      },
    }
  );

  console.log(`📤 Job ${job.id} queued: ${tasks.join(", ")} on "${image}"`);

  res.json({
    message: "Job queued! Worker will pick it up.",
    jobId: job.id,
    name: job.name,
  });
});

// GET /jobs - List all jobs with their states
app.get("/jobs", async (req, res) => {
  // BullMQ tracks job states automatically!
  const [waiting, active, completed, failed] = await Promise.all([
    imageQueue.getJobs(["waiting"]),
    imageQueue.getJobs(["active"]),
    imageQueue.getJobs(["completed"]),
    imageQueue.getJobs(["failed"]),
  ]);

  const formatJob = (job) => ({
    id: job.id,
    data: job.data,
    progress: job.progress,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason || null,
    returnvalue: job.returnvalue || null,
  });

  res.json({
    waiting: waiting.map(formatJob),
    active: active.map(formatJob),
    completed: completed.map(formatJob),
    failed: failed.map(formatJob),
  });
});

// GET /jobs/:id - Get specific job status
app.get("/jobs/:id", async (req, res) => {
  const job = await imageQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();

  res.json({
    id: job.id,
    state, // waiting, active, completed, failed, delayed
    progress: job.progress,
    data: job.data,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason || null,
    returnvalue: job.returnvalue || null,
  });
});

// POST /jobs/delayed - Submit a DELAYED job (runs after X seconds)
app.post("/jobs/delayed", async (req, res) => {
  const { image, tasks, delaySeconds } = req.body;

  if (!image || !tasks || !delaySeconds) {
    return res.status(400).json({
      error: 'Send { "image": "photo.jpg", "tasks": ["resize"], "delaySeconds": 10 }',
    });
  }

  const job = await imageQueue.add(
    "process-image",
    { image, tasks },
    {
      delay: delaySeconds * 1000, // ← BullMQ built-in! No manual setTimeout
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    }
  );

  console.log(`⏰ Job ${job.id} scheduled: will run in ${delaySeconds}s`);

  res.json({
    message: `Job will start in ${delaySeconds} seconds!`,
    jobId: job.id,
  });
});

// POST /jobs/fail-test - Submit a job that will FAIL (to see retries)
app.post("/jobs/fail-test", async (req, res) => {
  const job = await imageQueue.add(
    "process-image",
    {
      image: "photo.jpg",
      tasks: ["resize", "FAIL_ON_PURPOSE", "blur"], // worker will fail on this task
    },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    }
  );

  console.log(`💥 Job ${job.id} queued (will fail and retry 3 times)`);

  res.json({
    message: "Job queued! This one will FAIL and you'll see retries in action.",
    jobId: job.id,
    note: "Watch the worker terminal to see retry behavior!",
  });
});

// ─── Start Server ───
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`\n📌 Submit a normal job:`);
  console.log(
    `   curl -X POST http://localhost:3001/jobs -H "Content-Type: application/json" -d '{"image":"photo.jpg","tasks":["resize","grayscale","blur"]}'`
  );
  console.log(`\n📌 Submit a DELAYED job (starts after 10s):`);
  console.log(
    `   curl -X POST http://localhost:3001/jobs/delayed -H "Content-Type: application/json" -d '{"image":"photo.jpg","tasks":["resize"],"delaySeconds":10}'`
  );
  console.log(`\n📌 Submit a FAILING job (see retries):`);
  console.log(
    `   curl -X POST http://localhost:3001/jobs/fail-test`
  );
  console.log(`\n📌 Check all jobs:`);
  console.log(`   curl http://localhost:3001/jobs`);
});
