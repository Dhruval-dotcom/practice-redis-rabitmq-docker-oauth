// receive.js - The CONSUMER (receives messages from the queue)
const amqp = require("amqplib");

async function receive() {
  // Step 1: Connect to RabbitMQ server
  const connection = await amqp.connect("amqp://localhost");
  console.log("✅ Connected to RabbitMQ");

  // Step 2: Create a channel
  const channel = await connection.createChannel();

  // Step 3: Declare the same queue (must match the sender's queue name)
  const queue = "hello";
  await channel.assertQueue(queue, { durable: false });

  console.log(`👂 Waiting for messages in "${queue}" queue...`);
  console.log("   (Press Ctrl+C to stop)\n");

  // Step 4: Start consuming messages
  // This runs forever, waiting for new messages
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log(`📥 Received: "${msg.content.toString()}"`);

      // Acknowledge the message (tell RabbitMQ we processed it)
      channel.ack(msg);
    }
  });
}

receive();
