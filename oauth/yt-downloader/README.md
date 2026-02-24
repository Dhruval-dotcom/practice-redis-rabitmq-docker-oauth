# Self-Hosted YouTube Downloader with MeTube

---

## What is Self-Hosting?

Self-hosting = running an app **on your own computer** instead of on someone else's server (like Vercel or Railway).

**Why it works for YouTube downloading:**
- Your home internet has a **residential IP** (YouTube doesn't block these)
- Cloud servers have **datacenter IPs** (YouTube blocks these)
- You have full control, no platform TOS issues

**What you need:**
- Your computer (you're on Linux, perfect)
- Docker installed
- Internet connection
- That's it

---

## What is MeTube?

MeTube is a **web-based YouTube downloader** you run on your own machine.

- Clean web UI - paste a link, click download
- Powered by **yt-dlp** (the best YouTube downloading tool)
- Supports **1000+ sites** (YouTube, Instagram, Twitter, Reddit, TikTok, etc.)
- Supports playlists and full channels
- Runs in Docker (one command setup)
- Open source, free forever

```
+----------------------------------------------+
|  MeTube                    http://localhost   |
|----------------------------------------------|
|                                               |
|  [ Paste YouTube URL here...            ] [+] |
|                                               |
|  Quality: [Best ▼]    Format: [Video ▼]      |
|                                               |
|  Downloads:                                   |
|  ✓ Song Name - Artist           720p    Done  |
|  ↓ Tutorial Video               1080p    63%  |
|  ⏳ Playlist (12 videos)         720p   Queue  |
|                                               |
+----------------------------------------------+
```

---

## Step 1: Install Docker

Docker runs apps in isolated containers. Think of it as a mini-computer inside your computer.

### Check if Docker is already installed

```bash
docker --version
```

If you see a version number, skip to Step 2.

### Install Docker on Ubuntu/Linux

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose-v2 -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add yourself to docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER

# IMPORTANT: Log out and log back in for group change to take effect
# Or run this to apply immediately in current terminal:
newgrp docker
```

### Verify Docker works

```bash
docker run hello-world
```

You should see "Hello from Docker!" message.

---

## Step 2: Create a Downloads Folder

MeTube needs a folder to save downloaded videos.

```bash
# Create a folder for downloads
mkdir -p ~/Downloads/YouTube
```

---

## Step 3: Run MeTube (One Command)

```bash
docker run -d \
  --name metube \
  --restart unless-stopped \
  -p 8081:8081 \
  -v ~/Downloads/YouTube:/downloads \
  -e DEFAULT_THEME=dark \
  ghcr.io/alexta69/metube
```

**What each part means:**

| Part | Meaning |
|------|---------|
| `docker run -d` | Run in background |
| `--name metube` | Name the container "metube" |
| `--restart unless-stopped` | Auto-restart if it crashes or PC reboots |
| `-p 8081:8081` | Make it accessible on port 8081 |
| `-v ~/Downloads/YouTube:/downloads` | Save downloads to your ~/Downloads/YouTube folder |
| `-e DEFAULT_THEME=dark` | Dark mode |
| `ghcr.io/alexta69/metube` | The MeTube image |

---

## Step 4: Open and Use

1. Open your browser
2. Go to **http://localhost:8081**
3. Paste a YouTube URL
4. Pick quality (Best, 1080p, 720p, etc.)
5. Click the **+** button
6. Video downloads to `~/Downloads/YouTube/`

Done. That's it.

---

## Step 5 (Optional): Better Setup with Docker Compose

Docker Compose lets you configure everything in a file instead of a long command.

### Create the config file

```bash
mkdir -p ~/metube && cd ~/metube
```

Create a file called `docker-compose.yml`:

```yaml
services:
  metube:
    image: ghcr.io/alexta69/metube
    container_name: metube
    restart: unless-stopped
    ports:
      - "8081:8081"
    volumes:
      - ~/Downloads/YouTube/Videos:/downloads
      - ~/Downloads/YouTube/Audio:/audio_downloads
    environment:
      # Theme
      DEFAULT_THEME: dark

      # Separate folder for audio downloads
      AUDIO_DOWNLOAD_DIR: /audio_downloads

      # Max simultaneous downloads
      MAX_CONCURRENT_DOWNLOADS: 3

      # Allow creating subfolders from UI
      CUSTOM_DIRS: "true"

      # Delete files from disk when trashed in UI
      DELETE_FILE_ON_TRASHCAN: "true"

      # Clean filenames
      OUTPUT_TEMPLATE: "%(title)s.%(ext)s"

      # Playlist downloads go into their own folder
      OUTPUT_TEMPLATE_PLAYLIST: "%(playlist_title)s/%(title)s.%(ext)s"

      # Channel downloads go into channel-named folder
      OUTPUT_TEMPLATE_CHANNEL: "%(channel)s/%(title)s.%(ext)s"
```

### Run it

```bash
cd ~/metube
docker compose up -d
```

### Stop it

```bash
cd ~/metube
docker compose down
```

### Update to latest version

```bash
cd ~/metube
docker compose pull
docker compose up -d
```

---

## Quality Options in the UI

### Video

| Option | What You Get |
|--------|-------------|
| **Best** | Highest quality available (may be .webm or .mkv) |
| **Best (iOS)** | Highest quality in .mp4 (h264 + AAC, plays everywhere) |
| **1440p** | 2K resolution |
| **1080p** | Full HD |
| **720p** | HD |
| **480p** | Standard |

### Audio Only

| Option | What You Get |
|--------|-------------|
| **Best Audio** | Highest quality audio |
| **MP3** | Universal audio format |
| **M4A** | Apple-friendly format |
| **Opus** | Smallest file, great quality |
| **WAV** | Uncompressed (large files) |
| **FLAC** | Lossless compression |

**Tip**: Use "Best (iOS)" for video if you want .mp4 files that play on any device.

---

## Supported Sites (Not Just YouTube)

MeTube downloads from **1000+ sites** including:

| Site | Works? |
|------|--------|
| YouTube (videos, shorts, playlists, channels) | Yes |
| Instagram (reels, posts) | Yes |
| Twitter / X | Yes |
| Reddit (videos) | Yes |
| TikTok | Yes |
| Vimeo | Yes |
| Twitch (clips, VODs) | Yes |
| SoundCloud | Yes |
| Facebook | Yes |
| Dailymotion | Yes |
| Bandcamp | Yes |

Full list: [yt-dlp supported sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

---

## Browser Extension (One-Click Downloads)

Instead of copy-pasting URLs, install the browser extension:

### Chrome / Brave / Edge
1. Install from [Chrome Web Store](https://chrome.google.com/webstore) - search "MeTube"
2. Click the extension icon
3. Set your MeTube URL: `http://localhost:8081`
4. Now right-click any video page > "Send to MeTube"

### Firefox
1. Install from [Firefox Add-ons](https://addons.mozilla.org) - search "MeTube"
2. Same setup - point it to `http://localhost:8081`

### Bookmarklet (Works in Any Browser)
Create a bookmark with this as the URL:

```javascript
javascript:void(open('http://localhost:8081/add?url='+encodeURIComponent(location.href)))
```

Click the bookmark on any video page and it gets added to MeTube's queue.

---

## Troubleshooting

### "403 Forbidden" errors

YouTube periodically changes its anti-bot measures. Fixes:

**1. Update MeTube (most common fix):**
```bash
docker pull ghcr.io/alexta69/metube
docker stop metube && docker rm metube
# Then run the docker run command from Step 3 again
```

Or with Docker Compose:
```bash
cd ~/metube
docker compose pull && docker compose up -d
```

**2. Use browser cookies (for stubborn videos):**

Some videos (age-restricted, members-only) need your YouTube login cookies.

a. Install "Get cookies.txt" browser extension
b. Go to youtube.com while logged in
c. Export cookies to `cookies.txt`
d. Place the file somewhere accessible:
```bash
mkdir -p ~/metube/cookies
mv cookies.txt ~/metube/cookies/
```
e. Add to your docker run command:
```bash
-v ~/metube/cookies:/cookies \
-e YTDL_OPTIONS='{"cookiefile": "/cookies/cookies.txt"}'
```

Or in docker-compose.yml:
```yaml
volumes:
  - ~/metube/cookies:/cookies
environment:
  YTDL_OPTIONS: '{"cookiefile": "/cookies/cookies.txt"}'
```

### Permission denied on downloads folder

```bash
# Fix ownership
sudo chown -R $USER:$USER ~/Downloads/YouTube
```

Or add user ID to the container:
```bash
-e PUID=$(id -u) -e PGID=$(id -g)
```

### Port 8081 already in use

Change the port:
```bash
-p 9090:8081    # Now access at http://localhost:9090
```

### Container won't start

```bash
# Check logs
docker logs metube

# Remove and recreate
docker rm -f metube
# Run the docker run command again
```

### "Best" quality downloads as .webm (can't play on phone)

Use "Best (iOS)" quality in the UI instead. This forces .mp4 with h264 video.

Or set it as default in docker-compose.yml:
```yaml
environment:
  YTDL_OPTIONS: '{"format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"}'
```

---

## Useful Commands

```bash
# Check if MeTube is running
docker ps

# View logs (live)
docker logs -f metube

# Stop MeTube
docker stop metube

# Start MeTube
docker start metube

# Restart MeTube
docker restart metube

# Remove MeTube completely
docker rm -f metube

# Update MeTube
docker pull ghcr.io/alexta69/metube
docker rm -f metube
# Then run the docker run command again
```

---

## All Configuration Options

For advanced users. Set these as `-e KEY=VALUE` in docker run or in docker-compose.yml.

### Directories

| Variable | Default | What It Does |
|----------|---------|-------------|
| `DOWNLOAD_DIR` | `/downloads` | Where videos are saved |
| `AUDIO_DOWNLOAD_DIR` | same as above | Separate folder for audio downloads |
| `TEMP_DIR` | `/downloads` | Temp files during download |
| `CUSTOM_DIRS` | `true` | Allow subdirectory selection in UI |

### Behavior

| Variable | Default | What It Does |
|----------|---------|-------------|
| `MAX_CONCURRENT_DOWNLOADS` | `3` | How many downloads run at once |
| `DELETE_FILE_ON_TRASHCAN` | `false` | Actually delete files when trashed in UI |
| `DEFAULT_THEME` | `auto` | `light`, `dark`, or `auto` |

### Output Templates

| Variable | Default | What It Does |
|----------|---------|-------------|
| `OUTPUT_TEMPLATE` | `%(title)s.%(ext)s` | Filename format for single videos |
| `OUTPUT_TEMPLATE_PLAYLIST` | `%(playlist_title)s/%(title)s.%(ext)s` | Filename format for playlists |
| `OUTPUT_TEMPLATE_CHANNEL` | `%(channel)s/%(title)s.%(ext)s` | Filename format for channels |

### yt-dlp Options

| Variable | Default | What It Does |
|----------|---------|-------------|
| `YTDL_OPTIONS` | (none) | JSON string of extra yt-dlp options |
| `YTDL_OPTIONS_FILE` | (none) | Path to JSON file with yt-dlp options |

### Server

| Variable | Default | What It Does |
|----------|---------|-------------|
| `PORT` | `8081` | Web UI port |
| `URL_PREFIX` | `/` | Base path (for reverse proxy) |
| `LOGLEVEL` | `INFO` | Log verbosity |

---

## Summary

| What | Answer |
|------|--------|
| **Cost** | Free forever |
| **Difficulty** | One command to set up |
| **Works with YouTube?** | Yes (residential IP = no blocking) |
| **Other sites?** | 1000+ sites |
| **Playlists?** | Yes |
| **Full channels?** | Yes |
| **Audio only?** | Yes (MP3, FLAC, etc.) |
| **Updates?** | `docker pull` + restart |
| **Access from phone?** | Yes, via `http://YOUR-PC-IP:8081` on same WiFi |

---

## Links

- [MeTube GitHub](https://github.com/alexta69/metube)
- [yt-dlp Supported Sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
- [MeTube Chrome Extension](https://github.com/Rpsl/metube-browser-extension)
- [MeTube Firefox Extension](https://github.com/nanocortex/metube-firefox-addon)
