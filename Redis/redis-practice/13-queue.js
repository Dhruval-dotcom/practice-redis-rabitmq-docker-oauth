/**
 * 13 - Job Queue with Redis
 *
 * Run: node 13-queue.js
 *
 * THE PROBLEM:
 * User uploads a video. Processing takes 5 minutes.
 * You can't make the user wait 5 minutes for a response!
 *
 * THE SOLUTION:
 * 1. User uploads video → add a "process video" job to a Redis queue
 * 2. Respond immediately: "Your video is being processed!"
 * 3. A worker picks up the job from the queue and processes it in background
 *
 * HOW IT WORKS:
 * - Queue = Redis List
 * - Add job: RPUSH (add to end of list)
 * - Take job: LPOP (take from start of list) → First In, First Out
 *
 * REAL WORLD:
 * - Email sending (don't block the request)
 * - Image/video processing
 * - PDF generation
 * - Notification sending
 * - Data export
 */

const { createClient } = require("redis");

const client = createClient();

const QUEUE_KEY = "jobs:email";

// -------- PRODUCER: Add jobs to the queue --------

async function addJob(jobData) {
  const job = JSON.stringify({
    id: Date.now(),
    ...jobData,
    createdAt: new Date().toISOString(),
  });

  await client.rPush(QUEUE_KEY, job);
  console.log(`  [PRODUCER] Added job: ${jobData.type} → ${jobData.to}`);
}

// -------- WORKER: Process jobs from the queue --------

async function processNextJob() {
  // LPOP takes the oldest job (First In, First Out)
  const job = await client.lPop(QUEUE_KEY);

  if (!job) {
    return null; // No jobs in queue
  }

  const data = JSON.parse(job);
  console.log(`  [WORKER] Processing: Send ${data.type} to ${data.to}...`);

  // Simulate work (sending an email takes time)
  await sleep(1000);

  console.log(`  [WORKER] Done! ${data.type} sent to ${data.to}`);
  return data;
}

// -------- Demo --------

async function main() {
  await client.connect();
  console.log("Connected to Redis!\n");

  // Clear old jobs
  await client.del(QUEUE_KEY);

  // --- Step 1: Producer adds jobs to the queue ---
  console.log("=== STEP 1: Adding jobs to queue ===\n");

  await addJob({ type: "welcome-email", to: "alice@example.com" });
  await addJob({ type: "password-reset", to: "bob@example.com" });
  await addJob({ type: "order-confirmation", to: "charlie@example.com" });
  await addJob({ type: "invoice", to: "david@example.com" });
  await addJob({ type: "newsletter", to: "eve@example.com" });

  // Check queue length
  const queueLength = await client.lLen(QUEUE_KEY);
  console.log(`\n  Queue has ${queueLength} jobs waiting\n`);

  // --- Step 2: Worker processes jobs one by one ---
  console.log("=== STEP 2: Worker processing jobs ===\n");

  let processed = 0;
  while (true) {
    const result = await processNextJob();
    if (!result) {
      console.log("\n  [WORKER] Queue is empty! No more jobs.");
      break;
    }
    processed++;
  }

  console.log(`\n  Total processed: ${processed} jobs`);

  console.log("\n--- How this works in a real app ---");
  console.log("  Producer (web server)  →  Redis Queue  →  Worker (background process)");
  console.log("  They run as SEPARATE processes.");
  console.log("  Web server adds jobs and responds immediately.");
  console.log("  Worker keeps polling the queue for new jobs.\n");

  await client.disconnect();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
