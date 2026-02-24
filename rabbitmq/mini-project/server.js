// server.js - Express API (the PRODUCER)
// Receives image job requests and pushes them to RabbitMQ

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { createChannel, JOB_QUEUE, PROGRESS_EXCHANGE } = require("./rabbitmq");
const { createJob, updateJob, getJob, getAllJobs } = require("./jobStore");

const app = express();
app.use(express.json());

let channel = null;

// ─── Setup RabbitMQ on startup ───
async function setupRabbitMQ() {
  channel = await createChannel();

  // Create the job queue (durable = survives RabbitMQ restart)
  await channel.assertQueue(JOB_QUEUE, { durable: true });

  // Create pub/sub exchange for progress updates
  // "fanout" = broadcast to ALL listeners (like a radio station)
  await channel.assertExchange(PROGRESS_EXCHANGE, "fanout", { durable: false });

  // Listen for progress updates from workers
  // (server subscribes to know when jobs finish)
  const { queue: tempQueue } = await channel.assertQueue("", {
    exclusive: true,
  });
  await channel.bindQueue(tempQueue, PROGRESS_EXCHANGE, "");

  channel.consume(tempQueue, (msg) => {
    if (msg) {
      const update = JSON.parse(msg.content.toString());
      console.log(`📡 Progress update: Job ${update.jobId} → ${update.status} (${update.progress}%)`);

      // Update our job store
      updateJob(update.jobId, {
        status: update.status,
        progress: update.progress,
        results: update.results || [],
      });

      channel.ack(msg);
    }
  });

  console.log("📮 RabbitMQ queues and exchanges ready");
}

// ─── API Routes ───

// POST /jobs - Submit a new image processing job
app.post("/jobs", async (req, res) => {
  const { image, tasks } = req.body;
  // image: filename (e.g. "photo.jpg")
  // tasks: array of what to do (e.g. ["resize", "grayscale", "blur"])

  if (!image || !tasks || !tasks.length) {
    return res.status(400).json({
      error: 'Send { "image": "photo.jpg", "tasks": ["resize", "grayscale", "blur"] }',
    });
  }

  // Create a job ID
  const jobId = uuidv4().slice(0, 8);
  const job = createJob(jobId, image);

  // Send job to RabbitMQ queue
  const message = JSON.stringify({ jobId, image, tasks });
  channel.sendToQueue(JOB_QUEUE, Buffer.from(message), {
    persistent: true, // message survives RabbitMQ restart
  });

  console.log(`📤 Job ${jobId} queued: ${tasks.join(", ")} on "${image}"`);

  res.json({
    message: "Job queued! Worker will pick it up.",
    job,
  });
});

// GET /jobs - List all jobs
app.get("/jobs", (req, res) => {
  res.json(getAllJobs());
});

// GET /jobs/:id - Get specific job status
app.get("/jobs/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// ─── Start Server ───
const PORT = 3001;

setupRabbitMQ().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
    console.log(`\n📌 Try this command to submit a job:`);
    console.log(
      `   curl -X POST http://localhost:3001/jobs -H "Content-Type: application/json" -d '{"image":"photo.jpg","tasks":["resize","grayscale","blur"]}'`
    );
    console.log(`\n📌 Check job status:`);
    console.log(`   curl http://localhost:3001/jobs`);
  });
});
