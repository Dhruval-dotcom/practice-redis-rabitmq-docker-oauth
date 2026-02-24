# 8. Real-World Tips, Debugging & Best Practices

Things you'll run into in actual day-to-day Docker usage.

---

## Debugging Containers

### Container won't start? Check the logs first.

```bash
docker logs my-container               # See what went wrong
docker logs --tail 100 my-container    # Last 100 lines
docker compose logs backend            # Logs for a Compose service
```

### Need to look inside a running container?

```bash
docker exec -it my-container bash      # Open a shell inside
docker exec -it my-container sh        # Use sh if bash isn't available (Alpine)

# Once inside, you can:
ls /app                                # Check your files
cat /app/.env                          # Check environment
node -v                                # Check Node version
ping db                                # Check if db container is reachable
env                                    # See all environment variables
```

### Container keeps crashing (restart loop)?

```bash
# Check exit code
docker ps -a
# Look for "Exited (1)" — that's a crash

# Check logs for the error
docker logs my-container

# Common causes:
# - Missing environment variables
# - Database not ready yet (depends_on doesn't wait for readiness)
# - Port already in use
# - File permissions
# - Wrong CMD or entry point
```

### Port already in use?

```bash
# "port is already allocated" error

# Find what's using the port
lsof -i :3000                         # Linux/Mac
netstat -tlnp | grep 3000             # Linux

# Either stop that process or use a different host port
docker run -p 3001:3000 my-app        # Map to 3001 instead
```

---

## Container Lifecycle Cheat Sheet

```
                docker create
                     │
                     ▼
              ┌─────────────┐
              │   CREATED    │
              └──────┬──────┘
                     │ docker start
                     ▼
              ┌─────────────┐
              │   RUNNING    │ ←── docker restart
              └──────┬──────┘
                     │ docker stop / app exits
                     ▼
              ┌─────────────┐
              │   STOPPED    │
              └──────┬──────┘
                     │ docker rm
                     ▼
              ┌─────────────┐
              │   REMOVED    │
              └─────────────┘

docker run = docker create + docker start (combined)
```

---

## Common Patterns

### Wait for Database to be Ready

The most common issue: backend starts before database is ready.

**Option 1: Health check in Compose (recommended)**

```yaml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy    # Wait until healthy
```

**Option 2: Retry logic in your app code**

```javascript
// Simple retry logic in Node.js
async function connectWithRetry() {
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.connect();
      console.log('Connected to database');
      return;
    } catch (err) {
      console.log(`DB not ready, retrying in 3s... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('Could not connect to database');
}
```

### Hot Reload in Development

Mount your source code so changes appear instantly:

```yaml
services:
  backend:
    build: ./backend
    command: npm run dev              # Use nodemon or tsx --watch
    volumes:
      - ./backend/src:/app/src        # Mount source code
      - /app/node_modules             # Protect container's node_modules
    ports:
      - "5000:5000"
```

### Init Scripts for Database

Run SQL scripts on first database startup:

```yaml
services:
  db:
    image: mysql:8
    volumes:
      - mysql-data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./db/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
```

Files in `/docker-entrypoint-initdb.d/` are executed **only on the first run** (when the database is created). They run in alphabetical order.

```sql
-- db/init.sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Image Size Optimization

### Check image sizes

```bash
docker images
# REPOSITORY    TAG       SIZE
# my-app        latest    1.2GB   ← That's huge!
```

### Tips to reduce image size

```dockerfile
# 1. Use Alpine base images
FROM node:20-alpine           # 180 MB vs 1.1 GB

# 2. Multi-stage builds (shown in 05-dockerfile-guide.md)
FROM node:20 AS build
# ... build steps ...

FROM node:20-alpine AS production
COPY --from=build /app/dist ./dist

# 3. Only install production dependencies
RUN npm ci --only=production

# 4. Clean up in the same RUN layer
RUN apt-get update && \
    apt-get install -y some-package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 5. Use .dockerignore
```

---

## Security Best Practices

### Don't run as root

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "server.js"]
```

### Don't put secrets in images

```dockerfile
# BAD — secret is baked into the image
ENV DB_PASSWORD=supersecret

