# 5. Writing Dockerfiles

A Dockerfile is the recipe card that tells Docker how to build your image. Let's learn every instruction you'll actually use.

---

## Basic Structure

```dockerfile
# Every Dockerfile starts with FROM
FROM node:20

# Set up the working directory
WORKDIR /app

# Copy files into the image
COPY package.json .

# Run commands (install stuff)
RUN npm install

# Copy the rest of your code
COPY . .

# Tell Docker which port your app uses
EXPOSE 3000

# The command to run when the container starts
CMD ["node", "index.js"]
```

---

## Every Instruction Explained

### `FROM` — Starting point (base image)

Every Dockerfile **must** start with FROM. It picks the base image to build on top of.

```dockerfile
FROM node:20            # Node.js 20 on Debian Linux
FROM node:20-alpine     # Node.js 20 on Alpine Linux (much smaller!)
FROM python:3.12        # Python 3.12
FROM mysql:8            # MySQL 8
FROM ubuntu:22.04       # Plain Ubuntu
```

**Alpine vs Regular:**
```
node:20         → ~1.1 GB  (full Debian OS)
node:20-alpine  → ~180 MB  (minimal Alpine OS)
```

Use `alpine` variants when possible — smaller images = faster builds & deploys.

---

### `WORKDIR` — Set the working directory inside the container

```dockerfile
WORKDIR /app
```

- All subsequent commands run from this directory
- If the directory doesn't exist, Docker creates it
- Like doing `cd /app` but persistent

```dockerfile
WORKDIR /app
COPY . .          # Copies files to /app/
RUN npm install   # Runs npm install inside /app/
```

---

### `COPY` — Copy files from your machine into the image

```dockerfile
COPY package.json .              # Copy one file to current WORKDIR
COPY package.json package-lock.json ./   # Copy multiple files
COPY . .                         # Copy EVERYTHING from current directory
COPY src/ ./src/                 # Copy a specific folder
```

**Format:** `COPY <from-your-machine> <to-inside-container>`

**Why copy package.json separately?**
```dockerfile
# GOOD — npm install is cached if package.json doesn't change
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# BAD — npm install runs EVERY time ANY file changes
COPY . .
RUN npm install
```

---

### `RUN` — Execute a command during build time

```dockerfile
RUN npm install                  # Install Node.js dependencies
RUN apt-get update && apt-get install -y curl   # Install OS packages
RUN mkdir -p /app/logs           # Create directories
RUN pip install -r requirements.txt   # Python deps
```

**Key point:** RUN executes **while building the image**, not when the container starts.

**Combine commands to reduce layers:**
```dockerfile
# BAD — 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# GOOD — 1 layer
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean
```

---

### `CMD` — Default command when container starts

```dockerfile
CMD ["node", "index.js"]          # Exec form (preferred)
CMD ["npm", "start"]              # Run npm start
CMD ["python", "app.py"]          # Run python script
```

**Key points:**
- Only ONE CMD per Dockerfile (last one wins if multiple)
- CMD runs when the container **starts**, not during build
- CMD can be **overridden** when running the container:
  ```bash
  docker run my-app node other-script.js   # Overrides CMD
  ```

**Exec form vs Shell form:**
```dockerfile
CMD ["node", "app.js"]      # Exec form (preferred) — runs as PID 1
CMD node app.js              # Shell form — runs through /bin/sh
```

Always use **exec form** (with brackets) — it handles signals properly.

---

### `ENTRYPOINT` — Like CMD, but harder to override

```dockerfile
ENTRYPOINT ["node"]
CMD ["app.js"]
```

```bash
docker run my-app                # Runs: node app.js
docker run my-app server.js      # Runs: node server.js (only CMD part is overridden)
```

**When to use:**
- `CMD` alone = for most cases
- `ENTRYPOINT` + `CMD` = when the container should ALWAYS run a specific executable, but with different arguments

---

### `EXPOSE` — Document which port the app uses

```dockerfile
EXPOSE 3000
EXPOSE 5000
EXPOSE 80
```

