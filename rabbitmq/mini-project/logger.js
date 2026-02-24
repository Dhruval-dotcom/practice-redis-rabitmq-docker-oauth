// logger.js - A PUB/SUB subscriber
// Listens to ALL progress updates and logs them
// This shows how multiple services can listen to the SAME events

const { createChannel, PROGRESS_EXCHANGE } = require("./rabbitmq");

async function startLogger() {
  const channel = await createChannel();

  // Make sure the exchange exists
  await channel.assertExchange(PROGRESS_EXCHANGE, "fanout", { durable: false });

  // Create a temporary queue just for this logger
  // "exclusive: true" = auto-delete when logger disconnects
  const { queue } = await channel.assertQueue("", { exclusive: true });

  // Bind our queue to the fan-out exchange
  // Now we receive ALL messages published to this exchange
  await channel.bindQueue(queue, PROGRESS_EXCHANGE, "");

  console.log("\n📋 Logger started - watching all job progress...");
  console.log("   (This is a PUB/SUB subscriber - it gets ALL updates)\n");

  channel.consume(queue, (msg) => {
    if (msg) {
      const update = JSON.parse(msg.content.toString());
      const time = new Date().toLocaleTimeString();

      // Pretty log format
      const icon =
        update.status === "done" ? "🟢" :
        update.status === "failed" ? "🔴" :
        update.status === "processing" ? "🟡" : "⚪";

      console.log(
        `[${time}] ${icon} Job ${update.jobId} | ${update.status} | ${update.progress}% | ${update.worker}`
      );

      channel.ack(msg);
    }
  });
}

startLogger();