# GOOD — pass at runtime
# docker run -e DB_PASSWORD=supersecret my-app
# or use .env file in docker-compose
```

### Use specific image tags

```dockerfile
# BAD — could change any time
FROM node:latest

# GOOD — predictable
FROM node:20.11-alpine
```

### Scan images for vulnerabilities

```bash
docker scout cves my-app:latest   # Docker Scout (built into Docker Desktop)
```

---

## Disk Space Management

Docker can eat up your disk fast. Keep it clean.

```bash
# See what's using space
docker system df

# Output:
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          15        3         8.5GB     6.2GB (72%)
# Containers      5         2         150MB     100MB (66%)
# Build Cache     -         -         2.1GB     2.1GB
# Volumes         4         2         1.3GB     800MB (61%)

# Clean up unused stuff
docker system prune           # Remove stopped containers, unused networks, dangling images
docker system prune -a        # Also remove all unused images (not just dangling)
docker volume prune           # Remove unused volumes
docker builder prune          # Remove build cache
```

**Set up a routine:** Run `docker system prune -a` weekly if you're actively developing with Docker.

---

## Environment-Specific Tips

### Development Setup

```yaml
# docker-compose.yml (development)
services:
  backend:
    build: ./backend
    command: npx nodemon src/index.js   # Auto-restart on changes
    volumes:
      - ./backend/src:/app/src           # Live editing
      - /app/node_modules
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      DB_HOST: db

  frontend:
    build: ./frontend
    command: npm run dev                 # Vite/CRA dev server
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    ports:
      - "3000:3000"

  db:
    image: mysql:8
    ports:
      - "3306:3306"                     # Expose for local DB tools
    environment:
      MYSQL_ROOT_PASSWORD: devpassword
      MYSQL_DATABASE: myapp
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

### Production Setup

```yaml
# docker-compose.prod.yml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod        # Separate Dockerfile for production
    restart: always
    environment:
      NODE_ENV: production
    # No volume mounts (use built-in code)
    # No exposed ports if behind a reverse proxy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"                          # Serve via Nginx

  db:
    image: mysql:8
    restart: always
    # No port 3306 exposed to host in production!
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}  # From .env, never hardcoded
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

---

## Useful Docker Commands You Might Not Know

```bash
# See resource usage of running containers (like top)
docker stats

# See the history/layers of an image
docker history my-app:latest

# Save an image to a tar file (for sharing without a registry)
docker save my-app:latest > my-app.tar

# Load an image from a tar file
docker load < my-app.tar

# See real-time events (container start, stop, etc.)
docker events

# Copy files between host and container
docker cp my-container:/app/logs ./local-logs
docker cp ./config.json my-container:/app/config.json

# Run a temporary container that auto-removes itself
docker run --rm -it alpine sh
# Useful for quick testing — container disappears after you exit
```

---

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Forgetting `-d` flag | Container runs in foreground, blocking your terminal. Add `-d` for background. |
| Not using `.dockerignore` | `node_modules` gets copied into image, making it huge. Create `.dockerignore`. |
| Using `latest` tag | Builds become unpredictable. Use specific versions like `node:20-alpine`. |
| Database data lost | Forgot to use a volume. Always mount a named volume for databases. |
| "Connection refused" to database | Backend started before database was ready. Use healthchecks + `condition: service_healthy`. |
| "port already in use" | Another container or local process is using that port. Stop it or use a different host port. |
| Image too large | Use Alpine images, multi-stage builds, and `.dockerignore`. |
| Changes not reflecting | Not using bind mounts in development, or forgot `--build` flag after Dockerfile changes. |
| `npm install` runs every build | Copy `package.json` before source code in Dockerfile (layer caching). |
| Secrets in Dockerfile | Never put passwords in `ENV`. Pass them at runtime via `-e` or `.env` file. |

---

## What's Next?

You now have a solid understanding of Docker. When you're ready, we'll put it all together by **dockerizing a full-stack app** (React + Express + MySQL) from scratch.

That project will use everything from this guide:
- Writing Dockerfiles for frontend and backend
- Docker Compose to orchestrate all services
- Volumes for database persistence
- Networks for container communication
- Environment variables for configuration
- Health checks for reliability

Just say the word and we'll build it!
