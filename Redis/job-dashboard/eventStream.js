/**
 * Redis Streams - Event Logger
 *
 * WHAT ARE REDIS STREAMS?
 * Think of it like a log file, but in Redis. Events are APPENDED (never modified).
 * Each event has:
 *   - A unique ID (auto-generated, based on timestamp)
 *   - Key-value fields (like a hash)
 *
 * WHY STREAMS OVER PUB/SUB?
 *   Pub/Sub:    If no one is listening → message is LOST forever
 *   Streams:    Messages are STORED → you can read old messages anytime
 *
 * REAL WORLD USE CASES:
 *   - Activity feed (Twitter timeline)
 *   - Audit log (who did what, when)
 *   - Event sourcing (rebuild state from events)
 *   - Microservice communication (reliable message passing)
 *
 * CONSUMER GROUPS (the powerful part):
 *   Multiple workers can read from the SAME stream without duplicates.
 *   Redis tracks which messages each worker has processed.
 *   If a worker crashes → another worker picks up its unfinished messages.
 *   Think of it like: 5 cashiers serving 1 line of customers.
 */

const Redis = require("ioredis");

const redis = new Redis();

const STREAM_KEY = "events:jobs";

/**
 * Add an event to the stream
 *
 * XADD adds a new entry to the stream
 * "*" means auto-generate the ID (timestamp-based)
 */
async function addEvent(type, data) {
  const eventId = await redis.xadd(
    STREAM_KEY,
    "*", // auto-generate ID
    "type",
    type,
    "jobId",
    data.jobId || "unknown",
    "jobName",
    data.jobName || "unknown",
    "message",
    data.message || "",
    "timestamp",
    new Date().toISOString()
  );
  return eventId;
}

/**
 * Read the last N events from the stream
 *
 * XREVRANGE reads entries in reverse order (newest first)
 * "+" means latest, "-" means earliest
 */
async function getRecentEvents(count = 20) {
  const entries = await redis.xrevrange(STREAM_KEY, "+", "-", "COUNT", count);

  return entries.map(([id, fields]) => {
    // Fields come as flat array: ["type", "job.added", "jobId", "5", ...]
    // Convert to object
    const obj = { id };
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return obj;
  });
}

/**
 * Get stream stats
 *
 * XLEN returns total number of entries in the stream
 */
async function getStreamLength() {
  return await redis.xlen(STREAM_KEY);
}

/**
 * Create a consumer group
 *
 * Consumer groups let multiple workers process the stream
 * without reading the same message twice.
 *
 * Think of it like: one queue, multiple workers
 */
async function createConsumerGroup(groupName) {
  try {
    // "0" means: start reading from the beginning of the stream
    // "$" would mean: only read NEW messages from now on
    await redis.xgroup("CREATE", STREAM_KEY, groupName, "0", "MKSTREAM");
    console.log(`  Consumer group "${groupName}" created`);
  } catch (err) {
    // Group already exists? That's fine
    if (err.message.includes("BUSYGROUP")) {
      console.log(`  Consumer group "${groupName}" already exists`);
    } else {
      throw err;
    }
  }
}

/**
 * Read messages as a consumer in a group
 *
 * XREADGROUP reads new messages assigned to this consumer.
 * ">" means: give me messages that no one in my group has read yet
 *
 * After processing, you XACK to tell Redis "I'm done with this message"
 */
async function readFromGroup(groupName, consumerName, count = 5) {
  const results = await redis.xreadgroup(
    "GROUP",
    groupName,
    consumerName,
    "COUNT",
    count,
    "STREAMS",
    STREAM_KEY,
    ">" // only new, unread messages
  );

  if (!results) return [];

  // results = [ [streamKey, [ [id, fields], [id, fields], ... ]] ]
  const [, entries] = results[0];

  return entries.map(([id, fields]) => {
    const obj = { id };
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return obj;
  });
}

/**
 * Acknowledge a message (mark as processed)
 *
 * XACK tells Redis: "this consumer finished processing this message"
 * If you don't ACK, Redis will re-deliver the message to another consumer
 */
async function acknowledgeEvent(groupName, eventId) {
  await redis.xack(STREAM_KEY, groupName, eventId);
}

module.exports = {
  addEvent,
  getRecentEvents,
  getStreamLength,
  createConsumerGroup,
  readFromGroup,
  acknowledgeEvent,
  STREAM_KEY,
};
