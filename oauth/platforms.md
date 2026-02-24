# OAuth Platforms & Providers

A complete guide to who offers OAuth, what's free, and how to pick one.

---

## Two Types of Providers

### 1. Identity Providers (Login Buttons)

These let users log into YOUR app using THEIR existing account.

> "Login with Google" / "Login with GitHub"

You register your app, get a client ID, and redirect users to their login page.

### 2. Auth-as-a-Service (Full Auth Solutions)

These handle the entire auth system for you - login pages, user management, tokens, sessions.

> Auth0, Firebase Auth, Supabase Auth, Clerk

You don't build login pages. They provide everything.

---

## Identity Providers (Free to Use)

All major identity providers are **free** - you don't pay them to add "Login with X" to your app.

### Google OAuth

| Detail | Info |
|--------|------|
| **Cost** | Free (unlimited) |
| **Scopes** | email, profile, Drive, Calendar, YouTube, Gmail, 100+ APIs |
| **Setup** | [Google Cloud Console](https://console.cloud.google.com/) |
| **Best for** | Consumer apps, anything needing Google API access |
| **Users** | Billions of Google accounts |

**Steps to set up:**
1. Go to Google Cloud Console
2. Create a project
3. Go to "APIs & Services" > "Credentials"
4. Create "OAuth 2.0 Client ID"
5. Set authorized redirect URIs
6. Get your `client_id` and `client_secret`

---

### GitHub OAuth

| Detail | Info |
|--------|------|
| **Cost** | Free (unlimited) |
| **Scopes** | user, repo, gist, notifications, admin, etc. |
| **Setup** | [GitHub Developer Settings](https://github.com/settings/developers) |
| **Best for** | Developer tools, open source projects |
| **Users** | 100M+ developers |

**Steps to set up:**
1. Go to GitHub > Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in app name, homepage URL, callback URL
4. Get your `client_id` and `client_secret`

---

### Microsoft / Azure AD

| Detail | Info |
|--------|------|
| **Cost** | Free for basic; Azure AD premium starts at $6/user/month |
| **Scopes** | User profile, Outlook, OneDrive, Teams, SharePoint |
| **Setup** | [Azure Portal](https://portal.azure.com/) |
| **Best for** | Enterprise apps, Microsoft 365 integration |
| **Users** | 1B+ Microsoft accounts |

---

### Apple Sign In

| Detail | Info |
|--------|------|
| **Cost** | Free (requires Apple Developer account - $99/year) |
| **Scopes** | name, email (with option to hide real email) |
| **Setup** | [Apple Developer Portal](https://developer.apple.com/) |
| **Best for** | iOS apps (Apple requires it if you offer any social login) |
| **Users** | 2B+ Apple devices |

**Note**: If your iOS app has "Login with Google", Apple REQUIRES you to also offer "Sign in with Apple".

---

### Facebook / Meta

| Detail | Info |
|--------|------|
| **Cost** | Free |
| **Scopes** | email, public_profile, pages, instagram, ads |
| **Setup** | [Meta for Developers](https://developers.facebook.com/) |
| **Best for** | Consumer/social apps, marketing tools |
| **Users** | 3B+ Facebook accounts |

---

### Twitter / X

| Detail | Info |
|--------|------|
| **Cost** | Free tier: 100 requests/month. Basic ($100/month) for more |
| **Scopes** | tweet.read, users.read, follows, likes |
| **Setup** | [Twitter Developer Portal](https://developer.twitter.com/) |
| **Best for** | Social media tools, content apps |
| **Note** | Moved to OAuth 2.0 with PKCE in 2023 |

---

### LinkedIn

| Detail | Info |
|--------|------|
| **Cost** | Free for basic profile. Some APIs require partnership |
| **Scopes** | openid, profile, email, w_member_social |
| **Setup** | [LinkedIn Developers](https://developer.linkedin.com/) |
| **Best for** | Professional/B2B apps, recruiting tools |

---

### Discord

| Detail | Info |
|--------|------|
| **Cost** | Free (unlimited) |
| **Scopes** | identify, email, guilds, messages.read |
| **Setup** | [Discord Developer Portal](https://discord.com/developers/) |
| **Best for** | Gaming, community apps, bots |
| **Users** | 200M+ monthly active users |

---

### Spotify

| Detail | Info |
|--------|------|
| **Cost** | Free |
| **Scopes** | user-read-email, playlist-modify, streaming, etc. |
| **Setup** | [Spotify Developer Dashboard](https://developer.spotify.com/) |
| **Best for** | Music apps, playlist tools |

---

### Twitch

| Detail | Info |
|--------|------|
| **Cost** | Free |
| **Scopes** | user:read:email, channel:read, chat:read |
| **Setup** | [Twitch Developer Console](https://dev.twitch.tv/console) |
| **Best for** | Streaming tools, gaming apps |

---

## Auth-as-a-Service Platforms

These handle your entire authentication system. You integrate their SDK, and they give you login pages, user management, tokens, etc.

---

### Auth0 (by Okta)

| Detail | Info |
|--------|------|
| **Free tier** | 25,000 monthly active users |
| **Paid** | Starts at ~$35/month |
| **Features** | Social login, email/password, MFA, roles, RBAC |
| **SDKs** | React, Next.js, Vue, Angular, Node, Python, Java, etc. |
| **Best for** | Startups to enterprise, most flexible option |

**Pros**: Very feature-rich, great docs, lots of integrations
**Cons**: Can get expensive at scale, vendor lock-in

---

### Firebase Authentication (by Google)

| Detail | Info |
|--------|------|
| **Free tier** | 50,000 MAU (phone auth: 10K verifications/month) |
| **Paid** | Pay-as-you-go after free tier |
| **Features** | Email, phone, social login, anonymous auth |
| **SDKs** | Web, iOS, Android, Flutter, Unity |
| **Best for** | Mobile apps, startups, prototypes |

**Pros**: Generous free tier, great mobile SDKs, integrates with Firebase ecosystem
**Cons**: Tied to Google ecosystem, limited customization

---

### Supabase Auth

| Detail | Info |
|--------|------|
| **Free tier** | 50,000 MAU |
| **Paid** | $25/month (Pro) |
| **Features** | Email, social login, phone, MFA, row-level security |
| **SDKs** | JavaScript, Flutter, Swift, Kotlin |
| **Best for** | Open source projects, Postgres lovers |

**Pros**: Open source, self-hostable, Postgres integration, generous free tier
**Cons**: Newer than Auth0, smaller ecosystem

---

### Clerk

| Detail | Info |
|--------|------|
| **Free tier** | 10,000 MAU |
| **Paid** | $25/month |
| **Features** | Beautiful pre-built UI, user management, organizations |
| **SDKs** | React, Next.js, Remix, Expo |
| **Best for** | React/Next.js apps that want beautiful auth UI fast |

**Pros**: Best-looking pre-built components, great DX
**Cons**: React-focused, newer platform

---

### Keycloak

| Detail | Info |
|--------|------|
| **Cost** | Free and open source (self-hosted) |
| **Features** | SSO, identity brokering, LDAP, social login, admin console |
| **Best for** | Enterprise, self-hosted requirements, full control |

**Pros**: Completely free, open source, enterprise-grade
**Cons**: Must self-host, complex to set up, needs infrastructure

---

### Amazon Cognito

| Detail | Info |
|--------|------|
| **Free tier** | 50,000 MAU |
| **Paid** | $0.0055 per MAU after free tier |
| **Features** | User pools, identity pools, social login, MFA |
| **SDKs** | Amplify (Web, iOS, Android) |
| **Best for** | AWS-based apps |

**Pros**: Cheap at scale, deep AWS integration
**Cons**: Complex setup, AWS-specific, confusing docs

---

## Comparison: Which Should You Pick?

### By Use Case

| I want to... | Use |
|--------------|-----|
| Add "Login with Google" to my app | Google OAuth (free) |
| Build a developer tool | GitHub OAuth (free) |
| Not build auth at all | Auth0 or Clerk |
| Build a mobile app quickly | Firebase Auth |
| Use open source everything | Supabase Auth or Keycloak |
| Build enterprise software | Auth0 or Keycloak |
| Minimize cost at scale | Cognito or Keycloak (self-hosted) |

### By App Size

| App Size | Recommendation |
|----------|---------------|
| **Side project / learning** | Firebase Auth or Supabase Auth (free, easy) |
| **Startup (< 10K users)** | Clerk or Auth0 free tier |
| **Growing app (10K-100K)** | Auth0, Supabase, or Firebase |
| **Enterprise (100K+)** | Auth0, Keycloak, or Cognito |

### By Framework

| Framework | Best Auth Options |
|-----------|------------------|
| **Next.js** | Clerk, Auth0, NextAuth.js (free library) |
| **React** | Clerk, Auth0, Firebase |
| **Vue** | Auth0, Supabase, Firebase |
| **React Native** | Firebase, Auth0, Clerk |
| **Flutter** | Firebase, Supabase |
| **Node.js backend** | Passport.js (free library), Auth0 |

---

## Free Libraries (DIY Approach)

If you want full control and don't want a service:

| Library | Language | What It Does |
|---------|----------|-------------|
| **NextAuth.js / Auth.js** | JavaScript | Complete auth for Next.js/SvelteKit/etc. Free, open source |
| **Passport.js** | Node.js | Authentication middleware. 500+ strategies. Free |
| **Spring Security** | Java | Enterprise auth framework. Free |
| **Django-allauth** | Python | Social auth for Django. Free |
| **Devise + OmniAuth** | Ruby | Auth for Rails. Free |
| **Laravel Socialite** | PHP | Social auth for Laravel. Free |
| **Arctic** | TypeScript | OAuth 2.0 client library by Lucia. Lightweight, free |

These are **libraries**, not services. You write more code, but you have full control and zero cost.

---

## Popularity Rankings (2024-2025)

Based on usage, job postings, and community activity:

### Most Used Identity Providers
1. Google OAuth (dominant)
2. Apple Sign In (required for iOS)
3. Facebook Login
4. GitHub OAuth (developer space)
5. Microsoft OAuth (enterprise)

### Most Used Auth Services
1. Auth0 (market leader)
2. Firebase Auth (mobile leader)
3. AWS Cognito (AWS shops)
4. Clerk (fastest growing)
5. Supabase Auth (open source leader)

### Most Used Libraries
1. NextAuth.js / Auth.js
2. Passport.js
3. Spring Security (Java)

---

Next: [Implementation Guide](./implementation.md)
