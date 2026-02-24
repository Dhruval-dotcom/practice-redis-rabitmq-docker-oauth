require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { waitForDB } = require("./db");
const errorHandler = require("./middleware/errorHandler");
const tasksRouter = require("./routes/tasks");
const categoriesRouter = require("./routes/categories");

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/categories", categoriesRouter);

// Error handling
app.use(errorHandler);

// Start server after DB is ready
async function start() {
  try {
    await waitForDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
