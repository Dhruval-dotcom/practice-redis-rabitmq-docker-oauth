# 6. Docker Compose

When your app needs multiple services (frontend + backend + database), managing them individually with `docker run` becomes painful. Docker Compose solves this.

---

## What Is Docker Compose?

**Without Compose** — you'd run each container manually:
```bash
# Start MySQL
docker run -d --name db -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 mysql:8

# Start backend
docker run -d --name api -p 5000:5000 --link db my-api

# Start frontend
docker run -d --name web -p 3000:3000 my-frontend

# That's 3 long commands. And you have to remember the order, flags, etc.
```

**With Compose** — one file, one command:
```bash
docker compose up -d     # Start everything
docker compose down      # Stop everything
```

---

## The docker-compose.yml File

This YAML file defines all your services, networks, and volumes.

### Basic Structure

```yaml
# docker-compose.yml

services:
  service-name:
    # configuration for this service
    image: or build:
    ports:
    environment:
    volumes:
    depends_on:
```

### Complete Example: Express + MySQL

```yaml
services:
  # --- Backend API ---
  backend:
    build: ./backend              # Build from Dockerfile in ./backend/
    ports:
      - "5000:5000"              # Host port 5000 → Container port 5000
    environment:
      DB_HOST: db                 # Use service name "db" as hostname
      DB_USER: root
      DB_PASSWORD: secret
      DB_NAME: myapp
    depends_on:
      - db                        # Start "db" before "backend"
    restart: unless-stopped       # Auto-restart if it crashes

  # --- Database ---
  db:
    image: mysql:8                # Use official MySQL image from Docker Hub
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: myapp       # Auto-create this database on first run
    volumes:
      - mysql-data:/var/lib/mysql # Persist data even if container is removed

# Named volumes (declared at the top level)
volumes:
  mysql-data:                     # Docker manages this volume
```

---

## Every Important Field Explained

### `image` — Use a pre-built image from Docker Hub

```yaml
services:
  db:
    image: mysql:8              # Pull from Docker Hub

  cache:
    image: redis:7-alpine       # Pull Redis Alpine
```

### `build` — Build from a local Dockerfile

```yaml
services:
  backend:
    build: ./backend            # Look for Dockerfile in ./backend/

  frontend:
    build:
      context: ./frontend       # Build context directory
      dockerfile: Dockerfile    # Dockerfile name (default)
```

### `ports` — Map host ports to container ports

```yaml
ports:
  - "3000:3000"         # HOST:CONTAINER
  - "8080:80"           # Access container's port 80 via localhost:8080
  - "5432:5432"
```

### `environment` — Set environment variables

```yaml
# Inline
environment:
  NODE_ENV: production
  DB_HOST: db
  DB_PASSWORD: secret

# From a file
env_file:
  - .env                # Load all variables from .env file
```

### `volumes` — Persistent storage and file mounting

```yaml
volumes:
  # Named volume (Docker manages the location)
  - mysql-data:/var/lib/mysql

  # Bind mount (map a local folder into the container)
  - ./backend/src:/app/src        # For live code reloading in development

  # Read-only bind mount
  - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

**Named volume vs Bind mount:**
```
Named volume:    mysql-data:/var/lib/mysql
  → Docker stores the data somewhere on your disk (Docker manages it)
  → Best for: database data, persistent storage

Bind mount:      ./src:/app/src
  → Maps a specific folder from YOUR machine into the container
  → Best for: development (live reload when you edit files)
```

### `depends_on` — Control startup order

```yaml
services:
  backend:
    depends_on:
      - db              # "db" starts BEFORE "backend"
      - cache           # "cache" also starts before "backend"

  db:
    image: mysql:8

  cache:
    image: redis:7
```

**Important:** `depends_on` only waits for the container to START, not for the service inside to be READY. MySQL might take a few seconds to accept connections even after its container starts. For that, you'd need health checks:

```yaml
services:
  db:
    image: mysql:8
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    depends_on:
      db:
        condition: service_healthy   # Wait until db is actually ready
```

### `restart` — What to do when a container crashes

```yaml
restart: "no"                # Don't restart (default)
restart: always              # Always restart
restart: on-failure          # Restart only if it crashes (non-zero exit)
restart: unless-stopped      # Restart unless you manually stop it
```

### `networks` — Custom network configuration

```yaml
services:
  frontend:
    networks:
      - frontend-net

  backend:
    networks:
      - frontend-net         # Can talk to frontend
      - backend-net          # Can talk to db

  db:
    networks:
      - backend-net          # Can ONLY talk to backend (not frontend)

networks:
  frontend-net:
  backend-net:
```

By default, Docker Compose creates ONE network for all services and they can all reach each other. Custom networks let you isolate things.

### `command` — Override the CMD from Dockerfile

```yaml
services:
  backend:
    build: ./backend
    command: npm run dev     # Override Dockerfile's CMD for development
```

---

## Full-Stack Example: React + Express + MySQL

```yaml
# docker-compose.yml

services:
  # --- React Frontend ---
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000
    depends_on:
      - backend

  # --- Express Backend ---
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: secret
      DB_NAME: myapp
      PORT: 5000
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  # --- MySQL Database ---
  db:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: myapp
    volumes:
      - mysql-data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql  # Auto-run SQL on first start
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql-data:
```

**Folder structure for this setup:**
```
my-project/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── db/
    └── init.sql           # Initial database schema
```

---

## Development vs Production Compose Files

You can have multiple compose files:

**docker-compose.yml** (base):
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
```

**docker-compose.override.yml** (auto-loaded in development):
```yaml
services:
  backend:
    command: npm run dev                    # Dev server with hot reload
    volumes:
      - ./backend/src:/app/src             # Live code changes
    environment:
      NODE_ENV: development
```

**docker-compose.prod.yml** (production):
```yaml
services:
  backend:
    command: node dist/server.js
    environment:
      NODE_ENV: production
    restart: always
```

```bash
# Development (auto-merges docker-compose.yml + docker-compose.override.yml)
docker compose up

# Production (explicitly specify files)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Common Docker Compose Workflows

```bash
# Start everything
docker compose up -d

# Rebuild and start (after changing Dockerfile or adding dependencies)
docker compose up -d --build

# View logs
docker compose logs -f

# View logs for one service
docker compose logs -f backend

# Stop everything
docker compose down

# Stop everything + delete database data
docker compose down -v

# Restart one service
docker compose restart backend

# Shell into a service
docker compose exec backend bash

# Run a one-off command
docker compose run backend npm test

# Scale a service (run multiple instances)
docker compose up -d --scale backend=3
```

---

## Using `.env` File with Compose

Create a `.env` file in the same directory as `docker-compose.yml`:

```env
# .env
MYSQL_ROOT_PASSWORD=supersecret
MYSQL_DATABASE=myapp
BACKEND_PORT=5000
```

Reference in `docker-compose.yml`:

```yaml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}

  backend:
    ports:
      - "${BACKEND_PORT}:${BACKEND_PORT}"
```

Docker Compose automatically reads `.env` file — no extra config needed.

---

## Next Up

Deep dive into volumes and networks → [07-volumes-and-networks.md](./07-volumes-and-networks.md)
