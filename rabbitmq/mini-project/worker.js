// worker.js - The CONSUMER (picks up jobs and processes images)
// This is where the LONG RUNNING WORK happens (10-15 sec per job)
// You can run MULTIPLE workers to process jobs in parallel!

const path = require("path");
const sharp = require("sharp");
const { createChannel, JOB_QUEUE, PROGRESS_EXCHANGE } = require("./rabbitmq");

// Worker ID (so you can see which worker handles which job)
const WORKER_ID = `worker-${process.pid}`;

async function startWorker() {
  const channel = await createChannel();

  // Make sure queue exists
  await channel.assertQueue(JOB_QUEUE, { durable: true });

  // Make sure progress exchange exists
  await channel.assertExchange(PROGRESS_EXCHANGE, "fanout", { durable: false });

  // Only take 1 job at a time (fair dispatch)
  // Without this, RabbitMQ sends all jobs to one worker
  channel.prefetch(1);

  console.log(`\n🔧 ${WORKER_ID} waiting for image jobs...`);
  console.log(`   (Press Ctrl+C to stop)\n`);

  // Start consuming jobs from the queue
  channel.consume(JOB_QUEUE, async (msg) => {
    if (!msg) return;

    const job = JSON.parse(msg.content.toString());
    console.log(`\n📥 ${WORKER_ID} picked up Job ${job.jobId}`);
    console.log(`   Image: ${job.image}`);
    console.log(`   Tasks: ${job.tasks.join(", ")}`);

    try {
      // Publish: "I'm starting this job"
      publishProgress(channel, job.jobId, "processing", 0, []);

      const results = [];
      const totalTasks = job.tasks.length;

      // Process each task one by one (each takes a few seconds)
      for (let i = 0; i < totalTasks; i++) {
        const task = job.tasks[i];
        console.log(`   ⏳ Running "${task}"...`);

        const outputFile = await processImage(job.image, task, job.jobId);
        results.push({ task, outputFile });

        // Calculate and publish progress
        const progress = Math.round(((i + 1) / totalTasks) * 100);
        publishProgress(channel, job.jobId, "processing", progress, results);

        console.log(`   ✅ "${task}" done (${progress}%)`);
      }

      // Publish: "I'm done with this job"
      publishProgress(channel, job.jobId, "done", 100, results);
      console.log(`\n🎉 Job ${job.jobId} COMPLETE! (${results.length} tasks done)`);

      // Acknowledge - tell RabbitMQ we finished this job
      channel.ack(msg);
    } catch (error) {
      console.error(`\n❌ Job ${job.jobId} FAILED:`, error.message);

      // Publish failure
      publishProgress(channel, job.jobId, "failed", 0, []);

      // Reject and DON'T requeue (don't retry forever)
      channel.nack(msg, false, false);
    }
  });
}

// ─── Publish progress to the fan-out exchange ───
// ALL subscribers will receive this (server, logger, dashboard, etc.)
function publishProgress(channel, jobId, status, progress, results) {
  const update = JSON.stringify({ jobId, status, progress, results, worker: WORKER_ID });
  channel.publish(PROGRESS_EXCHANGE, "", Buffer.from(update));
}

// ─── Image Processing (the slow part - simulates 10-15 sec total) ───
async function processImage(imageName, task, jobId) {
  const inputPath = path.join(__dirname, "uploads", imageName);
  const outputName = `${jobId}-${task}.jpg`;
  const outputPath = path.join(__dirname, "output", outputName);

  // Create a test image if the input doesn't exist
  // (so you can test without real images)
  let pipeline = sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 100, g: 150, b: 200 },
    },
  });

  // Try to use real image if it exists
  try {
    const fs = require("fs");
    if (fs.existsSync(inputPath)) {
      pipeline = sharp(inputPath);
    }
  } catch {
    // use generated image
  }

  // Apply the requested transformation
  switch (task) {
    case "resize":
      // Simulate long work: resize to multiple sizes
      await sleep(4000); // 4 seconds
      pipeline = pipeline.resize(400, 300, { fit: "cover" });
      break;

    case "grayscale":
      // Simulate long work: convert to grayscale
      await sleep(4000); // 4 seconds
      pipeline = pipeline.grayscale();
      break;

    case "blur":
      // Simulate long work: apply heavy blur
      await sleep(5000); // 5 seconds
      pipeline = pipeline.blur(10);
      break;

    case "rotate":
      // Simulate long work: rotate image
      await sleep(3001); // 3 seconds
      pipeline = pipeline.rotate(90);
      break;

    default:
      await sleep(3001);
      console.log(`   ⚠️  Unknown task "${task}", skipping processing`);
  }

  // Save the result
  await pipeline.jpeg().toFile(outputPath);

  return outputName;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

startWorker();