**Important:** EXPOSE doesn't actually publish the port! It's just documentation. You still need `-p` when running:

```bash
docker run -p 3000:3000 my-app   # This actually opens the port
```

---

### `ENV` — Set environment variables

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=mysql://localhost:3306/mydb
```

These are available inside the container at runtime.

```dockerfile
ENV PORT=3000
EXPOSE $PORT                     # Can use ENV values in other instructions
CMD ["node", "app.js"]           # app.js can read process.env.PORT
```

---

### `ARG` — Build-time variables (not available at runtime)

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}

ARG APP_VERSION=1.0
RUN echo "Building version $APP_VERSION"
```

```bash
docker build --build-arg NODE_VERSION=18 -t my-app .
```

**ENV vs ARG:**
| | `ENV` | `ARG` |
|---|-------|-------|
| Available during build | Yes | Yes |
| Available at runtime | Yes | No |
| Persists in image | Yes | No |

---

### `.dockerignore` — Files to exclude from COPY

Create a `.dockerignore` file (like `.gitignore`):

```
node_modules
npm-debug.log
.git
.env
Dockerfile
docker-compose.yml
README.md
.vscode
dist
coverage
```

**Why this matters:**
- Without `.dockerignore`, `COPY . .` copies EVERYTHING including `node_modules` (hundreds of MBs)
- With `.dockerignore`, these files are skipped, making builds faster and images smaller

---

## Complete Real-World Examples

### Node.js / Express API

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### React App (Production Build)

```dockerfile
# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

This is called a **multi-stage build** — it builds the app in one stage, then copies only the built files to a tiny Nginx image. Result: ~25MB instead of ~1GB.

### Python / Flask API

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

## Multi-Stage Builds (Important Concept)

Multi-stage builds let you use one image for building and a different (smaller) image for running.

```dockerfile
# STAGE 1: Build (big image with all build tools)
FROM node:20 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build          # Creates /app/dist folder

# STAGE 2: Production (tiny image with only what's needed)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Why?**
```
Without multi-stage: Final image has Node.js + npm + all dev dependencies = ~1 GB
With multi-stage:    Final image has only Nginx + built files = ~25 MB
```

---

## Dockerfile Best Practices

### 1. Use specific base image tags
```dockerfile
# GOOD
FROM node:20-alpine

# BAD — "latest" can change and break your build
FROM node:latest
```

### 2. Copy package files before source code
```dockerfile
# GOOD — npm install is cached when code changes
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# BAD — npm install runs on every code change
COPY . .
RUN npm ci
```

### 3. Use `npm ci` instead of `npm install`
```dockerfile
RUN npm ci              # Clean install, uses lock file exactly
# vs
RUN npm install         # May resolve different versions
```

### 4. Use alpine images
```dockerfile
FROM node:20-alpine     # ~180 MB
# vs
FROM node:20            # ~1.1 GB
```

### 5. Don't run as root
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "app.js"]
```

### 6. Use .dockerignore
Always create a `.dockerignore` to exclude unnecessary files from the build context.

---

## Building and Running Your First Image

```bash
# 1. Create a simple app
mkdir my-app && cd my-app

# 2. Create index.js
echo 'const http = require("http");
const server = http.createServer((req, res) => {
  res.end("Hello from Docker!");
});
server.listen(3000, () => console.log("Server running on port 3000"));' > index.js

# 3. Create Dockerfile
echo 'FROM node:20-alpine
WORKDIR /app
COPY index.js .
EXPOSE 3000
CMD ["node", "index.js"]' > Dockerfile

# 4. Build the image
docker build -t my-first-app .

# 5. Run it
docker run -d -p 3000:3000 --name hello my-first-app

# 6. Visit http://localhost:3000 in your browser

# 7. Check logs
docker logs hello

# 8. Clean up
docker stop hello && docker rm hello
```

---

## Next Up

Let's learn Docker Compose for running multiple containers together → [06-docker-compose.md](./06-docker-compose.md)
