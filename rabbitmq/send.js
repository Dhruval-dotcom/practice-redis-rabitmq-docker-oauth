// send.js - The PRODUCER (sends messages to the queue)
const amqp = require("amqplib");

async function send() {
  // Step 1: Connect to RabbitMQ server
  const connection = await amqp.connect("amqp://localhost");
  console.log("✅ Connected to RabbitMQ");

  // Step 2: Create a channel (think of it as a "session")
  const channel = await connection.createChannel();

  // Step 3: Declare a queue named "hello"
  // (creates it if it doesn't exist)
  const queue = "hello";
  await channel.assertQueue(queue, { durable: false });

  // Step 4: Send a message to the queue
  const message = "Hello from RabbitMQ! 🐰";
  channel.sendToQueue(queue, Buffer.from(message));
  console.log(`📤 Sent: "${message}"`);

  // Step 5: Close connection after a short delay
  setTimeout(() => {
    connection.close();
    console.log("Connection closed.");
    process.exit(0);
  }, 500);
}

send();
