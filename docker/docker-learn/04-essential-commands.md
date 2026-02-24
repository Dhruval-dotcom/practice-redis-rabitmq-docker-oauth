# 4. Essential Docker Commands

Every command you'll use in real day-to-day work, organized by category.

---

## Image Commands

### `docker pull` — Download an image from Docker Hub

```bash
docker pull node:20
docker pull mysql:8
docker pull nginx:latest
```

Think of it as: **downloading an app from the store**

### `docker images` — List all images on your machine

```bash
docker images
```

Output:
```
REPOSITORY   TAG       IMAGE ID       SIZE
node         20        abc123def456   1.1GB
mysql        8         def789ghi012   573MB
nginx        latest    jkl345mno678   187MB
```

### `docker rmi` — Remove an image

```bash
docker rmi node:20           # Remove by name:tag
docker rmi abc123def456      # Remove by image ID
docker rmi $(docker images -q)  # Remove ALL images (nuclear option)
```

### `docker build` — Build an image from a Dockerfile

```bash
docker build -t my-app:v1 .
#             ^^^^^^^^^^^ ^^
#             name:tag     context (current directory)
```

- `-t` = give it a name and tag
- `.` = look for Dockerfile in the current directory

```bash
# More examples
docker build -t my-api:latest .
docker build -t my-api:v2 -f Dockerfile.prod .   # Use a specific Dockerfile
docker build --no-cache -t my-app .               # Rebuild without cache
```

### `docker tag` — Give an image a new name/tag

```bash
docker tag my-app:v1 my-app:latest
docker tag my-app:v1 dhruval/my-app:v1    # Tag for pushing to Docker Hub
```

### `docker push` — Upload an image to a registry

```bash
docker login                          # Login to Docker Hub first
docker push dhruval/my-app:v1         # Push to Docker Hub
```

---

## Container Commands

### `docker run` — Create and start a container from an image

This is the **most important command**. Let's break down the flags:

```bash
# Basic run
docker run nginx

# Run with common flags (you'll use this combo a LOT)
docker run -d -p 8080:80 --name my-nginx nginx
```

**Flags you'll actually use:**

| Flag | What it does | Example |
|------|-------------|---------|
| `-d` | Run in **detached** mode (background) | `docker run -d nginx` |
| `-p` | **Port mapping** host:container | `-p 8080:80` |
| `--name` | Give the container a **name** | `--name my-app` |
| `-e` | Set **environment variable** | `-e MYSQL_ROOT_PASSWORD=secret` |
| `-v` | Mount a **volume** (persistent storage) | `-v mydata:/var/lib/mysql` |
| `--rm` | **Auto-remove** container when it stops | `docker run --rm nginx` |
| `-it` | **Interactive** mode with terminal (for debugging) | `docker run -it node:20 bash` |
| `--network` | Connect to a specific **network** | `--network my-net` |

**Real-world examples:**

```bash
# Run MySQL with a password, port, and persistent storage
docker run -d \
  --name my-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=mysecret \
  -e MYSQL_DATABASE=mydb \
  -v mysql-data:/var/lib/mysql \
  mysql:8

# Run a Node.js app you built
docker run -d \
  --name my-api \
  -p 5000:5000 \
  my-api:latest

# Jump into a container interactively (for debugging)
docker run -it node:20 bash
# Now you're INSIDE the container — try: node --version, ls, etc.
# Type "exit" to leave
```

### `docker ps` — List running containers

```bash
docker ps          # Show running containers only
docker ps -a       # Show ALL containers (including stopped ones)
```

Output:
```
CONTAINER ID   IMAGE     STATUS          PORTS                  NAMES
a1b2c3d4e5f6   nginx     Up 2 minutes    0.0.0.0:8080->80/tcp   my-nginx
f6e5d4c3b2a1   mysql:8   Up 5 minutes    0.0.0.0:3306->3306/tcp my-mysql
```

### `docker stop` — Stop a running container

```bash
docker stop my-nginx              # Stop by name
docker stop a1b2c3d4e5f6          # Stop by container ID
docker stop $(docker ps -q)       # Stop ALL running containers
```

### `docker start` — Start a stopped container

```bash
docker start my-nginx             # Start a previously stopped container
```

### `docker restart` — Restart a container

```bash
docker restart my-nginx
```

### `docker rm` — Remove a container

```bash
docker rm my-nginx                # Remove a stopped container
docker rm -f my-nginx             # Force remove (even if running)
docker rm $(docker ps -aq)        # Remove ALL containers
```

### `docker logs` — View container output/logs

