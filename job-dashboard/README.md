# Real-time Job Dashboard

BullMQ (Job Queue) + Redis Streams (Event Log) + Socket.io (Real-time Updates)

## How It Works

```
Browser                    Server                     Redis
──────                    ──────                     ─────
Click "Submit Job" ──→  Add to BullMQ Queue  ──→  Redis List (job queue)
                                                      │
                        Worker picks up job  ←────────┘
                            │
                            ├──→ Log to Redis Stream  ──→  Redis Stream (permanent log)
                            │
                            └──→ Emit via Socket.io   ──→  Browser updates instantly!
```

## What Each Technology Does

| Technology | Role | Redis Feature Used |
|------------|------|--------------------|
| **BullMQ** | Job queue - submit, process, retry | Lists, Hashes, Sorted Sets, Pub/Sub |
| **Redis Streams** | Permanent event log (unlike Pub/Sub) | Streams (XADD, XREAD, Consumer Groups) |
| **Socket.io** | Push live updates to browser | WebSocket connection |

## Run It

```bash
cd job-dashboard
node server.js
```

Open **http://localhost:3000** in your browser.

## What to Try

1. Click **"Submit Image Resize"** - watch the progress bar fill up
2. Click **"Submit 5 Jobs at Once"** - watch them queue and process 2 at a time
3. Watch the **Redis Stream panel** - every event is logged permanently
4. Open a **second browser tab** - both tabs update in real-time!

## Project Structure

```
job-dashboard/
├── server.js          ← Express + Socket.io + BullMQ queue
├── worker.js          ← BullMQ worker (processes jobs in background)
├── eventStream.js     ← Redis Streams helper (add/read events)
└── public/
    └── index.html     ← Dashboard UI (connects via Socket.io)
```

## Redis Patterns Learned

- **BullMQ Queue**: Production-grade job queue (retries, priority, concurrency)
- **Redis Streams**: Append-only event log with consumer groups
- **Socket.io + Redis**: Real-time browser updates
- **Consumer Groups**: Multiple workers reading from same stream without duplicates
