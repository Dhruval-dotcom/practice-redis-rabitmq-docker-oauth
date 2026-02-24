const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET all categories
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET single category
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create category
router.post("/", async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const [result] = await pool.query(
      "INSERT INTO categories (name, color) VALUES (?, ?)",
      [name, color || "#6366f1"]
    );
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update category
router.put("/:id", async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const [result] = await pool.query(
      "UPDATE categories SET name = ?, color = ? WHERE id = ?",
      [name, color || "#6366f1", req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE category
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
