/**
 * Job Dashboard Server
 *
 * Run: node server.js
 * Open: http://localhost:3000
 *
 * WHAT THIS COMBINES:
 *
 * 1. BullMQ (Job Queue)
 *    - You submit jobs → Redis stores them in a queue
 *    - Worker picks them up and processes in background
 *    - Auto-retries failed jobs
 *
 * 2. Redis Streams (Event Log)
 *    - Every job event (added, started, completed, failed) is logged
 *    - Stream is append-only (like a permanent log)
 *    - You can read old events anytime (unlike Pub/Sub)
 *
 * 3. Socket.io (Real-time Updates)
 *    - Server pushes updates to browser instantly
 *    - No page refresh needed
 *    - Browser connects via WebSocket
 *
 * HOW THEY WORK TOGETHER:
 *
 *   Browser                Server                 Redis
 *   ──────                ──────                 ─────
 *   Click "Submit" ──→ Add to BullMQ Queue ──→ Redis List
 *                                               │
 *                     Worker picks up job ←─────┘
 *                         │
 *                         ├──→ Log to Redis Stream ──→ Redis Stream
 *                         │
 *                         └──→ Emit via Socket.io ──→ Browser updates!
 */

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Queue } = require("bullmq");
const { addEvent, getRecentEvents, getStreamLength, createConsumerGroup } = require("./eventStream");
const { startWorker, QUEUE_NAME } = require("./worker");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// BullMQ Queue (this is where jobs are submitted)
const queue = new Queue(QUEUE_NAME, {
  connection: { host: "localhost", port: 6379 },
});

// Serve the dashboard HTML
app.use(express.static(path.join(__dirname, "public")));

// -------- Socket.io: Handle Browser Connections --------

io.on("connection", (socket) => {
  console.log(`  Browser connected: ${socket.id}`);

  // Send current stats immediately when browser connects
  sendStats();

  // Send recent events from Redis Stream (so browser shows history)
  getRecentEvents(20).then((events) => {
    // Send in chronological order (oldest first)
    events.reverse().forEach((event) => {
      socket.emit(`job:${event.type.replace("job.", "")}`, {
        jobId: event.jobId,
        name: event.jobName,
        message: event.message,
        isHistory: true, // so browser knows this is old
      });
    });
  });

  // Handle job submission from browser
  socket.on("submit:job", async (data) => {
    let jobData = {};

    // Create appropriate data for each job type
    switch (data.type) {
      case "image-resize":
        jobData = { filename: `photo_${Date.now()}.jpg`, width: 800, height: 600 };
        break;
      case "send-email":
        jobData = { to: `user${Math.floor(Math.random() * 1000)}@example.com`, subject: "Hello!" };
        break;
      case "generate-report":
        jobData = { reportType: ["sales", "users", "revenue"][Math.floor(Math.random() * 3)] };
        break;
    }

    // Add job to BullMQ queue
    const job = await queue.add(data.type, jobData, {
      attempts: 3, // retry up to 3 times on failure
      backoff: {
        type: "exponential", // wait longer between each retry
        delay: 1000, // first retry after 1 second
      },
    });

    console.log(`  Job #${job.id} submitted: ${data.type}`);

    // Log to Redis Stream
    await addEvent("job.added", {
      jobId: job.id,
      jobName: data.type,
      message: `Added to queue: ${JSON.stringify(jobData)}`,
    });

    // Notify ALL connected browsers
    io.emit("job:added", {
      jobId: job.id,
      name: data.type,
      data: jobData,
    });

    // Update stats
    sendStats();
  });

  socket.on("disconnect", () => {
    console.log(`  Browser disconnected: ${socket.id}`);
  });
});

// -------- Stats: Send queue stats to all browsers --------

async function sendStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  const streamLength = await getStreamLength();

  io.emit("stats:update", {
    waiting,
    active,
    completed,
    failed,
    streamLength,
  });
}

// Update stats every 2 seconds
setInterval(sendStats, 2000);

// -------- Start Everything --------

async function main() {
  // Create consumer group for Redis Streams (for the demo)
  await createConsumerGroup("dashboard-workers");

  // Start the BullMQ worker (processes jobs)
  startWorker(io);

  // Start the HTTP server
  const PORT = 3000;
  httpServer.listen(PORT, () => {
    console.log(`\n  Dashboard: http://localhost:${PORT}`);
    console.log("  Open it in your browser and start submitting jobs!\n");
    console.log("  What to try:");
    console.log("  1. Click 'Submit Image Resize' - watch it process with progress bar");
    console.log("  2. Click 'Submit 5 Jobs at Once' - watch them queue and process");
    console.log("  3. Watch the Redis Stream panel - every event is logged");
    console.log("  4. Open a SECOND browser tab - both tabs update in real-time!\n");
  });
}

main();
