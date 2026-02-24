// dashboard.js - Bull Board Dashboard (FREE web UI!)
// This is something RabbitMQ doesn't give you out of the box for jobs

const express = require("express");
const { Queue } = require("bullmq");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/dashboard");

const imageQueue = new Queue("image-jobs", {
  connection: { host: "localhost", port: 6379 },
});

createBullBoard({
  queues: [new BullMQAdapter(imageQueue)],
  serverAdapter,
});

const app = express();
app.use("/dashboard", serverAdapter.getRouter());

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`\n📊 Bull Board Dashboard running on http://localhost:${PORT}/dashboard`);
  console.log(`   See all jobs, their states, progress, retries, and errors!`);
});
