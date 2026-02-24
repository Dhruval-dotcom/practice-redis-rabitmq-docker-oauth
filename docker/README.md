# Task Manager — Full-Stack Docker Project

A dockerized CRUD application built as a hands-on Docker learning project. Three containers work together: a **React** frontend, an **Express** API backend, and a **MySQL** database — all orchestrated with Docker Compose.

**Two pages, full CRUD on both, with a foreign key relationship between them.**

---

## Table of Contents

- [Architecture](#architecture)
- [Docker Concepts Covered](#docker-concepts-covered)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Mode](#development-mode)
- [Production Mode](#production-mode)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [How the Networking Works](#how-the-networking-works)
- [Volumes and Data Persistence](#volumes-and-data-persistence)
- [Useful Docker Commands](#useful-docker-commands)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend   │       │   Backend    │       │   Database   │
│  React/Vite  │──────▶│   Express    │──────▶│   MySQL 8    │
│  port 3000   │  API  │  port 5000   │  SQL  │  port 3306   │
│  (dev)       │       │              │       │              │
│  Nginx :80   │       │              │       │              │
│  (prod)      │       │              │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
   frontend-net      frontend-net + backend-net     backend-net
```

**Dev mode**: Vite dev server on port 3000 with hot module replacement. Source code is bind-mounted so changes reflect instantly without rebuilding.

**Prod mode**: React is compiled to static files and served by Nginx on port 80. Nginx also reverse-proxies `/api` requests to the backend. No source code mounted — everything is baked into the images.

---

## Docker Concepts Covered

| Concept | Where | What to Look At |
|---|---|---|
| **Dockerfile** | `frontend/Dockerfile`, `backend/Dockerfile` | Base image, WORKDIR, COPY, RUN, EXPOSE, CMD |
| **Multi-stage build** | `frontend/Dockerfile.prod` | Stage 1 builds with Node, Stage 2 serves with Nginx |
| **Images** | Built from Dockerfiles + `mysql:8` from Docker Hub | `docker images` to see them |
| **Containers** | 3 containers: frontend, backend, db | `docker ps` to see them |
| **Docker Compose** | `docker-compose.yml` | Orchestrates all 3 services declaratively |
| **Bind mounts** | `docker-compose.yml` volumes on frontend/backend | `./backend/src:/app/src` for live editing |
| **Named volumes** | `mysql-data` in compose | Persists database across container restarts |
| **Custom networks** | `frontend-net`, `backend-net` | Network isolation between services |
| **Port mapping** | `ports` in compose | Host:Container mapping (3000:3000, 5000:5000) |
| **Environment variables** | `.env` + `environment:` in compose | Config passed to containers at runtime |
| **Healthcheck** | `db` service in compose | MySQL readiness check before backend starts |
| **depends_on + condition** | `backend` depends on `db: service_healthy` | Startup ordering with health verification |
| **.dockerignore** | `frontend/.dockerignore`, `backend/.dockerignore` | Excludes node_modules, .git from build context |
| **Layer caching** | All Dockerfiles | `COPY package.json` before `COPY .` so deps are cached |
| **Non-root user** | `backend/Dockerfile.prod` | `adduser` + `USER appuser` for security |
| **Dev vs Prod configs** | Separate Dockerfiles and compose files | Different strategies for each environment |
| **Compose overrides** | `docker-compose.prod.yml` | Overrides dev settings for production |

---

## Project Structure

```
docker/
├── docker-compose.yml          # Development compose (3 services)
├── docker-compose.prod.yml     # Production overrides
├── .env                        # Environment variables
├── .env.example                # Template for env vars
├── README.md
│
├── frontend/
│   ├── Dockerfile              # Dev: Vite dev server with HMR
│   ├── Dockerfile.prod         # Prod: Multi-stage (Node build → Nginx)
│   ├── .dockerignore
│   ├── nginx.conf              # Nginx config for production (SPA + API proxy)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js          # Vite config with API proxy to backend
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Router setup with 2 pages
│       ├── App.css             # All styles
│       ├── api.js              # Axios client (baseURL: /api)
│       ├── components/
│       │   ├── Navbar.jsx      # Navigation bar with active link highlighting
│       │   ├── TaskForm.jsx    # Create/edit task form
│       │   ├── TaskList.jsx    # Task list with status badges and categories
│       │   ├── CategoryForm.jsx # Create/edit category form with color picker
│       │   └── CategoryList.jsx # Category list with color swatches
│       └── pages/
│           ├── TasksPage.jsx   # Tasks page: form + list + CRUD logic
│           └── CategoriesPage.jsx # Categories page: form + list + CRUD logic
│
├── backend/
│   ├── Dockerfile              # Dev: nodemon for auto-restart
│   ├── Dockerfile.prod         # Prod: npm ci --omit=dev, non-root user
│   ├── .dockerignore
│   ├── package.json
│   └── src/
│       ├── index.js            # Express app: cors, routes, error handling
│       ├── db.js               # MySQL connection pool + retry logic (10 retries)
│       ├── routes/
│       │   ├── tasks.js        # GET, POST, PUT, DELETE /api/tasks (with JOIN)
│       │   └── categories.js   # GET, POST, PUT, DELETE /api/categories
│       └── middleware/
│           └── errorHandler.js # Centralized error handler
│
└── db/
    └── init.sql                # Creates tables + seeds 3 default categories
```

---

## Prerequisites

- **Docker Desktop** (or Docker Engine + Docker Compose v2)
- That's it. No Node.js, MySQL, or anything else needed on your machine.

Verify Docker is installed:

```bash
docker --version        # Docker version 24+ recommended
docker compose version  # Docker Compose v2+
```

---

## Getting Started

### 1. Clone or navigate to the project

```bash
cd /path/to/docker
```

### 2. Check the environment file

The `.env` file is already configured with defaults. Review it if you want to change passwords or ports:

```bash
cat .env
```

Key variables:

| Variable | Default | Purpose |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `MYSQL_DATABASE` | `taskmanager` | Database name created on first run |
| `MYSQL_USER` | `appuser` | App database user |
| `MYSQL_PASSWORD` | `apppassword` | App database password |
| `BACKEND_PORT` | `5000` | Express server port |

### 3. Start the application

```bash
docker compose up -d --build
```

This single command:
1. Pulls the `mysql:8` image from Docker Hub
2. Builds the frontend image from `frontend/Dockerfile`
3. Builds the backend image from `backend/Dockerfile`
4. Creates the `frontend-net` and `backend-net` networks
5. Creates the `mysql-data` named volume
6. Starts the MySQL container and waits for it to be healthy
7. Starts the backend container (connects to MySQL with retry logic)
8. Starts the frontend container

### 4. Open the app

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Database**: `localhost:3306` (connect with any MySQL client)

### 5. Try it out

1. Go to the **Categories** page — you'll see 3 seeded categories (Work, Personal, Urgent)
2. Create a new category with a custom name and color
3. Go to the **Tasks** page
4. Create a task — pick a title, description, status, due date, and category
5. Edit a task by clicking "Edit", change fields, click "Update"
6. Delete tasks and categories

---

## Development Mode

Development mode gives you **live code editing** — change a file on your machine and it's instantly reflected in the running container.

### Start

```bash
docker compose up -d --build
```

### What happens

| Service | Port | Hot Reload | How |
|---|---|---|---|
| Frontend | `localhost:3000` | Yes (HMR) | `./frontend/src` bind-mounted into container |
| Backend | `localhost:5000` | Yes (nodemon) | `./backend/src` bind-mounted into container |
| Database | `localhost:3306` | N/A | Data persisted in `mysql-data` volume |

### Edit code live

```bash
# Edit any frontend file — browser updates instantly
vim frontend/src/components/Navbar.jsx

# Edit any backend file — nodemon restarts the server
vim backend/src/routes/tasks.js
```

### View logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Stop

```bash
# Stop containers (data preserved)
docker compose down

# Stop and delete all data
docker compose down -v
```

---

## Production Mode

Production mode uses optimized images with no source code mounted, no dev tools, and Nginx serving the frontend.

### Start

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### What's different from dev

| Aspect | Development | Production |
|---|---|---|
| Frontend server | Vite dev server (port 3000) | Nginx (port 80) |
| Frontend build | Source files served directly | `npm run build` → static files |
| Backend | nodemon (auto-restart on changes) | `node src/index.js` (no devDeps) |
| Bind mounts | Source code mounted from host | None — code baked into images |
| DB port exposed | Yes (3306) | No — only accessible internally |
| Restart policy | `unless-stopped` | `always` |
| Backend user | root | Non-root `appuser` |

### Access

- **App**: http://localhost (port 80, served by Nginx)
- **API**: http://localhost/api/health (proxied by Nginx to backend)

### Stop

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Health Check

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Returns `{ status: "ok", timestamp: "..." }` |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get a single category |
| POST | `/api/categories` | Create a category (`{ name, color }`) |
| PUT | `/api/categories/:id` | Update a category (`{ name, color }`) |
| DELETE | `/api/categories/:id` | Delete a category |

### Tasks

| Method | Path | Description |
|---|---|---|
| GET | `/api/tasks` | List all tasks (includes category name/color via JOIN) |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a task (`{ title, description, status, due_date, category_id }`) |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

**Task status values**: `pending`, `in-progress`, `done`

### Test with curl

```bash
# List categories
curl http://localhost:5000/api/categories

# Create a category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Learning", "color": "#8b5cf6"}'

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Docker", "description": "Complete the project", "status": "in-progress", "category_id": 1}'

# Update a task
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Docker", "status": "done", "category_id": 1}'

# Delete a task
curl -X DELETE http://localhost:5000/api/tasks/1
```

---

## Database Schema

```sql
categories
├── id          INT AUTO_INCREMENT PRIMARY KEY
├── name        VARCHAR(100) NOT NULL
├── color       VARCHAR(7) DEFAULT '#6366f1'
└── created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP

tasks
├── id          INT AUTO_INCREMENT PRIMARY KEY
├── title       VARCHAR(255) NOT NULL
├── description TEXT
├── status      ENUM('pending', 'in-progress', 'done') DEFAULT 'pending'
├── due_date    DATE
├── category_id INT → FOREIGN KEY → categories(id) ON DELETE SET NULL
├── created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Relationship**: A task optionally belongs to one category. Deleting a category sets `category_id` to NULL on its tasks (not cascade delete).

### Connect to MySQL directly

```bash
# From host (dev mode only, port 3306 exposed)
mysql -h 127.0.0.1 -P 3306 -u appuser -papppassword taskmanager

# From inside the container
docker exec -it taskmanager-db mysql -u appuser -papppassword taskmanager

# Run a quick query
docker exec taskmanager-db mysql -u appuser -papppassword taskmanager -e "SELECT * FROM categories;"
```

---

## How the Networking Works

Two custom Docker networks isolate the services:

```
                    frontend-net                    backend-net
                 ┌───────────────────┐         ┌───────────────────┐
                 │                   │         │                   │
              ┌──┴──┐           ┌────┴────┐    │    ┌──────┐      │
  Browser ──▶ │ FE  │──── /api ──▶│ Backend │───┼───▶│  DB  │      │
  :3000       │     │           │  :5000  │    │    │ :3306│      │
              └──┬──┘           └────┬────┘    │    └──────┘      │
                 │                   │         │                   │
                 └───────────────────┘         └───────────────────┘
```

- **frontend-net**: Frontend and backend can talk to each other. Frontend proxies `/api` requests to `http://backend:5000`.
- **backend-net**: Backend and database can talk to each other. Frontend cannot reach the database directly.
- Docker's built-in DNS lets services reference each other by name (`backend`, `db`).

---

## Volumes and Data Persistence

### Named volume: `mysql-data`

```bash
# See the volume
docker volume ls

# Inspect it
docker volume inspect docker_mysql-data
```

### Persistence test

```bash
# 1. Create some tasks in the app

# 2. Stop all containers
docker compose down

# 3. Start again — your data is still there
docker compose up -d

# 4. Stop and remove volumes — data is gone
docker compose down -v
```

### Bind mounts (dev only)

| Host Path | Container Path | Purpose |
|---|---|---|
| `./frontend/src` | `/app/src` | Live editing with Vite HMR |
| `./backend/src` | `/app/src` | Live editing with nodemon |
| `./db/init.sql` | `/docker-entrypoint-initdb.d/init.sql` | Run SQL on first DB creation |

---

## Useful Docker Commands

```bash
# ─── Lifecycle ───────────────────────────────────────────
docker compose up -d --build       # Build and start all services
docker compose down                # Stop and remove containers
docker compose down -v             # Stop, remove containers AND volumes
docker compose restart backend     # Restart a single service

# ─── Monitoring ──────────────────────────────────────────
docker compose ps                  # List running containers
docker compose logs -f             # Follow all logs
docker compose logs -f backend     # Follow one service's logs
docker compose top                 # Show running processes

# ─── Debugging ───────────────────────────────────────────
docker exec -it taskmanager-backend sh     # Shell into backend
docker exec -it taskmanager-frontend sh    # Shell into frontend
docker exec -it taskmanager-db bash        # Shell into database

# ─── Images ──────────────────────────────────────────────
docker images                      # List all images
docker image prune                 # Remove unused images

# ─── Volumes ─────────────────────────────────────────────
docker volume ls                   # List volumes
docker volume inspect docker_mysql-data   # Inspect the DB volume

# ─── Networks ────────────────────────────────────────────
docker network ls                  # List networks
docker network inspect docker_frontend-net  # See which containers are attached

# ─── Rebuild a single service ────────────────────────────
docker compose up -d --build backend     # Rebuild only backend
docker compose up -d --build frontend    # Rebuild only frontend
```

---

## Troubleshooting

### Backend can't connect to database

The backend has retry logic (10 attempts, 3 seconds apart). If it still fails:

```bash
# Check if DB is healthy
docker compose ps

# Check DB logs
docker compose logs db

# Manually test DB connection
docker exec taskmanager-db mysqladmin ping -u root -prootpassword
```

### Port already in use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :5000
lsof -i :3306

# Change ports in .env or docker-compose.yml
```

### Frontend can't reach backend

In **dev mode**, Vite proxies `/api` to `http://backend:5000` (configured in `vite.config.js`).
In **prod mode**, Nginx proxies `/api` to `http://backend:5000` (configured in `nginx.conf`).

If requests fail, check:
```bash
# Is backend running?
docker compose ps

# Can frontend reach backend on the network?
docker exec taskmanager-frontend ping backend

# Check backend health
curl http://localhost:5000/api/health
```

### Start fresh

```bash
# Nuclear option: remove everything and rebuild
docker compose down -v
docker compose up -d --build
```

### Database didn't initialize

`init.sql` only runs on **first creation** of the database volume. If you changed `init.sql` and want it to re-run:

```bash
docker compose down -v    # Remove the volume
docker compose up -d      # Volume recreated, init.sql runs again
```
