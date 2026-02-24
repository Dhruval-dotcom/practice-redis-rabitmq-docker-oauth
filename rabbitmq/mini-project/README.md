# Mini Project: Image Processing Job Manager (RabbitMQ)

```
POST /jobs  →  API queues the job  →  responds instantly "Job queued!"
                     |
              [RabbitMQ Queue]
                     |
              [Worker 1] [Worker 2]  ← scale workers as needed
              Resize, blur, grayscale... (10-15 sec each)
                     |
              [Pub/Sub Fanout Exchange]
                     |
         [Progress Logger]  [Status Updater]
         "Job 50% done..."   "Job complete!"
```

## What You'll Learn

- Work queues (long-running image jobs)
- Multiple workers sharing load
- Pub/Sub fan-out (broadcast progress to multiple listeners)
- Express API + RabbitMQ integration
- Job status tracking (pending → processing → done)

---

## How to Run (3 Terminals)

Once RabbitMQ is installed and running, `cd mini-project` and open 3 terminals:

**Terminal 1** - Start the API server:
```bash
npm run server
```

**Terminal 2** - Start a worker:
```bash
npm run worker
```

**Terminal 3** - Start the logger (pub/sub subscriber):
```bash
npm run logger
```

### Submit a job (from any terminal):

```bash
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -d '{"image":"photo.jpg","tasks":["resize","grayscale","blur"]}'
```

This job takes ~13 seconds (4+4+5). Watch all 3 terminals update in real time!

### Check job status:

```bash
curl http://localhost:3001/jobs
```

### Try running 2 workers to see load balancing:

```bash
# Terminal 4 - second worker
npm run worker
```

Submit 2 jobs quickly — each worker grabs one!

---

## Project Structure

```
mini-project/
├── server.js      ← Express API (Producer) - receives jobs, queues them
├── worker.js      ← Consumer - picks up jobs, processes images (10-15 sec)
├── logger.js      ← Pub/Sub subscriber - logs ALL progress updates
├── rabbitmq.js    ← Shared connection helper
├── jobStore.js    ← In-memory job tracker
├── uploads/       ← Put real images here (optional)
└── output/        ← Processed images appear here
```

---

## RabbitMQ Concepts Covered

| Concept | Where | What it does |
|---------|-------|-------------|
| **Work Queue** | `server.js` → `worker.js` | Jobs wait in line, workers pick them up |
| **Long-running jobs** | `worker.js` | Each task takes 3-5 seconds (total ~13 sec) |
| **Fair dispatch** | `prefetch(1)` in worker | Each worker takes only 1 job at a time |
| **Pub/Sub fanout** | `PROGRESS_EXCHANGE` | Progress broadcasts to server AND logger |
| **Message persistence** | `persistent: true` | Jobs survive RabbitMQ restarts |
| **Acknowledgements** | `channel.ack(msg)` | Worker confirms job is done before removing from queue |
