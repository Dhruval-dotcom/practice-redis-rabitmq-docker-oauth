# 7. Volumes and Networks Deep Dive

Two concepts that trip up beginners — let's make them crystal clear.

---

## Part 1: Volumes (Data Persistence)

### The Problem

Containers are **temporary by nature**. When you remove a container, all data inside it is gone.

```bash
# Start MySQL, add some data
docker run -d --name mydb -e MYSQL_ROOT_PASSWORD=secret mysql:8
# ... create tables, insert rows ...

# Remove the container
docker rm -f mydb

# Start it again
docker run -d --name mydb -e MYSQL_ROOT_PASSWORD=secret mysql:8
# All your data is GONE. The database is empty.
```

**Volumes solve this** by storing data outside the container.

---

### Three Ways to Persist Data

#### 1. Named Volumes (Recommended for databases)

Docker manages the storage location. You just give it a name.

```bash
# Create and use a named volume
docker run -d \
  --name mydb \
  -e MYSQL_ROOT_PASSWORD=secret \
  -v mysql-data:/var/lib/mysql \
  mysql:8
```

```
What happens:
  mysql-data (on your host, managed by Docker)
       ↕ (synced)
  /var/lib/mysql (inside the container)
```

Now even if you remove and recreate the container, the data survives:

```bash
docker rm -f mydb

# Start a new container with the SAME volume
docker run -d \
  --name mydb-new \
  -e MYSQL_ROOT_PASSWORD=secret \
  -v mysql-data:/var/lib/mysql \
  mysql:8

# All your data is still there!
```

**In Docker Compose:**
```yaml
services:
  db:
    image: mysql:8
    volumes:
      - mysql-data:/var/lib/mysql     # Named volume

volumes:
  mysql-data:                          # Declare the volume
```

#### 2. Bind Mounts (Best for development)

Map a specific folder from YOUR machine directly into the container.

```bash
# Mount your local ./src folder into the container's /app/src
docker run -d \
  -v $(pwd)/src:/app/src \
  my-node-app
```

```
Your machine:          Container:
./src/index.js    ←→   /app/src/index.js
./src/utils.js    ←→   /app/src/utils.js

Edit on your machine → Changes appear in the container instantly!
```

**Why this is great for development:**
- Edit code on your machine with your favorite editor
- Changes are immediately reflected inside the container
- Combined with nodemon/hot-reload = live development inside Docker

**In Docker Compose:**
```yaml
services:
  backend:
    build: ./backend
    volumes:
      - ./backend/src:/app/src        # Bind mount (starts with ./)
      - /app/node_modules             # Anonymous volume — see tip below
```

**Tip:** The `/app/node_modules` line prevents your local `node_modules` from overwriting the container's `node_modules`. Without this, the bind mount of `./backend/src:/app/src` could mess up installed packages.

#### 3. Anonymous Volumes (Temporary)

Volumes without a name — useful for temporary data.

```bash
docker run -d -v /app/logs my-app
```

Docker creates a volume with a random ID. If the container is removed, you lose track of this volume. Rarely used directly.

---

### Named Volume vs Bind Mount Comparison

| Feature | Named Volume | Bind Mount |
|---------|-------------|------------|
| Syntax | `my-vol:/container/path` | `./host/path:/container/path` |
| Managed by | Docker | You |
| Use case | Database storage, persistent data | Development (live reload) |
| Performance | Better on Mac/Windows | Slightly slower on Mac/Windows |
| Portability | Works everywhere | Depends on host path |
| Backup | `docker volume` commands | Regular file backup |

---

### Volume Management Commands

```bash
# List all volumes
docker volume ls

# Inspect a volume (see where it's stored)
docker volume inspect mysql-data

# Create a volume manually
docker volume create my-vol

# Remove a specific volume
docker volume rm mysql-data

# Remove ALL unused volumes (be careful!)
docker volume prune

# Backup a volume (copy data to a tar file)
docker run --rm \
  -v mysql-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql-backup.tar.gz -C /data .

# Restore a volume from backup
docker run --rm \
  -v mysql-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql-backup.tar.gz -C /data
```

---

## Part 2: Networks (Container Communication)

### The Problem

By default, containers are isolated. How does your backend container talk to your database container?

### Docker Networks 101

When you create a Docker network and put containers on it, they can reach each other **by container name** (or service name in Compose).

