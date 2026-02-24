# 1. What is Docker?

## The Problem Docker Solves

You've probably heard this before:

> "It works on my machine!" 🤷

Imagine this scenario:
- You build a Node.js app on your laptop (Node v20, MySQL 8, Ubuntu)
- Your teammate tries to run it (Node v18, MySQL 5.7, Windows)
- It breaks. Different versions, different OS, different configs.
- You deploy to a server — it breaks again for different reasons.

**Docker solves this by packaging your app + its entire environment into a box** that runs the same way everywhere.

## What Docker Actually Is

Docker is a tool that lets you **package your application along with everything it needs** (OS, libraries, dependencies, configs) into a single unit called a **container**.

Think of it like this:

```
Without Docker:
  Your app needs → Node.js 20 + MySQL 8 + Redis + specific OS libraries
  Every machine has to install all of these manually
  Version conflicts, missing packages, "works on my machine" problems

With Docker:
  Your app + Node.js 20 + MySQL 8 + Redis + everything
  = One package (container)
  = Runs identically on ANY machine that has Docker installed
```

## Real-Life Analogy

Think of **shipping containers** (the metal boxes on cargo ships):

- Before shipping containers: Every port had different loading methods, items were loose, things broke
- After shipping containers: Standard box, fits on any ship/truck/train, contents stay safe

Docker does the same thing for software:
- **Standard container** that works on any machine
- **Everything inside** is isolated and self-contained
- **Doesn't matter** what's on the host machine

## Docker vs Virtual Machines (VMs)

You might think: "Isn't this what VMs do?"

Sort of, but Docker is much lighter:

```
Virtual Machine:
┌─────────────────────┐
│   Your App          │
│   Libraries         │
│   Full Guest OS     │  ← Entire operating system (heavy, GBs of space)
│   Hypervisor        │
│   Host OS           │
│   Hardware          │
└─────────────────────┘

Docker Container:
┌─────────────────────┐
│   Your App          │
│   Libraries         │
│   Docker Engine     │  ← Shares the host OS kernel (light, MBs of space)
│   Host OS           │
│   Hardware          │
└─────────────────────┘
```

| Feature | VM | Docker Container |
|---------|-----|-----------------|
| Size | GBs (full OS) | MBs (just your app) |
| Startup time | Minutes | Seconds |
| Resource usage | Heavy | Lightweight |
| Isolation | Full OS isolation | Process-level isolation |
| Use case | Running different OS | Running different apps |

## Key Takeaway

Docker = **"Package once, run anywhere"**

Your app, its dependencies, its configuration — all bundled together. Whether it's your laptop, your friend's laptop, a staging server, or AWS production — it runs the **exact same way**.

## Next Up

Now that you know WHY Docker exists, let's learn the core building blocks → [02-core-concepts.md](./02-core-concepts.md)
