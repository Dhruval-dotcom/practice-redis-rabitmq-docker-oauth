# OAuth - The Complete Guide

A beginner-friendly, step-by-step guide to understanding OAuth.

---

## What is OAuth?

OAuth stands for **Open Authorization**. It is a standard that lets you give apps **limited access** to your data on another service **without sharing your password**.

### Real-Life Analogy

Think of a hotel key card:
- You check in at the front desk (authorize)
- You get a key card (token) that opens only your room
- The card expires when you check out
- You never gave anyone the master key to the hotel

That's exactly what OAuth does for websites and apps.

---

## Why Was OAuth Created?

### The Problem (Before OAuth)

1. You want App A to access your data on Service B
2. App A asks for your Service B **username and password**
3. You hand over your actual credentials
4. App A now has **full access** to everything on Service B
5. If App A gets hacked, your Service B account is compromised

### The Solution (With OAuth)

1. You want App A to access your data on Service B
2. App A redirects you to Service B's login page
3. You log in directly on Service B (App A never sees your password)
4. Service B asks: "App A wants to access your photos. Allow?"
5. You click "Allow"
6. Service B gives App A a **limited token** (not your password)
7. App A uses that token to access only what you approved

---

## Why Use OAuth? (Advantages)

| Advantage | Explanation |
|-----------|-------------|
| **No password sharing** | Third-party apps never see your password |
| **Limited access** | You control exactly what data an app can access (scopes) |
| **Revocable** | You can remove an app's access anytime without changing your password |
| **Time-limited** | Tokens expire, reducing risk if stolen |
| **Industry standard** | Used by Google, Facebook, GitHub, Microsoft, and thousands more |
| **Single Sign-On (SSO)** | "Login with Google" - one account, many apps |
| **Reduced liability** | Developers don't need to store user passwords |
| **Better UX** | Users click one button instead of filling registration forms |

---

## OAuth 1.0 vs OAuth 2.0

See detailed breakdowns:
- [OAuth 1.0 Explained](./oauth-1.0.md)
- [OAuth 2.0 Explained](./oauth-2.0.md)

### Quick Comparison

| Feature | OAuth 1.0 | OAuth 2.0 |
|---------|-----------|-----------|
| **Released** | 2007 | 2012 |
| **Complexity** | Hard (cryptographic signatures) | Easy (uses HTTPS + tokens) |
| **Security method** | Signatures on every request | SSL/TLS (HTTPS) |
| **Token types** | One token type | Access token + Refresh token |
| **Mobile support** | Poor | Built for mobile + web + desktop |
| **Status today** | Mostly dead | Industry standard |
| **Used by** | Twitter (legacy) | Google, GitHub, Facebook, etc. |

---

## OAuth Providers & Platforms

See the full comparison: [OAuth Platforms Guide](./platforms.md)

### Most Popular (All Free to Start)

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Google** | Unlimited for basic | Login with Google, Gmail/Drive access |
| **GitHub** | Unlimited | Developer tools, open source apps |
| **Auth0** | 25,000 users free | Full auth solution, enterprise apps |
| **Firebase Auth** | 50,000 MAU free | Mobile apps, startups |
| **Supabase Auth** | 50,000 MAU free | Open source alternative to Firebase |

---

## How OAuth 2.0 Works (Step by Step)

```
YOU          YOUR APP        GOOGLE (Provider)
 |               |                |
 |--Click Login->|                |
 |               |--Redirect----->|
 |               |                |
 |<---Google Login Page-----------|
 |               |                |
 |---Enter credentials----------->|
 |               |                |
 |<--"App wants access. Allow?"---|
 |               |                |
 |---Click "Allow"--------------->|
 |               |                |
 |               |<--Auth Code----|
 |               |                |
 |               |--Exchange code->|
 |               |  for token      |
 |               |                |
 |               |<--Access Token--|
 |               |                |
 |               |--Use token to-->|
 |               |  fetch user data|
 |               |                |
 |<--Logged in!--|                |
```

---

## Key Terms (Glossary)

| Term | Simple Meaning |
|------|---------------|
| **Resource Owner** | You (the user) |
| **Client** | The app that wants access |
| **Authorization Server** | The service that handles login (Google, GitHub, etc.) |
| **Resource Server** | The API that holds your data |
| **Access Token** | A short-lived key that lets the app access your data |
| **Refresh Token** | A long-lived key used to get new access tokens |
| **Scope** | What permissions the app is asking for (e.g., "read emails") |
| **Redirect URI** | Where the user goes after approving/denying access |
| **Authorization Code** | A one-time code exchanged for tokens |
| **Grant Type** | The method used to get tokens (there are 4 types) |

---

## Guide Structure

| File | What It Covers |
|------|---------------|
| [README.md](./README.md) | This file - overview and quick reference |
| [oauth-1.0.md](./oauth-1.0.md) | OAuth 1.0 history, how it worked, why it died |
| [oauth-2.0.md](./oauth-2.0.md) | OAuth 2.0 deep dive - grant types, tokens, flows |
| [google-scopes.md](./google-scopes.md) | Google OAuth scopes - every scope explained, verification, best practices |
| [platforms.md](./platforms.md) | All major OAuth providers, free tiers, how to pick one |
| [implementation.md](./implementation.md) | Practical guide to implementing OAuth in your app |

---

## Quick Start

If you just want to add "Login with Google/GitHub" to your app:

1. Read the [OAuth 2.0 guide](./oauth-2.0.md) to understand the flow
2. Pick a provider from the [Platforms guide](./platforms.md)
3. Follow the [Implementation guide](./implementation.md) for code examples

---
