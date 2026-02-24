// rabbitmq.js - Shared RabbitMQ connection helper
// All files use this to connect to RabbitMQ

const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";

// Queue names (like mailbox addresses)
const JOB_QUEUE = "image_jobs"; // where new jobs go
const PROGRESS_EXCHANGE = "job_progress"; // pub/sub for progress updates

let connection = null;

async function getConnection() {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    console.log("✅ Connected to RabbitMQ");
  }
  return connection;
}

async function createChannel() {
  const conn = await getConnection();
  return conn.createChannel();
}

module.exports = {
  getConnection,
  createChannel,
  JOB_QUEUE,
  PROGRESS_EXCHANGE,
};
