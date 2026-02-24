# 2. Core Concepts & Terminology

Every term you'll encounter in Docker, explained with simple analogies.

---

## 1. Docker Image

**What it is:** A blueprint/template that contains your app code, dependencies, OS libraries, and instructions to run your app.

**Analogy:** An image is like a **recipe** — it has all the instructions and ingredient list, but it's not the actual dish yet.

**Key points:**
- Images are **read-only** (you don't modify a running image)
- Images are **layered** (built step by step, each step = a layer)
- Images are **reusable** — you can create many containers from one image
- Images are stored in **registries** (like Docker Hub — think of it as GitHub but for Docker images)

```
Example images available on Docker Hub:
  - node:20          → Node.js v20 pre-installed on a Linux OS
  - mysql:8          → MySQL 8 database ready to go
  - nginx:latest     → Nginx web server
  - ubuntu:22.04     → Plain Ubuntu OS
  - redis:7          → Redis cache server
```

**Think of it this way:**

```
Image = Recipe for Butter Chicken
  - Ingredients listed (Node.js, npm packages, your code)
  - Steps to prepare (install dependencies, copy files, set port)
  - Can make many dishes from one recipe (many containers from one image)
```

---

## 2. Container

**What it is:** A **running instance** of an image. It's your app actually executing inside an isolated environment.

**Analogy:** A container is the **cooked dish** — you took the recipe (image) and actually made something real from it.

**Key points:**
- Containers are **isolated** — they don't interfere with each other or your host
- Containers are **temporary by default** — when you stop/remove them, any data inside is gone (unless you use volumes)
- You can run **multiple containers** from the same image
- Each container gets its own file system, network, and process space

```
One image → Many containers:

  node:20 image
    ├── Container 1: Running your Express API
    ├── Container 2: Running your React dev server
    └── Container 3: Running a background worker
```

**Think of it this way:**

```
Image (Recipe)     →    Container (Cooked Dish)
─────────────────────────────────────────────
Blueprint               Running instance
Read-only               Can read + write
Stored on disk          Running in memory
Can exist without       Needs an image to
  containers              be created from
```

---

## 3. Dockerfile

**What it is:** A **text file with instructions** that tells Docker how to build an image. It's like writing down your recipe step by step.

**Analogy:** If the image is a recipe, the Dockerfile is **you writing that recipe down** on paper.

**Key points:**
- Named exactly `Dockerfile` (no extension)
- Each line is an instruction (FROM, COPY, RUN, CMD, etc.)
- Docker reads it top to bottom and builds the image layer by layer

```dockerfile
# Example: Dockerfile for a Node.js app
FROM node:20              # Start with Node.js 20 base image
WORKDIR /app              # Set working directory inside the container
COPY package.json .       # Copy package.json into the container
RUN npm install           # Install dependencies
COPY . .                  # Copy the rest of your code
EXPOSE 3000               # Tell Docker this app uses port 3000
CMD ["node", "index.js"]  # Command to run when container starts
```

**The flow:**

```
Dockerfile  →  (docker build)  →  Image  →  (docker run)  →  Container
(recipe        (cooking the       (the       (serving the     (the dish
 written)       recipe)            dish        dish)            being eaten)
                                   ready)
```

---

## 4. Docker Compose / docker-compose.yml

**What it is:** A tool + config file to run **multiple containers together** as one application.

**Analogy:** If a Dockerfile is a recipe for one dish, docker-compose.yml is a **full meal plan** — appetizer, main course, dessert, all coordinated together.

**Why you need it:**
Real apps aren't just one container. A typical web app needs:
- A **frontend** container (React)
- A **backend** container (Express/Node)
- A **database** container (MySQL/Postgres)
- Maybe a **cache** container (Redis)

Docker Compose lets you define and run ALL of them with one command.

```yaml
# docker-compose.yml (example)
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
```

Then just run:
```bash
docker compose up
```
And ALL three services start together, connected, ready to go.

---

## 5. Docker Hub / Registry

**What it is:** A **cloud storage for Docker images** — like GitHub but for images.

**Analogy:** Docker Hub is like an **App Store for base images**. Need MySQL? Download it. Need Node.js? Download it. Need Nginx? Download it.

**Key points:**
- **Docker Hub** is the default public registry (hub.docker.com)
- Contains **official images** (maintained by Docker/vendors) and **community images**
- You can **push** your own images to share them
- Private registries exist too (AWS ECR, Google GCR, GitHub Container Registry)

```
Docker Hub examples:
  mysql          → Official MySQL image (100M+ pulls)
  node           → Official Node.js image
  nginx          → Official Nginx image
  your-name/app  → Your custom image you pushed
```

---

## 6. Volume

**What it is:** A way to **persist data** outside the container, so it survives even when the container is removed.

**Analogy:** A volume is like a **USB drive plugged into your container** — even if the container (computer) is destroyed, the USB drive (data) still exists.

**Why you need it:**
- Containers are **temporary** — remove the container, lose the data
- Databases NEED persistent storage
- You want to share data between containers

```
Without Volume:
  Container stopped → Database data GONE forever

With Volume:
  Container stopped → Data safely stored on host
  New container started → Same data available again
```

---

## 7. Network

**What it is:** Docker's way of letting containers **talk to each other**.

**Analogy:** A Docker network is like a **private office LAN** — containers on the same network can communicate, containers on different networks are isolated.

**Key points:**
- Docker Compose automatically creates a network for your services
- Containers on the same network can reach each other **by service name**
- You can create custom networks for isolation

```
Same network:
  backend container → can reach "db" container by name "db"
  frontend container → can reach "backend" by name "backend"

Different networks:
  container-A (network-1) → CANNOT reach container-B (network-2)
```

---

## 8. Port Mapping

**What it is:** Connecting a port on your computer (host) to a port inside the container.

**Analogy:** It's like a **doorbell wire** — the doorbell outside (host port) is wired to the bell inside (container port).

**Key points:**
- Containers are isolated — you can't access them from your browser by default
- Port mapping "opens a door" from your machine into the container
- Format: `HOST_PORT:CONTAINER_PORT`

```
docker run -p 8080:3000 my-app

What this means:
  Your browser → localhost:8080 → maps to → container's port 3000

  Host (your PC)          Container
  ┌──────────┐           ┌──────────┐
  │ port 8080 │ ───────► │ port 3000│
  └──────────┘           └──────────┘
```

---

## 9. Tag

**What it is:** A **version label** for an image.

**Analogy:** Like version numbers on software — v1.0, v2.0, latest.

```
node:20        → Node.js version 20
node:18        → Node.js version 18
node:latest    → Latest available version
mysql:8.0      → MySQL version 8.0
mysql:5.7      → MySQL version 5.7

my-app:v1      → Version 1 of your app
my-app:v2      → Version 2 of your app
my-app:latest  → Latest version (default tag)
```

**Tip:** Always use specific tags in production (like `node:20`), not `latest`, so your builds are predictable.

---

## 10. Layer

**What it is:** Each instruction in a Dockerfile creates a **layer**. Layers are cached for speed.

**Analogy:** Like building a cake — each layer (sponge, cream, frosting) is built on top of the previous one. If you only change the frosting, you don't need to rebake the sponge.

```dockerfile
FROM node:20          # Layer 1: Base OS + Node.js
WORKDIR /app          # Layer 2: Set directory
COPY package.json .   # Layer 3: Copy package.json
RUN npm install       # Layer 4: Install dependencies (CACHED if package.json didn't change)
COPY . .              # Layer 5: Copy source code
CMD ["node", "app.js"]# Layer 6: Set startup command
```

**Why layers matter:**
- Docker **caches** layers
- If Layer 3 hasn't changed, Docker reuses cached Layers 1-3 and only rebuilds from Layer 4 onwards
- This makes rebuilds **much faster**
- That's why you copy `package.json` separately before `COPY . .` — so npm install is cached

---

## Quick Reference: All Terms

| Term | One-liner | Analogy |
|------|-----------|---------|
| **Image** | Blueprint with app + dependencies | Recipe |
| **Container** | Running instance of an image | Cooked dish |
| **Dockerfile** | Instructions to build an image | Writing the recipe |
| **Docker Compose** | Run multiple containers together | Full meal plan |
| **Docker Hub** | Cloud storage for images | App Store for images |
| **Volume** | Persistent storage for containers | USB drive |
| **Network** | Communication between containers | Private office LAN |
| **Port Mapping** | Connect host port to container port | Doorbell wiring |
| **Tag** | Version label for images | Software version (v1, v2) |
| **Layer** | Cached build step in Dockerfile | Layers of a cake |
| **Registry** | Where images are stored | GitHub for images |

---

## Next Up

Let's install Docker on your machine → [03-installation.md](./03-installation.md)