```bash
# Create a network
docker network create my-app-net

# Start MySQL on this network
docker run -d \
  --name db \
  --network my-app-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8

# Start backend on the SAME network
docker run -d \
  --name backend \
  --network my-app-net \
  -e DB_HOST=db \
  my-backend-app

# "backend" container can now reach "db" container using hostname "db"
```

Inside the backend container:
```javascript
// backend code can connect to MySQL using:
const connection = mysql.createConnection({
  host: 'db',          // ← This is the container name! Docker resolves it.
  user: 'root',
  password: 'secret'
});
```

---

### Docker Compose Networking (Automatic)

Docker Compose automatically creates a network and connects all services to it.

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    environment:
      DB_HOST: db          # ← Use service name as hostname

  db:
    image: mysql:8
```

You don't need to configure anything — `backend` can reach `db` by the name `db` automatically.

**How it works under the hood:**
```
Docker Compose creates a network: "my-project_default"

  backend container
    ↕ (can reach "db" by name)
  db container

Both on the same "my-project_default" network
```

---

### Network Types

Docker has several network drivers:

#### 1. Bridge (Default)

The standard network for containers on a single machine.

```bash
docker network create my-bridge          # Creates a bridge network
docker network create --driver bridge my-bridge   # Same thing (explicit)
```

- Containers on the same bridge can talk to each other
- Containers are isolated from the host network
- **Most common type for development and single-machine deployments**

#### 2. Host

Container shares the host's network directly.

```bash
docker run --network host nginx
```

- No port mapping needed — container's ports ARE host's ports
- Better performance (no network translation)
- Less isolation
- **Only works on Linux**

#### 3. None

No networking at all.

```bash
docker run --network none my-app
```

- Container is completely isolated
- Use case: security-sensitive batch processing

---

### Custom Networks for Isolation

You can create separate networks to control which containers can talk to each other.

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    networks:
      - front-tier

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    networks:
      - front-tier          # Frontend can reach backend
      - back-tier           # Backend can reach database

  db:
    image: mysql:8
    networks:
      - back-tier           # ONLY backend can reach database

networks:
  front-tier:
  back-tier:
```

```
Result:
  frontend ←→ backend ←→ db
  frontend ✗→ db  (can't reach directly — different networks!)
```

This is a **security best practice** — your database shouldn't be directly accessible from the frontend.

---

### Network Management Commands

```bash
# List all networks
docker network ls

# Create a network
docker network create my-net

# Inspect a network (see connected containers, subnet, etc.)
docker network inspect my-net

# Connect a running container to a network
docker network connect my-net my-container

# Disconnect a container from a network
docker network disconnect my-net my-container

# Remove a network
docker network rm my-net

# Remove all unused networks
docker network prune
```

---

### Port Mapping vs Internal Communication

This confuses many beginners. There are TWO ways containers communicate:

#### 1. External Access (You → Container) — Needs port mapping

```yaml
services:
  backend:
    ports:
      - "5000:5000"       # Your browser can reach localhost:5000
```

#### 2. Internal Access (Container → Container) — No port mapping needed

```yaml
services:
  backend:
    # NO ports needed for db to reach backend internally
    environment:
      DB_HOST: db          # Just use the service name

  db:
    image: mysql:8
    # ports:               # Don't need to expose 3306 to the host
    #   - "3306:3306"      # unless YOU want to connect from your machine
```

**Rule of thumb:**
- Expose ports (`ports:`) only for services YOU need to access from your browser/tools
- Internal services (like databases) don't need exposed ports unless you want to connect with a local DB tool

```yaml
services:
  frontend:
    ports:
      - "3000:3000"       # You access this from browser
  backend:
    ports:
      - "5000:5000"       # You might access API directly for testing
  db:
    # No ports exposed — only backend talks to it internally
    image: mysql:8
```

---

## Quick Reference

```
VOLUMES:
  Named volume:    my-vol:/container/path     → For persistent data (databases)
  Bind mount:      ./host/path:/container/path → For development (live reload)

NETWORKS:
  Default:         All Compose services auto-connected
  Custom:          Isolate groups of services
  Communication:   Use service names as hostnames (e.g., DB_HOST=db)

PORT MAPPING:
  External:        ports: "HOST:CONTAINER"     → Browser access
  Internal:        No ports needed              → Container-to-container via service name
```

---

## Next Up

Tips for real-world Docker usage → [08-real-world-tips.md](./08-real-world-tips.md)
