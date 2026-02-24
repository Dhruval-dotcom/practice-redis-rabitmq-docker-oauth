/**
 * 11 - Pub/Sub (Publish / Subscribe) Pattern
 *
 * Run: node 11-pub-sub.js
 *
 * THE PROBLEM:
 * You have a chat app. User A sends a message.
 * How do User B, C, D get that message instantly?
 *
 * THE SOLUTION:
 * Redis Pub/Sub - like a radio station.
 * - Publisher: broadcasts messages to a channel
 * - Subscriber: listens to that channel and receives messages
 *
 * HOW IT WORKS:
 * 1. Subscriber says "I want to listen to channel 'news'"
 * 2. Publisher sends a message to channel 'news'
 * 3. ALL subscribers on 'news' get the message instantly
 *
 * REAL WORLD:
 * - Chat rooms (each room = a channel)
 * - Live notifications
 * - Real-time dashboards
 * - Microservice communication
 */

const { createClient } = require("redis");

async function main() {
  // IMPORTANT: Pub/Sub needs SEPARATE connections!
  // A subscribed client can ONLY listen, it can't do other commands.
  const publisher = createClient();
  const subscriber = createClient();

  await publisher.connect();
  await subscriber.connect();
  console.log("Connected: 1 publisher + 1 subscriber\n");

  // -------- SUBSCRIBER: Listen to channels --------

  // Subscribe to "notifications" channel
  await subscriber.subscribe("notifications", (message, channel) => {
    console.log(`  [SUBSCRIBER] Got message on #${channel}: ${message}`);
  });

  // Subscribe to "alerts" channel
  await subscriber.subscribe("alerts", (message, channel) => {
    console.log(`  [SUBSCRIBER] 🚨 ALERT on #${channel}: ${message}`);
  });

  console.log('Subscriber is listening on channels: "notifications", "alerts"\n');

  // -------- PUBLISHER: Send messages --------

  // Simulate sending messages with delays
  console.log("Publisher sending messages...\n");

  // Message 1
  await publisher.publish("notifications", "Welcome to the app!");
  await sleep(1000);

  // Message 2
  await publisher.publish("notifications", "New feature released: Dark mode!");
  await sleep(1000);

  // Message 3 - different channel
  await publisher.publish("alerts", "Server CPU usage above 90%!");
  await sleep(1000);

  // Message 4
  await publisher.publish("notifications", "Your order has been shipped!");
  await sleep(1000);

  // Message 5
  await publisher.publish("alerts", "Database connection restored.");
  await sleep(1000);

  console.log("\n--- Demo complete ---");
  console.log("In a real app, publisher and subscriber would be DIFFERENT servers.");
  console.log("For example:");
  console.log("  - Web server publishes 'new order' to channel 'orders'");
  console.log("  - Email server subscribes to 'orders' → sends confirmation email");
  console.log("  - Inventory server subscribes to 'orders' → updates stock\n");

  // Cleanup
  await subscriber.unsubscribe();
  await publisher.disconnect();
  await subscriber.disconnect();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
