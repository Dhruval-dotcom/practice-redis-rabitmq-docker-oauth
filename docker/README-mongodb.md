# Switching to MongoDB — What Changes and Why

This guide explains every change needed to swap MySQL for MongoDB in the Task Manager project, keeping the same React frontend and Express backend.

MongoDB is a **document database** — this is a fundamentally different paradigm from relational databases. The changes are more significant than switching between MySQL and PostgreSQL.

---

## Table of Contents

- [Relational vs Document: The Mental Shift](#relational-vs-document-the-mental-shift)
- [Overview of Changes](#overview-of-changes)
- [What Stays the Same](#what-stays-the-same)
- [What Changes](#what-changes)
  - [1. Database Init Script](#1-database-init-script)
  - [2. Backend — Database Driver](#2-backend--database-driver)
  - [3. Backend — Connection Code](#3-backend--connection-code)
  - [4. Backend — Route Queries](#4-backend--route-queries)
  - [5. Docker Compose — DB Service](#5-docker-compose--db-service)
  - [6. Environment Variables](#6-environment-variables)
- [Data Modeling: Two Approaches](#data-modeling-two-approaches)
- [Side-by-Side Comparison](#side-by-side-comparison)
- [Full Changed Files](#full-changed-files)
- [Running the MongoDB Version](#running-the-mongodb-version)
- [Useful MongoDB Docker Commands](#useful-mongodb-docker-commands)
- [Key Differences: SQL vs MongoDB in Docker](#key-differences-sql-vs-mongodb-in-docker)

---

## Relational vs Document: The Mental Shift

Before looking at code, understand the paradigm difference:

### MySQL (Relational)

```
categories table              tasks table
┌────┬──────────┬─────────┐   ┌────┬────────────┬─────────┬─────────────┐
│ id │ name     │ color   │   │ id │ title      │ status  │ category_id │ ← FK
├────┼──────────┼─────────┤   ├────┼────────────┼─────────┼─────────────┤
│ 1  │ Work     │ #3b82f6 │   │ 1  │ Learn SQL  │ pending │ 1           │
│ 2  │ Personal │ #10b981 │   │ 2  │ Buy milk   │ done    │ 2           │
└────┴──────────┴─────────┘   └────┴────────────┴─────────┴─────────────┘
                                              JOIN to get category name ↗
```

- Data split into normalized tables
- Foreign keys link tables
- JOIN queries combine data at read time
- Schema enforced by the database

### MongoDB (Document)

```
categories collection          tasks collection
┌──────────────────────────┐   ┌──────────────────────────────────────────┐
│ {                        │   │ {                                        │
│   _id: ObjectId("..."),  │   │   _id: ObjectId("..."),                  │
│   name: "Work",          │   │   title: "Learn MongoDB",                │
│   color: "#3b82f6",      │   │   status: "pending",                     │
│   createdAt: Date        │   │   category_id: ObjectId("..."),          │
│ }                        │   │   createdAt: Date,                       │
│                          │   │   updatedAt: Date                        │
└──────────────────────────┘   │ }                                        │
                               └──────────────────────────────────────────┘
                                     $lookup (aggregation) to join ↗
```

- Data stored as JSON-like documents (BSON)
- No enforced schema by default (flexible fields)
- References between collections use ObjectId strings
- `$lookup` in aggregation pipeline replaces JOIN
- IDs are auto-generated `ObjectId` strings (not auto-increment integers)

**Key implications for our app:**
- No `AUTO_INCREMENT` — MongoDB generates `_id` automatically as an ObjectId
- No `ENUM` constraint — status is just a string (validation moves to app code)
- No `FOREIGN KEY` — referential integrity is the application's responsibility
- No `ON DELETE SET NULL` — cascading deletes must be handled in app code
- No `ON UPDATE CURRENT_TIMESTAMP` — handled by Mongoose timestamps option

---

## Overview of Changes

| Area | MySQL (current) | MongoDB (new) |
|------|----------------|---------------|
| Docker image | `mysql:8` | `mongo:7` |
| NPM driver | `mysql2` | `mongoose` |
| Default port | 3306 | 27017 |
| Connection | SQL connection pool | Mongoose connection |
| Healthcheck | `mysqladmin ping` | `mongosh --eval "db.runCommand('ping')"` |
| Init script location | `/docker-entrypoint-initdb.d/*.sql` | `/docker-entrypoint-initdb.d/*.js` |
| Data volume mount | `/var/lib/mysql` | `/data/db` |
| Query language | SQL | MongoDB query operators / Mongoose methods |
| ID field | `id` (integer) | `_id` (ObjectId string) |
| Env var naming | `MYSQL_*` | `MONGO_INITDB_*` |

**Total files changed: 7** (out of 28). Frontend needs a tiny tweak for `_id` vs `id`.

---

## What Stays the Same

```
frontend/
├── Dockerfile               # Same
├── Dockerfile.prod           # Same
├── .dockerignore             # Same
├── nginx.conf                # Same
├── package.json              # Same
├── vite.config.js            # Same
├── index.html                # Same
├── src/
│   ├── main.jsx              # Same
│   ├── App.jsx               # Same
│   ├── App.css               # Same
│   └── api.js                # Same

backend/
├── Dockerfile                # Same
├── Dockerfile.prod           # Same
├── .dockerignore             # Same
├── src/
│   ├── index.js              # Mostly same (just import changes)
│   └── middleware/
│       └── errorHandler.js   # Same

docker-compose.prod.yml       # Same override structure
```

---

## What Changes

### 1. Database Init Script

**File**: `db/init.js` (was `init.sql` — MongoDB uses JavaScript, not SQL)

MySQL uses `.sql` files. MongoDB uses `.js` or `.sh` files for initialization.

```js
// db/init.js
// This runs inside the MongoDB container on first volume creation

db = db.getSiblingDB("taskmanager");

// Create collections with validation (optional but recommended)
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        name: { bsonType: "string", description: "Category name" },
        color: { bsonType: "string", description: "Hex color code" },
        createdAt: { bsonType: "date" },
      },
    },
  },
});

db.createCollection("tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title"],
      properties: {
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        status: { enum: ["pending", "in-progress", "done"] },
        due_date: { bsonType: ["date", "null"] },
        category_id: { bsonType: ["objectId", "null"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
});

// Seed default categories
db.categories.insertMany([
  { name: "Work", color: "#3b82f6", createdAt: new Date() },
  { name: "Personal", color: "#10b981", createdAt: new Date() },
  { name: "Urgent", color: "#ef4444", createdAt: new Date() },
]);

print("Database initialized with seed data");
```

**Key differences from SQL init:**
- File is JavaScript, not SQL
- `db.getSiblingDB("taskmanager")` selects the database (created if it doesn't exist)
- Schema validation is optional — defined using `$jsonSchema`
- `insertMany()` instead of `INSERT INTO`
- `new Date()` instead of `CURRENT_TIMESTAMP`
- No table creation needed — collections are created on first insert if they don't exist
- The validator is optional — without it, MongoDB accepts any document shape

---

### 2. Backend — Database Driver

**File**: `backend/package.json`

```diff
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
-   "mysql2": "^3.12.0"
+   "mongoose": "^8.9.5"
  }
```

**Why Mongoose instead of the raw `mongodb` driver?**

| | Raw `mongodb` driver | Mongoose |
|--|---------------------|----------|
| Schema | None — pure flexibility | Defined schemas with validation |
| API | Lower-level, callback/promise | Higher-level, model-based |
| Timestamps | Manual | Built-in `timestamps: true` |
| Validation | Manual | Built-in schema validation |
| Population (JOINs) | Manual `$lookup` aggregation | Simple `.populate()` |

Mongoose adds a schema layer that gives us closer to what we had with MySQL's table structure. For a CRUD app, it reduces boilerplate significantly.

After changing `package.json`:

```bash
cd backend && rm -rf node_modules package-lock.json && npm install
```

---

### 3. Backend — Connection Code

**File**: `backend/src/db.js`

**MySQL version (current):**
```js
const mysql = require("mysql2/promise");
const pool = mysql.createPool({ host, port, user, password, database });
```

**MongoDB version:**
```js
const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI ||
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("Database connected successfully");
      return;
    } catch (err) {
      console.log(
        `DB connection attempt ${i + 1}/${retries} failed: ${err.message}`
      );
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error("Could not connect to database after multiple retries");
}

module.exports = { waitForDB };
```

**Key differences:**
- No connection pool to manage — Mongoose handles pooling internally
- Connection string format: `mongodb://user:password@host:port/database?authSource=admin`
- `authSource=admin` is required because the user is created in the `admin` database
- No `pool` export — routes use Mongoose models directly

**New file — Mongoose models:**

With MongoDB, we define schemas in the application. This is a new concept that MySQL didn't need (the schema was in `init.sql`).

**File**: `backend/src/models/Category.js`
```js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }     // Auto-adds createdAt and updatedAt
);

module.exports = mongoose.model("Category", categorySchema);
```

**File**: `backend/src/models/Task.js`
```js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done"],
      default: "pending",
    },
    due_date: { type: Date, default: null },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",       // References the Category model
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
```

**Key points about Mongoose schemas:**
- `timestamps: true` auto-manages `createdAt` and `updatedAt`
- `ref: "Category"` enables `.populate()` — Mongoose's version of JOIN
- `enum` in the schema replaces MySQL's ENUM column type
- `required: true` replaces `NOT NULL`
- `default` values work the same conceptually
- The `_id` field is auto-generated — no need to define it

---

### 4. Backend — Route Queries

This is the biggest change. SQL queries become Mongoose method calls.

**Comparison of every operation:**

| Operation | MySQL (SQL) | MongoDB (Mongoose) |
|-----------|-------------|-------------------|
| Get all | `SELECT * FROM categories ORDER BY created_at DESC` | `Category.find().sort({ createdAt: -1 })` |
| Get by ID | `SELECT * FROM categories WHERE id = ?` | `Category.findById(id)` |
| Insert | `INSERT INTO categories (name, color) VALUES (?, ?)` | `Category.create({ name, color })` |
| Update | `UPDATE categories SET name = ?, color = ? WHERE id = ?` | `Category.findByIdAndUpdate(id, { name, color }, { new: true })` |
| Delete | `DELETE FROM categories WHERE id = ?` | `Category.findByIdAndDelete(id)` |
| JOIN | `SELECT t.*, c.name ... LEFT JOIN categories c ON ...` | `Task.find().populate("category_id")` |

**The `populate()` method is Mongoose's JOIN:**

MySQL:
```sql
SELECT t.*, c.name AS category_name, c.color AS category_color
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
```

Mongoose:
```js
const tasks = await Task.find()
  .populate("category_id", "name color")  // field to populate, fields to select
  .sort({ createdAt: -1 });
```

`populate()` makes a second query to fetch the referenced documents — it's not a true database-level JOIN. For small datasets this is fine. For large datasets, use `$lookup` in an aggregation pipeline.

**Handling the `_id` vs `id` difference:**

MongoDB uses `_id` (with underscore). To keep the frontend simple, we can configure Mongoose to also expose `id`:

```js
// This is enabled by default in Mongoose — schema.options.toJSON has virtuals: true
// So doc._id and doc.id both work
```

Mongoose's `toJSON` transform already includes an `id` virtual by default, so the frontend can use either `_id` or `id`.

**`findByIdAndUpdate` with `{ new: true }`:**

In MySQL, UPDATE doesn't return the row — you need a separate SELECT. In Mongoose, `findByIdAndUpdate(id, update, { new: true })` returns the updated document directly. `{ new: true }` means "return the document after the update" (default returns the document before the update).

**Cascade behavior on delete:**

MySQL has `ON DELETE SET NULL` on the foreign key. MongoDB has no such feature. We handle it in application code:

```js
// When deleting a category, also clear references in tasks
router.delete("/:id", async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    // Manually do what ON DELETE SET NULL does in MySQL
    await Task.updateMany(
      { category_id: req.params.id },
      { $set: { category_id: null } }
    );
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
});
```

---

### 5. Docker Compose — DB Service

**File**: `docker-compose.yml`

```diff
  db:
-   image: mysql:8
+   image: mongo:7
    container_name: taskmanager-db
    restart: unless-stopped
    environment:
-     MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
-     MYSQL_DATABASE: ${MYSQL_DATABASE}
-     MYSQL_USER: ${MYSQL_USER}
-     MYSQL_PASSWORD: ${MYSQL_PASSWORD}
+     MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
+     MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
+     MONGO_INITDB_DATABASE: ${MONGO_DB}
    ports:
-     - "3306:3306"
+     - "27017:27017"
    volumes:
-     - mysql-data:/var/lib/mysql
-     - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
+     - mongo-data:/data/db
+     - ./db/init.js:/docker-entrypoint-initdb.d/init.js
    networks:
      - backend-net
    healthcheck:
-     test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
+     test: ["CMD", "mongosh", "--eval", "db.runCommand('ping').ok", "--quiet"]
      interval: 10s
      timeout: 5s
      retries: 5
-     start_period: 30s
+     start_period: 10s

 volumes:
-  mysql-data:
+  mongo-data:
```

**Key differences:**

| Aspect | MySQL | MongoDB |
|--------|-------|---------|
| Image | `mysql:8` (~600 MB) | `mongo:7` (~700 MB) |
| Data directory | `/var/lib/mysql` | `/data/db` |
| Init scripts | `.sql` files | `.js` or `.sh` files |
| Healthcheck | `mysqladmin ping` | `mongosh --eval "db.runCommand('ping')"` |
| Auth env vars | `MYSQL_ROOT_PASSWORD`, `MYSQL_USER`, etc. | `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` |
| Default port | 3306 | 27017 |
| User model | Root user + app users | Init creates root user, app connects as root |

**MongoDB auth note**: `MONGO_INITDB_ROOT_USERNAME` creates a user in the `admin` database. When connecting from the app, you must specify `?authSource=admin` in the connection string.

---

### 6. Environment Variables

**File**: `.env`

```diff
  # Database
- MYSQL_ROOT_PASSWORD=rootpassword
- MYSQL_DATABASE=taskmanager
- MYSQL_USER=appuser
- MYSQL_PASSWORD=apppassword
+ MONGO_USER=appuser
+ MONGO_PASSWORD=apppassword
+ MONGO_DB=taskmanager

  # Backend
  DB_HOST=db
- DB_PORT=3306
+ DB_PORT=27017
  DB_USER=appuser
  DB_PASSWORD=apppassword
  DB_NAME=taskmanager
  NODE_ENV=development
  BACKEND_PORT=5000

  # Frontend
  VITE_API_URL=http://localhost:5000
```

---

## Data Modeling: Two Approaches

With MongoDB, we have a choice that doesn't exist in MySQL:

### Approach A: Referenced (what we're using)

Categories and tasks are separate collections. Tasks reference categories by ObjectId.

```json
// categories collection
{ "_id": "abc123", "name": "Work", "color": "#3b82f6" }

// tasks collection
{ "_id": "def456", "title": "Learn Docker", "category_id": "abc123" }
```

**Pros**: Categories managed independently. No data duplication. Close to the relational model.

**Cons**: Need `.populate()` or `$lookup` to get category info with tasks.

### Approach B: Embedded (alternative)

Category data embedded directly inside each task document.

```json
// tasks collection — no separate categories collection needed
{
  "_id": "def456",
  "title": "Learn Docker",
  "category": { "name": "Work", "color": "#3b82f6" }
}
```

**Pros**: Single read to get all task data. No JOINs. Faster reads.

**Cons**: Updating a category name requires updating every task that has it. Data duplication. Can't list categories independently without aggregation.

**We use Approach A** because our app has a dedicated Categories page with CRUD — embedded documents would make that awkward.

**Rule of thumb:**
- **Embed** when data is always read together and the child data rarely changes
- **Reference** when data is managed independently or shared across many documents

---

## Side-by-Side Comparison

```
┌─────────────────────────┬───────────────────────────────────┬──────────────────────────────────┐
│                         │ MySQL                             │ MongoDB                          │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────────────┤
│ Data model              │ Tables with rows                  │ Collections with documents       │
│ Schema                  │ Enforced by database              │ Optional (app-level / validator) │
│ ID type                 │ Auto-increment integer            │ ObjectId string                  │
│ ID field                │ id                                │ _id (+ virtual id)               │
│ Relationships           │ Foreign keys                      │ References (ObjectId)            │
│ JOIN                    │ SQL JOIN                          │ .populate() or $lookup           │
│ Cascade delete          │ ON DELETE SET NULL                │ Manual in app code               │
│ Docker image            │ mysql:8 (~600 MB)                 │ mongo:7 (~700 MB)                │
│ Data volume             │ /var/lib/mysql                    │ /data/db                         │
│ Init scripts            │ .sql files                        │ .js or .sh files                 │
│ Healthcheck             │ mysqladmin ping                   │ mongosh --eval "ping"            │
│ NPM package             │ mysql2                            │ mongoose                         │
│ Query style             │ SQL strings                       │ Method chaining                  │
│ Placeholders            │ ? in SQL                          │ N/A — pass objects               │
│ Default port            │ 3306                              │ 27017                            │
│ Shell command           │ mysql -u user -p                  │ mongosh                          │
│ Timestamps              │ Column defaults                   │ Mongoose timestamps: true        │
│ Validation              │ Column types, constraints         │ Mongoose schema, JSON Schema     │
│ Transactions            │ ACID (InnoDB)                     │ ACID (replica set required)      │
└─────────────────────────┴───────────────────────────────────┴──────────────────────────────────┘
```

---

## Full Changed Files

### `db/init.js` (was `init.sql`)

```js
db = db.getSiblingDB("taskmanager");

db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        name: { bsonType: "string" },
        color: { bsonType: "string" },
      },
    },
  },
});

db.createCollection("tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title"],
      properties: {
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        status: { enum: ["pending", "in-progress", "done"] },
      },
    },
  },
});

db.categories.insertMany([
  { name: "Work", color: "#3b82f6", createdAt: new Date() },
  { name: "Personal", color: "#10b981", createdAt: new Date() },
  { name: "Urgent", color: "#ef4444", createdAt: new Date() },
]);

print("Database initialized with seed data");
```

### `backend/package.json`

```json
{
  "name": "task-manager-backend",
  "version": "1.0.0",
  "description": "Express API for Task Manager",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "mongoose": "^8.9.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

### `backend/src/db.js`

```js
const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI ||
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("Database connected successfully");
      return;
    } catch (err) {
      console.log(
        `DB connection attempt ${i + 1}/${retries} failed: ${err.message}`
      );
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error("Could not connect to database after multiple retries");
}

module.exports = { waitForDB };
```

### `backend/src/models/Category.js` (new file)

```js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
```

### `backend/src/models/Task.js` (new file)

```js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done"],
      default: "pending",
    },
    due_date: { type: Date, default: null },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
```

### `backend/src/routes/categories.js`

```js
const express = require("express");
const Category = require("../models/Category");
const Task = require("../models/Task");

const router = express.Router();

// GET all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET single category
router.get("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
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
    const category = await Category.create({
      name,
      color: color || "#6366f1",
    });
    res.status(201).json(category);
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
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, color: color || "#6366f1" },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE category (+ manually nullify references in tasks)
router.delete("/:id", async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    // Replicate ON DELETE SET NULL behavior
    await Task.updateMany(
      { category_id: req.params.id },
      { $set: { category_id: null } }
    );
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### `backend/src/routes/tasks.js`

```js
const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// GET all tasks (with category populated)
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate("category_id", "name color")
      .sort({ createdAt: -1 });

    // Transform to match the same JSON shape the frontend expects
    const result = tasks.map((task) => {
      const obj = task.toObject();
      return {
        ...obj,
        id: obj._id,
        category_name: obj.category_id?.name || null,
        category_color: obj.category_id?.color || null,
        category_id: obj.category_id?._id || null,
      };
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET single task
router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("category_id", "name color");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const obj = task.toObject();
    res.json({
      ...obj,
      id: obj._id,
      category_name: obj.category_id?.name || null,
      category_color: obj.category_id?.color || null,
      category_id: obj.category_id?._id || null,
    });
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
    const task = await Task.create({
      title,
      description: description || null,
      status: status || "pending",
      due_date: due_date || null,
      category_id: category_id || null,
    });
    // Populate category info before returning
    await task.populate("category_id", "name color");
    const obj = task.toObject();
    res.status(201).json({
      ...obj,
      id: obj._id,
      category_name: obj.category_id?.name || null,
      category_color: obj.category_id?.color || null,
      category_id: obj.category_id?._id || null,
    });
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
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description: description || null,
        status: status || "pending",
        due_date: due_date || null,
        category_id: category_id || null,
      },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.populate("category_id", "name color");
    const obj = task.toObject();
    res.json({
      ...obj,
      id: obj._id,
      category_name: obj.category_id?.name || null,
      category_color: obj.category_id?.color || null,
      category_id: obj.category_id?._id || null,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE task
router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### `backend/src/index.js`

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { waitForDB } = require("./db");
const errorHandler = require("./middleware/errorHandler");
const tasksRouter = require("./routes/tasks");
const categoriesRouter = require("./routes/categories");

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/categories", categoriesRouter);

app.use(errorHandler);

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
```

This file is essentially unchanged — the `waitForDB` interface is the same.

### `docker-compose.yml`

```yaml
services:
  db:
    image: mongo:7
    container_name: taskmanager-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DB}
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      - ./db/init.js:/docker-entrypoint-initdb.d/init.js
    networks:
      - backend-net
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.runCommand('ping').ok", "--quiet"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: taskmanager-backend
    restart: unless-stopped
    environment:
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_USER: ${MONGO_USER}
      DB_PASSWORD: ${MONGO_PASSWORD}
      DB_NAME: ${MONGO_DB}
      NODE_ENV: ${NODE_ENV}
      BACKEND_PORT: ${BACKEND_PORT}
    ports:
      - "5000:5000"
    volumes:
      - ./backend/src:/app/src
    networks:
      - frontend-net
      - backend-net
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: taskmanager-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    networks:
      - frontend-net
    depends_on:
      - backend

volumes:
  mongo-data:

networks:
  frontend-net:
  backend-net:
```

### `.env`

```bash
# Database
MONGO_USER=appuser
MONGO_PASSWORD=apppassword
MONGO_DB=taskmanager

# Backend
DB_HOST=db
DB_PORT=27017
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=taskmanager
NODE_ENV=development
BACKEND_PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000
```

---

## Running the MongoDB Version

```bash
# Remove old MySQL containers and volumes
docker compose down -v

# Start with MongoDB
docker compose up -d --build

# Visit http://localhost:3000

# Check MongoDB logs
docker compose logs -f db
```

---

## Useful MongoDB Docker Commands

```bash
# Shell into MongoDB
docker exec -it taskmanager-db mongosh -u appuser -p apppassword --authenticationDatabase admin taskmanager

# Run a quick query
docker exec taskmanager-db mongosh -u appuser -p apppassword --authenticationDatabase admin taskmanager --eval "db.categories.find().pretty()"

# List all collections
docker exec taskmanager-db mongosh -u appuser -p apppassword --authenticationDatabase admin taskmanager --eval "db.getCollectionNames()"

# Count documents
docker exec taskmanager-db mongosh -u appuser -p apppassword --authenticationDatabase admin taskmanager --eval "db.tasks.countDocuments()"

# Dump the database
docker exec taskmanager-db mongodump -u appuser -p apppassword --authenticationDatabase admin --db taskmanager --archive > backup.archive

# Restore from dump
docker exec -i taskmanager-db mongorestore -u appuser -p apppassword --authenticationDatabase admin --archive < backup.archive

# Check database stats
docker exec taskmanager-db mongosh -u appuser -p apppassword --authenticationDatabase admin taskmanager --eval "db.stats()"
```

---

## Key Differences: SQL vs MongoDB in Docker

### When to choose which

| Choose MongoDB when... | Choose MySQL/PostgreSQL when... |
|----------------------|-------------------------------|
| Schema changes frequently | Schema is well-defined and stable |
| Data is naturally hierarchical (nested objects) | Data has many relationships (JOINs) |
| Rapid prototyping | Strong data integrity needed |
| Horizontal scaling needed | Complex transactions needed |
| Storing JSON-like documents | Reporting and analytics |
| Each document may have different fields | Every row must have the same columns |

### Docker-specific considerations

| | MySQL | MongoDB |
|--|-------|---------|
| Image size | ~600 MB | ~700 MB |
| Memory usage | Lower baseline | Higher baseline (~400MB default) |
| Startup time | ~30 sec | ~5-10 sec |
| Init scripts | `.sql` files | `.js` or `.sh` files |
| Data volume | `/var/lib/mysql` | `/data/db` |
| Replication in Docker | MySQL replication (complex) | Replica set (needed for transactions) |
| GUI tools | MySQL Workbench, phpMyAdmin | MongoDB Compass, Mongo Express |

### Adding a GUI in Docker (optional)

MySQL — add phpMyAdmin:
```yaml
  phpmyadmin:
    image: phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: db
```

MongoDB — add Mongo Express:
```yaml
  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: appuser
      ME_CONFIG_MONGODB_ADMINPASSWORD: apppassword
      ME_CONFIG_MONGODB_URL: mongodb://appuser:apppassword@db:27017/
```

Both are single-service additions to `docker-compose.yml`.
