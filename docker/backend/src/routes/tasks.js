const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET all tasks (with category name via JOIN)
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, c.name AS category_name, c.color AS category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET single task
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create task
router.post("/", async (req, res, next) => {
  try {
    const { title, description, status, due_date, category_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, status, due_date, category_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status || "pending",
        due_date || null,
        category_id || null,
      ]
    );
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update task
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, status, due_date, category_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const [result] = await pool.query(
      `UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, category_id = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        status || "pending",
        due_date || null,
        category_id || null,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE task
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
