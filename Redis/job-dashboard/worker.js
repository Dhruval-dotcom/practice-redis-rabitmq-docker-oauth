/**
 * BullMQ Worker - Processes Jobs in Background
 *
 * WHAT IS BullMQ?
 * A production-grade job queue built on Redis.
 * Used by companies like: Salesforce, GitLab, Autodesk
 *
 * HOW IT WORKS:
 *   1. Your app adds a job to the queue (like dropping a letter in a mailbox)
 *   2. The worker picks up the job and processes it (like a mail carrier)
 *   3. If the worker crashes, BullMQ auto-retries the job
 *
 * WHY BullMQ OVER PLAIN REDIS LISTS?
 *   ✅ Automatic retries on failure
 *   ✅ Job priority (urgent jobs first)
 *   ✅ Delayed jobs (run in 5 minutes)
 *   ✅ Rate limiting (max 10 jobs per second)
 *   ✅ Progress tracking (50% done...)
 *   ✅ Job events (started, completed, failed)
 *   ✅ Concurrency (process 3 jobs at once)
 *   ✅ Dashboard ready (BullBoard UI)
 *
 * UNDER THE HOOD:
 * BullMQ uses Redis for EVERYTHING:
 *   - Lists for the job queue
 *   - Hashes for job data
 *   - Sorted Sets for delayed/priority jobs
 *   - Pub/Sub for real-time events
 *   - Lua scripts for atomic operations
 */

const { Worker } = require("bullmq");
const { addEvent } = require("./eventStream");

const QUEUE_NAME = "tasks";

// -------- Job Processors --------
// Each job type has its own processing logic

const jobProcessors = {
  "image-resize": async (job) => {
    const steps = ["Downloading image", "Resizing to 800x600", "Compressing", "Saving"];
    for (let i = 0; i < steps.length; i++) {
      await sleep(800);
      // Update progress (0-100) - BullMQ tracks this in Redis
      await job.updateProgress(Math.round(((i + 1) / steps.length) * 100));
      console.log(`    [image-resize] ${steps[i]}... (${job.data.filename})`);
    }
    return { outputFile: `resized_${job.data.filename}`, size: "800x600" };
  },

  "send-email": async (job) => {
    await sleep(500);
    await job.updateProgress(50);
    console.log(`    [send-email] Sending to ${job.data.to}...`);
    await sleep(500);
    await job.updateProgress(100);
    return { sent: true, to: job.data.to };
  },

  "generate-report": async (job) => {
    const steps = ["Querying database", "Calculating stats", "Building charts", "Generating PDF"];
    for (let i = 0; i < steps.length; i++) {
      await sleep(1000);
      await job.updateProgress(Math.round(((i + 1) / steps.length) * 100));
      console.log(`    [generate-report] ${steps[i]}... (${job.data.reportType})`);
    }
    // 10% chance of failure (to demo retry behavior)
    if (Math.random() < 0.1) {
      throw new Error("Database connection timeout");
    }
    return { file: `${job.data.reportType}_report.pdf`, pages: 12 };
  },
};

// -------- Create the Worker --------

function startWorker(io) {
  // io = Socket.io instance for sending live updates to browser

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(`  [Worker] Processing job #${job.id}: ${job.name}`);

      // Log event to Redis Stream
      await addEvent("job.started", {
        jobId: job.id,
        jobName: job.name,
        message: `Processing ${job.name}...`,
      });

      // Notify browser via Socket.io
      io.emit("job:started", { jobId: job.id, name: job.name });

      // Find the right processor for this job type
      const processor = jobProcessors[job.name];

      if (!processor) {
        throw new Error(`Unknown job type: ${job.name}`);
      }

      // Run the processor
      const result = await processor(job);
      return result;
    },
    {
      connection: { host: "localhost", port: 6379 },
      concurrency: 2, // Process 2 jobs at the same time
    }
  );

  // -------- Worker Events --------

  // Job completed successfully
  worker.on("completed", async (job, result) => {
    console.log(`  [Worker] Job #${job.id} completed!`);

    await addEvent("job.completed", {
      jobId: job.id,
      jobName: job.name,
      message: `Completed: ${JSON.stringify(result)}`,
    });

    io.emit("job:completed", {
      jobId: job.id,
      name: job.name,
      result: result,
    });
  });

  // Job failed
  worker.on("failed", async (job, err) => {
    console.log(`  [Worker] Job #${job.id} FAILED: ${err.message}`);

    await addEvent("job.failed", {
      jobId: job.id,
      jobName: job.name,
      message: `Failed: ${err.message}`,
    });

    io.emit("job:failed", {
      jobId: job.id,
      name: job.name,
      error: err.message,
      attemptsLeft: job.opts.attempts - job.attemptsMade,
    });
  });

  // Job progress updated
  worker.on("progress", (job, progress) => {
    io.emit("job:progress", {
      jobId: job.id,
      name: job.name,
      progress: progress,
    });
  });

  console.log("  Worker started! Waiting for jobs...\n");
  return worker;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { startWorker, QUEUE_NAME };
