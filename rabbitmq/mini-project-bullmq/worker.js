// worker.js - The WORKER (picks up jobs and processes images)
// Compare with RabbitMQ version - no channel.consume, no ack/nack needed!

const path = require("path");
const sharp = require("sharp");
const { Worker } = require("bullmq");

const WORKER_ID = `worker-${process.pid}`;

// ─── Create a Worker ───
// BullMQ handles: consuming, acknowledgment, retries, progress - all automatic!
const worker = new Worker(
  "image-jobs", // must match the queue name in server.js
  async (job) => {
    // This function runs for each job
    console.log(`\n📥 ${WORKER_ID} picked up Job ${job.id}`);
    console.log(`   Image: ${job.data.image}`);
    console.log(`   Tasks: ${job.data.tasks.join(", ")}`);
    console.log(`   Attempt: ${job.attemptsMade + 1} of ${job.opts.attempts}`);

    const results = [];
    const totalTasks = job.data.tasks.length;

    for (let i = 0; i < totalTasks; i++) {
      const task = job.data.tasks[i];
      console.log(`   ⏳ Running "${task}"...`);

      // ─── Simulate failure scenario ───
      if (task === "FAIL_ON_PURPOSE") {
        // Fail on first 2 attempts, succeed on 3rd
        if (job.attemptsMade < 2) {
          console.log(`   💥 CRASH! Task "${task}" failed (attempt ${job.attemptsMade + 1})`);
          console.log(`   🔄 BullMQ will auto-retry with exponential backoff...`);
          throw new Error(`Simulated failure on attempt ${job.attemptsMade + 1}`);
        }
        // 3rd attempt succeeds
        console.log(`   🩹 Attempt ${job.attemptsMade + 1}: recovered! Continuing...`);
        await sleep(2000);
        results.push({ task: "recovery", outputFile: "recovered.jpg" });

        const progress = Math.round(((i + 1) / totalTasks) * 100);
        await job.updateProgress(progress);
        console.log(`   ✅ "${task}" recovered (${progress}%)`);
        continue;
      }

      const outputFile = await processImage(job.data.image, task, job.id);
      results.push({ task, outputFile });

      // ─── Built-in progress tracking! ───
      // No need to publish to a fanout exchange like RabbitMQ
      const progress = Math.round(((i + 1) / totalTasks) * 100);
      await job.updateProgress(progress);
      console.log(`   ✅ "${task}" done (${progress}%)`);
    }

    console.log(`\n🎉 Job ${job.id} COMPLETE! (${results.length} tasks done)`);

    // Return value is automatically saved by BullMQ
    // You can retrieve it later with job.returnvalue
    return { results, processedBy: WORKER_ID };
  },
  {
    connection: { host: "localhost", port: 6379 },
    concurrency: 1, // process 1 job at a time (like prefetch(1) in RabbitMQ)
  }
);

// ─── Event Listeners (BullMQ built-in!) ───
// No need to set up pub/sub exchanges - events come free

worker.on("completed", (job, result) => {
  console.log(`\n📡 Event: Job ${job.id} completed by ${result.processedBy}`);
});

worker.on("failed", (job, error) => {
  if (job.attemptsMade < job.opts.attempts) {
    const delay = 2000 * Math.pow(2, job.attemptsMade - 1); // exponential backoff
    console.log(`\n📡 Event: Job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts})`);
    console.log(`   Reason: ${error.message}`);
    console.log(`   ⏳ Will retry in ~${delay / 1000}s (exponential backoff)`);
  } else {
    console.log(`\n📡 Event: Job ${job.id} permanently FAILED after ${job.attemptsMade} attempts`);
    console.log(`   Reason: ${error.message}`);
  }
});

worker.on("progress", (job, progress) => {
  console.log(`📡 Event: Job ${job.id} progress → ${progress}%`);
});

console.log(`\n🔧 ${WORKER_ID} waiting for image jobs...`);
console.log(`   (Press Ctrl+C to stop)\n`);

// ─── Image Processing (same as RabbitMQ version) ───
async function processImage(imageName, task, jobId) {
  const outputName = `${jobId}-${task}.jpg`;
  const outputPath = path.join(__dirname, "output", outputName);
  const inputPath = path.join(__dirname, "uploads", imageName);

  let pipeline = sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 100, g: 150, b: 200 },
    },
  });

  try {
    const fs = require("fs");
    if (fs.existsSync(inputPath)) {
      pipeline = sharp(inputPath);
    }
  } catch {
    // use generated image
  }

  switch (task) {
    case "resize":
      await sleep(4000);
      pipeline = pipeline.resize(400, 300, { fit: "cover" });
      break;
    case "grayscale":
      await sleep(4000);
      pipeline = pipeline.grayscale();
      break;
    case "blur":
      await sleep(5000);
      pipeline = pipeline.blur(10);
      break;
    case "rotate":
      await sleep(3000);
      pipeline = pipeline.rotate(90);
      break;
    default:
      await sleep(3000);
      console.log(`   ⚠️  Unknown task "${task}", skipping`);
  }

  await pipeline.jpeg().toFile(outputPath);
  return outputName;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