```bash
docker logs my-nginx              # Show all logs
docker logs -f my-nginx           # Follow logs in real-time (like tail -f)
docker logs --tail 50 my-nginx    # Show last 50 lines
docker logs --since 1h my-nginx   # Logs from last 1 hour
```

This is your **best friend for debugging**.

### `docker exec` — Run a command INSIDE a running container

```bash
# Open a bash shell inside a running container
docker exec -it my-nginx bash

# Run a single command inside the container
docker exec my-mysql mysql -u root -p

# Check something inside the container
docker exec my-app cat /app/config.json
```

**Flags:**
- `-it` = interactive + terminal (needed for shell access)

### `docker inspect` — Get detailed info about a container

```bash
docker inspect my-nginx           # Returns detailed JSON info
docker inspect my-nginx | grep IPAddress   # Find container's IP
```

### `docker cp` — Copy files between host and container

```bash
docker cp ./local-file.txt my-nginx:/usr/share/nginx/html/
docker cp my-nginx:/var/log/nginx/access.log ./logs/
```

---

## Docker Compose Commands

These are for when you have a `docker-compose.yml` file (multi-container apps).

### `docker compose up` — Start all services

```bash
docker compose up                 # Start all services (attached — see logs)
docker compose up -d              # Start in background (detached)
docker compose up --build         # Rebuild images before starting
docker compose up -d --build      # Both (most common in development)
```

### `docker compose down` — Stop and remove all services

```bash
docker compose down               # Stop containers + remove them + remove network
docker compose down -v            # Also remove volumes (DELETES DATABASE DATA!)
docker compose down --rmi all     # Also remove images
```

### `docker compose logs` — View logs for all services

```bash
docker compose logs               # All service logs
docker compose logs -f            # Follow in real-time
docker compose logs backend       # Logs for specific service
docker compose logs -f backend db # Follow multiple services
```

### `docker compose ps` — List compose services

```bash
docker compose ps                 # Show status of all services
```

### `docker compose build` — Build/rebuild images

```bash
docker compose build              # Build all services
docker compose build backend      # Build specific service
docker compose build --no-cache   # Build without cache
```

### `docker compose exec` — Run command in a running service

```bash
docker compose exec backend bash          # Shell into backend container
docker compose exec db mysql -u root -p   # Access MySQL CLI
```

### `docker compose restart` — Restart services

```bash
docker compose restart            # Restart all services
docker compose restart backend    # Restart specific service
```

---

## Volume Commands

```bash
docker volume ls                  # List all volumes
docker volume create mydata       # Create a volume
docker volume inspect mydata      # See volume details
docker volume rm mydata           # Remove a volume
docker volume prune               # Remove ALL unused volumes
```

---

## Network Commands

```bash
docker network ls                 # List all networks
docker network create my-net      # Create a network
docker network inspect my-net     # See network details (connected containers, etc.)
docker network rm my-net          # Remove a network
docker network prune              # Remove all unused networks
```

---

## Cleanup Commands (Housekeeping)

Docker can eat up disk space fast. These commands help clean up:

```bash
# See how much space Docker is using
docker system df

# Remove ALL unused data (stopped containers, unused images, networks, cache)
docker system prune

# The nuclear option — remove EVERYTHING unused including volumes
docker system prune -a --volumes
# ⚠️  Be careful — this deletes database data in volumes too!

# Remove only dangling images (untagged, leftover from builds)
docker image prune

# Remove stopped containers
docker container prune
```

---

## Quick Reference Cheat Sheet

```
IMAGE COMMANDS:
  docker pull <image>           Download an image
  docker images                 List images
  docker build -t <name> .     Build image from Dockerfile
  docker rmi <image>           Remove image

CONTAINER COMMANDS:
  docker run -d -p H:C --name <n> <image>   Create & start container
  docker ps                     List running containers
  docker ps -a                  List ALL containers
  docker stop <name>            Stop container
  docker start <name>           Start stopped container
  docker rm <name>              Remove container
  docker logs -f <name>         Follow container logs
  docker exec -it <name> bash   Shell into container

COMPOSE COMMANDS:
  docker compose up -d          Start all services (background)
  docker compose down           Stop & remove all
  docker compose logs -f        Follow all logs
  docker compose build          Build/rebuild images
  docker compose exec <s> bash  Shell into service

CLEANUP:
  docker system prune -a        Clean everything unused
  docker volume prune           Clean unused volumes
```

---

## Next Up

Let's learn how to write Dockerfiles properly → [05-dockerfile-guide.md](./05-dockerfile-guide.md)
