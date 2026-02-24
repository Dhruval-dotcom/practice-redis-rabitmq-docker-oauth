# Switching to PostgreSQL — What Changes and Why

This guide explains every change needed to swap MySQL for PostgreSQL in the Task Manager project, keeping the same React frontend and Express backend.

---

## Table of Contents

- [Overview of Changes](#overview-of-changes)
- [What Stays the Same](#what-stays-the-same)
- [What Changes](#what-changes)
  - [1. Database Init Script](#1-database-init-script)
  - [2. Backend — Database Driver](#2-backend--database-driver)
  - [3. Backend — Connection Code](#3-backend--connection-code)
  - [4. Backend — Route Queries](#4-backend--route-queries)
  - [5. Docker Compose — DB Service](#5-docker-compose--db-service)
  - [6. Environment Variables](#6-environment-variables)
- [Side-by-Side Comparison](#side-by-side-comparison)
- [Full Changed Files](#full-changed-files)
- [Running the PostgreSQL Version](#running-the-postgresql-version)
- [Useful PostgreSQL Docker Commands](#useful-postgresql-docker-commands)
- [Key Differences: MySQL vs PostgreSQL in Docker](#key-differences-mysql-vs-postgresql-in-docker)

---

## Overview of Changes

| Area | MySQL (current) | PostgreSQL (new) |
|------|----------------|-----------------|
| Docker image | `mysql:8` | `postgres:16-alpine` |
| NPM driver | `mysql2` | `pg` |
| Default port | 3306 | 5432 |
| Connection | Connection pool via `mysql2/promise` | Connection pool via `pg.Pool` |
| Healthcheck | `mysqladmin ping` | `pg_isready` |
| Init script location | `/docker-entrypoint-initdb.d/` | `/docker-entrypoint-initdb.d/` (same!) |
| Data volume mount | `/var/lib/mysql` | `/var/lib/postgresql/data` |
| SQL syntax | Minor differences (see below) | Minor differences (see below) |
| Env var naming | `MYSQL_*` | `POSTGRES_*` |

**Total files changed: 6** (out of 28). Frontend is completely untouched.

---

## What Stays the Same

These files need **zero changes**:

```
frontend/                    # Entire frontend — unchanged
├── everything...

backend/
├── Dockerfile               # Same Node image, same commands
├── Dockerfile.prod          # Same production build
├── .dockerignore            # Same exclusions
├── src/
│   ├── index.js             # Same Express wiring (just imports db.js)
│   └── middleware/
│       └── errorHandler.js  # Same error handling

docker-compose.prod.yml      # Same override structure
```

The frontend doesn't care what database is behind the API — it only talks to `/api` endpoints that return JSON. The Express routes return the same JSON shape regardless of database.

---

## What Changes

### 1. Database Init Script

**File**: `db/init.sql`

MySQL and PostgreSQL have slightly different SQL dialects:

| Feature | MySQL | PostgreSQL |
|---------|-------|-----------|
| Auto-increment | `INT AUTO_INCREMENT` | `SERIAL` (or `INT GENERATED ALWAYS AS IDENTITY`) |
| Enum type | `ENUM('a', 'b', 'c')` | Create a custom `TYPE` or use `VARCHAR` with `CHECK` |
| Timestamp default | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMPTZ DEFAULT NOW()` |
| Auto-update timestamp | `ON UPDATE CURRENT_TIMESTAMP` | Needs a trigger function |
| String quoting | Single quotes for values | Same, but identifiers use double quotes (not backticks) |

**PostgreSQL version:**

```sql
-- PostgreSQL uses custom types instead of ENUM
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'done');

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  due_date DATE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PostgreSQL needs a trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed data
INSERT INTO categories (name, color) VALUES
  ('Work', '#3b82f6'),
  ('Personal', '#10b981'),
  ('Urgent', '#ef4444');
```

**Key takeaways:**
- `SERIAL` replaces `INT AUTO_INCREMENT` — it creates a sequence automatically
- `ENUM` must be a named type created separately
- `ON UPDATE CURRENT_TIMESTAMP` doesn't exist — you need a trigger function
- `TIMESTAMPTZ` is preferred over `TIMESTAMP` (timezone-aware)

---

### 2. Backend — Database Driver

**File**: `backend/package.json`

```diff
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
-   "mysql2": "^3.12.0"
+   "pg": "^8.13.1"
  }
```

- `mysql2` → `pg` (node-postgres)
- Both support connection pooling
- Both support promises (pg has native promise support)
- `pg` is the standard Node.js PostgreSQL driver, maintained for 15+ years

After changing `package.json`, regenerate the lock file:

```bash
cd backend && rm -rf node_modules package-lock.json && npm install
```

---

### 3. Backend — Connection Code

**File**: `backend/src/db.js`

**MySQL version (current):**
```js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
```

**PostgreSQL version:**
```js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "taskmanager",
  max: 10,                    // connectionLimit equivalent
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Key API differences:**

| Operation | mysql2 | pg |
|-----------|--------|-----|
| Create pool | `mysql.createPool(config)` | `new Pool(config)` |
| Query | `pool.query(sql, params)` | `pool.query(sql, params)` |
| Query result | `const [rows] = await pool.query(...)` | `const { rows } = await pool.query(...)` |
| Placeholders | `?` | `$1, $2, $3` |
| Get connection | `pool.getConnection()` | `pool.connect()` |
| Release | `conn.release()` | `client.release()` |

**The biggest change**: MySQL uses `?` for parameterized queries, PostgreSQL uses numbered `$1, $2, $3` placeholders. This affects every single query in the routes.

**Full PostgreSQL db.js:**

```js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "taskmanager",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log("Database connected successfully");
      client.release();
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

module.exports = { pool, waitForDB };
```

---

### 4. Backend — Route Queries

**File**: `backend/src/routes/categories.js` and `backend/src/routes/tasks.js`

Every query changes in two ways:
1. `?` → `$1, $2, $3` placeholders
2. `const [rows]` → `const { rows }` destructuring

**Example — Create a category:**

MySQL:
```js
const [result] = await pool.query(
  "INSERT INTO categories (name, color) VALUES (?, ?)",
  [name, color]
);
const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
  result.insertId,
]);
res.status(201).json(rows[0]);
```

PostgreSQL:
```js
const { rows } = await pool.query(
  "INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *",
  [name, color]
);
res.status(201).json(rows[0]);
```

**Notice**: PostgreSQL has `RETURNING *` which returns the inserted/updated row in the same query — no need for a separate SELECT. This is actually simpler.

**Example — Update a task:**

MySQL:
```js
const [result] = await pool.query(
  "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, category_id = ? WHERE id = ?",
  [title, description, status, due_date, category_id, req.params.id]
);
if (result.affectedRows === 0) { ... }
const [rows] = await pool.query("SELECT ... WHERE t.id = ?", [req.params.id]);
```

PostgreSQL:
```js
const { rows, rowCount } = await pool.query(
  `UPDATE tasks SET title = $1, description = $2, status = $3, due_date = $4, category_id = $5
   WHERE id = $6 RETURNING *`,
  [title, description, status, due_date, category_id, req.params.id]
);
if (rowCount === 0) { ... }
```

**Summary of query differences:**

| Pattern | MySQL (`mysql2`) | PostgreSQL (`pg`) |
|---------|---------|-----------|
| Placeholders | `?` | `$1, $2, $3` |
| Result destructuring | `const [rows] = await pool.query(...)` | `const { rows } = await pool.query(...)` |
| Insert + get row | Two queries: `INSERT` then `SELECT` | One query: `INSERT ... RETURNING *` |
| Update + get row | Two queries: `UPDATE` then `SELECT` | One query: `UPDATE ... RETURNING *` |
| Delete check | `result.affectedRows` | `result.rowCount` |
| Affected rows | `result[0].affectedRows` | `result.rowCount` |

---

### 5. Docker Compose — DB Service

**File**: `docker-compose.yml`

```diff
  db:
-   image: mysql:8
+   image: postgres:16-alpine
    container_name: taskmanager-db
    restart: unless-stopped
    environment:
-     MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
-     MYSQL_DATABASE: ${MYSQL_DATABASE}
-     MYSQL_USER: ${MYSQL_USER}
-     MYSQL_PASSWORD: ${MYSQL_PASSWORD}
+     POSTGRES_DB: ${POSTGRES_DB}
+     POSTGRES_USER: ${POSTGRES_USER}
+     POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
-     - "3306:3306"
+     - "5432:5432"
    volumes:
-     - mysql-data:/var/lib/mysql
+     - pg-data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend-net
    healthcheck:
-     test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
+     test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

 volumes:
-  mysql-data:
+  pg-data:
```

**Key differences:**

| Aspect | MySQL | PostgreSQL |
|--------|-------|-----------|
| Image | `mysql:8` (Debian, ~600MB) | `postgres:16-alpine` (Alpine, ~240MB) |
| No root user | Separate `MYSQL_ROOT_PASSWORD` + `MYSQL_USER` | `POSTGRES_USER` IS the superuser |
| Data directory | `/var/lib/mysql` | `/var/lib/postgresql/data` |
| Healthcheck command | `mysqladmin ping` | `pg_isready` |
| Default port | 3306 | 5432 |
| Init scripts | `/docker-entrypoint-initdb.d/*.sql` | Same path! (also supports `.sh`) |
| Start period | ~30s (MySQL is slower to initialize) | ~10s (PostgreSQL starts faster) |

**PostgreSQL is simpler**: no separate root user concept. The `POSTGRES_USER` is the superuser. One less env var to manage.

---

### 6. Environment Variables

**File**: `.env`

```diff
  # Database
- MYSQL_ROOT_PASSWORD=rootpassword
- MYSQL_DATABASE=taskmanager
- MYSQL_USER=appuser
- MYSQL_PASSWORD=apppassword
+ POSTGRES_DB=taskmanager
+ POSTGRES_USER=appuser
+ POSTGRES_PASSWORD=apppassword

  # Backend
  DB_HOST=db
- DB_PORT=3306
+ DB_PORT=5432
  DB_USER=appuser
- DB_PASSWORD=apppassword
+ DB_PASSWORD=apppassword
  DB_NAME=taskmanager
  NODE_ENV=development
  BACKEND_PORT=5000

  # Frontend
  VITE_API_URL=http://localhost:5000
```

---

## Side-by-Side Comparison

### Docker-specific changes at a glance

```
┌─────────────────────────┬────────────────────────────────────┬────────────────────────────────────┐
│                         │ MySQL                              │ PostgreSQL                         │
├─────────────────────────┼────────────────────────────────────┼────────────────────────────────────┤
│ Image                   │ mysql:8                            │ postgres:16-alpine                 │
│ Image size              │ ~600 MB                            │ ~240 MB                            │
│ Startup time            │ ~30 seconds                        │ ~10 seconds                        │
│ Data volume path        │ /var/lib/mysql                     │ /var/lib/postgresql/data            │
│ Healthcheck             │ mysqladmin ping -h localhost       │ pg_isready -U user -d db           │
│ Shell into DB           │ docker exec -it db mysql -u ...    │ docker exec -it db psql -U ...     │
│ Env prefix              │ MYSQL_                             │ POSTGRES_                          │
│ Root user               │ Separate root + app user           │ POSTGRES_USER is superuser         │
│ Init script path        │ /docker-entrypoint-initdb.d/       │ /docker-entrypoint-initdb.d/       │
│ NPM package             │ mysql2                             │ pg                                 │
│ Query placeholders      │ ?                                  │ $1, $2, $3                         │
│ RETURNING clause        │ Not supported                      │ Supported (saves extra queries)    │
│ Default port            │ 3306                               │ 5432                               │
└─────────────────────────┴────────────────────────────────────┴────────────────────────────────────┘
```

---

## Full Changed Files

Here are the complete files as they would look with PostgreSQL:

### `db/init.sql`

```sql
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'done');

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  due_date DATE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

INSERT INTO categories (name, color) VALUES
  ('Work', '#3b82f6'),
  ('Personal', '#10b981'),
  ('Urgent', '#ef4444');
```

### `backend/src/db.js`

```js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "taskmanager",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log("Database connected successfully");
      client.release();
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

module.exports = { pool, waitForDB };
```

### `backend/src/routes/categories.js`

```js
const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const { rows } = await pool.query(
      "INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *",
      [name, color || "#6366f1"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const { rows, rowCount } = await pool.query(
      "UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *",
      [name, color || "#6366f1", req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM categories WHERE id = $1",
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
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
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
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

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
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

router.post("/", async (req, res, next) => {
  try {
    const { title, description, status, due_date, category_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, due_date, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description || null, status || "pending", due_date || null, category_id || null]
    );
    // Fetch again with JOIN to include category info
    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, status, due_date, category_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const { rowCount } = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, due_date = $4, category_id = $5
       WHERE id = $6`,
      [title, description || null, status || "pending", due_date || null, category_id || null, req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### `docker-compose.yml` (db service section)

```yaml
  db:
    image: postgres:16-alpine
    container_name: taskmanager-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pg-data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  pg-data:
```

### `.env`

```bash
# Database
POSTGRES_DB=taskmanager
POSTGRES_USER=appuser
POSTGRES_PASSWORD=apppassword

# Backend
DB_HOST=db
DB_PORT=5432
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=taskmanager
NODE_ENV=development
BACKEND_PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000
```

---

## Running the PostgreSQL Version

```bash
# First time (or after changing init.sql)
docker compose down -v              # Remove old MySQL volume
docker compose up -d --build        # Build and start with PostgreSQL

# Visit http://localhost:3000
```

---

## Useful PostgreSQL Docker Commands

```bash
# Shell into the database
docker exec -it taskmanager-db psql -U appuser -d taskmanager

# Run a quick query
docker exec taskmanager-db psql -U appuser -d taskmanager -c "SELECT * FROM categories;"

# List all tables
docker exec taskmanager-db psql -U appuser -d taskmanager -c "\dt"

# Describe a table
docker exec taskmanager-db psql -U appuser -d taskmanager -c "\d tasks"

# Dump the database
docker exec taskmanager-db pg_dump -U appuser taskmanager > backup.sql

# Restore from dump
docker exec -i taskmanager-db psql -U appuser taskmanager < backup.sql

# Check database size
docker exec taskmanager-db psql -U appuser -d taskmanager -c "SELECT pg_size_pretty(pg_database_size('taskmanager'));"
```

---

## Key Differences: MySQL vs PostgreSQL in Docker

### Image size and startup

```bash
# MySQL
docker pull mysql:8              # ~600 MB, ~30 sec startup
# PostgreSQL
docker pull postgres:16-alpine   # ~240 MB, ~10 sec startup
```

PostgreSQL Alpine is significantly smaller and starts faster.

### Authentication model

- **MySQL**: Has a separate root user + application users. You configure `MYSQL_ROOT_PASSWORD` plus optionally `MYSQL_USER`/`MYSQL_PASSWORD`.
- **PostgreSQL**: `POSTGRES_USER` is the superuser. Simpler — one user does everything by default. You can create additional users in `init.sql` if needed.

### Init scripts

Both support `/docker-entrypoint-initdb.d/` for initialization scripts. PostgreSQL additionally supports `.sh` scripts in this directory, which MySQL does not.

Both only run init scripts on **first volume creation**. To re-run, delete the volume:

```bash
docker compose down -v && docker compose up -d
```

### Data directory permissions

PostgreSQL is more strict about data directory permissions. The data directory (`/var/lib/postgresql/data`) must be owned by the `postgres` user inside the container. This rarely causes issues with named volumes but can be a problem with bind mounts on some systems.

### Connection pooling

Both `mysql2` and `pg` provide built-in connection pooling. For production PostgreSQL, many teams add **PgBouncer** as a separate container for more efficient pooling, but it's not required for this project's scale.
