# 3. Installing Docker

## Which Docker to Install?

There are two options:

| Option | What it is | Best for |
|--------|-----------|----------|
| **Docker Desktop** | GUI app + Docker Engine | Windows, Mac, beginners |
| **Docker Engine** | CLI only, no GUI | Linux servers, advanced users |

**Recommendation:** Install **Docker Desktop** — it gives you everything + a nice GUI to see your containers, images, volumes, etc.

---

## Installation by OS

### Linux (Ubuntu/Debian)

```bash
# Option 1: Docker Desktop (recommended for learning)
# Download .deb from: https://docs.docker.com/desktop/install/linux/

# Option 2: Docker Engine (CLI only)
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# (Optional) Run Docker without sudo
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

### macOS

1. Download **Docker Desktop** from: https://docs.docker.com/desktop/install/mac-install/
2. Choose Apple Silicon (.dmg) or Intel (.dmg) based on your Mac
3. Drag to Applications folder
4. Open Docker Desktop — it runs in the menu bar

### Windows

1. Download **Docker Desktop** from: https://docs.docker.com/desktop/install/windows-install/
2. Run the installer
3. Enable **WSL 2** backend when prompted (recommended over Hyper-V)
4. Restart your computer
5. Open Docker Desktop

---

## Verify Installation

After installing, open your terminal and run:

```bash
# Check Docker version
docker --version
# Output: Docker version 27.x.x, build xxxxxxx

# Check Docker Compose version
docker compose version
# Output: Docker Compose version v2.x.x

# Run a test container
docker run hello-world
```

If `docker run hello-world` prints a welcome message — you're all set!

**What just happened with `hello-world`?**

```
1. Docker looked for "hello-world" image locally → not found
2. Docker pulled it from Docker Hub → downloaded
3. Docker created a container from that image → started it
4. Container printed the welcome message → done
5. Container stopped (it finished its job)
```

---

## Docker Desktop Tour (Quick Overview)

Once Docker Desktop is running, you'll see:

- **Containers** tab — shows running and stopped containers
- **Images** tab — shows downloaded images
- **Volumes** tab — shows persistent storage volumes
- **Settings** — configure resources (CPU, Memory allocated to Docker)

You'll mostly work from the **terminal**, but Docker Desktop is great for:
- Quickly seeing what's running
- Viewing container logs
- Cleaning up old images/containers

---

## Next Up

Now the fun part — let's learn every important Docker command → [04-essential-commands.md](./04-essential-commands.md)
