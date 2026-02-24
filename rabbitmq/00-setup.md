# RabbitMQ - Learning Guide

## What is RabbitMQ?

Think of RabbitMQ as a **post office for your applications**. Instead of apps talking directly to each other, they send messages through RabbitMQ.

**Simple example:**

- **Without RabbitMQ:** Your app sends an email directly → if email server is slow, your app freezes waiting
- **With RabbitMQ:** Your app drops a message "send this email" into RabbitMQ → your app continues working → another worker picks up the message and sends the email whenever ready

---

## Why Use It? (Advantages)

1. **Decoupling** - Apps don't need to know about each other. They just send/receive messages.
2. **Reliability** - If a worker crashes, the message stays in the queue. No data lost.
3. **Scalability** - Too many orders? Add more workers to process them. No code changes needed.
4. **Speed** - Your API responds instantly ("got it!") instead of waiting for slow tasks to finish.
5. **Load balancing** - Multiple workers automatically share the work evenly.

**Real-world uses:** Order processing, email sending, image resizing, notifications, data syncing between microservices.

---

## Key Concepts (Simple Terms)

```
Producer  →  Exchange  →  Queue  →  Consumer
(sender)     (router)     (mailbox)  (receiver)
```

| Term         | Meaning                                          |
| ------------ | ------------------------------------------------ |
| **Producer** | The app that sends messages                      |
| **Queue**    | A mailbox where messages wait                    |
| **Consumer** | The app that reads and processes messages         |
| **Exchange** | A router that decides which queue gets the message |

---

## Setup (Ubuntu)

### Install RabbitMQ

```bash
sudo apt-get update
sudo apt-get install -y curl gnupg apt-transport-https

# Add signing keys
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor -o /usr/share/keyrings/com.rabbitmq.team.gpg
curl -1sLf "https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key" | sudo gpg --dearmor -o /usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg
curl -1sLf "https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key" | sudo gpg --dearmor -o /usr/share/keyrings/rabbitmq.9F4587F226208342.gpg

# Install Erlang + RabbitMQ
sudo apt-get update
sudo apt-get install -y erlang-base erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key erlang-runtime-tools erlang-snmp erlang-ssl erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl
sudo apt-get install -y rabbitmq-server

# Start and enable
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server

# Enable web dashboard
sudo rabbitmq-plugins enable rabbitmq_management
```

### Access Dashboard

- **URL:** http://localhost:15672
- **Username:** `guest`
- **Password:** `guest`

---

## Quick Test

```bash
# Terminal 1 - Start listener
npm run receive

# Terminal 2 - Send a message
npm run send
```

---

## Project Files

| File         | Purpose                                     |
| ------------ | ------------------------------------------- |
| `send.js`    | Producer - sends a message to "hello" queue |
| `receive.js` | Consumer - listens and prints messages      |
