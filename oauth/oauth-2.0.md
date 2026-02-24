# OAuth 2.0 - The Current Standard

---

## What Changed from 1.0?

| What | OAuth 1.0 | OAuth 2.0 |
|------|-----------|-----------|
| Security | Cryptographic signatures | Just use HTTPS |
| Complexity | Very hard to implement | Much simpler |
| Token types | Single token | Access token + Refresh token |
| Token lifetime | Never expires | Access token expires (minutes/hours) |
| Platforms | Web only | Web, mobile, desktop, IoT, servers |
| Specification | One rigid flow | Multiple flows (grant types) for different use cases |

---

## The 4 Grant Types (Flows)

OAuth 2.0 has 4 ways to get tokens. Each is designed for a different situation.

---

### 1. Authorization Code Grant (Most Common)

**Use when**: You have a web app with a backend server

**This is the standard "Login with Google" flow.**

```
Step 1: User clicks "Login with Google"
Step 2: Browser redirects to Google's login page
Step 3: User logs in and clicks "Allow"
Step 4: Google redirects back to your app with a CODE
Step 5: Your SERVER sends the code to Google (secret exchange)
Step 6: Google sends back an ACCESS TOKEN
Step 7: Your server uses the token to get user info
```

**Why the extra "code" step?**
- The code is exchanged server-to-server (never exposed to browser)
- Even if someone intercepts the code, they can't use it without your app's secret key
- This is the most secure flow

**Example URL (Step 2):**
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_APP_ID
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=email profile
  &state=random_string_for_security
```

---

### 2. Authorization Code + PKCE (For Mobile/SPAs)

**Use when**: You have a mobile app or single-page app (no backend secret)

PKCE = **Proof Key for Code Exchange** (pronounced "pixy")

**The problem**: Mobile apps and SPAs can't keep a secret (code is visible to users). So anyone could steal the authorization code and exchange it for tokens.

**PKCE solution**: Your app creates a random secret for each login attempt.

```
Step 1: App generates a random "code_verifier" (e.g., "dBjftJeZ4CVP...")
Step 2: App hashes it to create "code_challenge"
Step 3: App sends code_challenge when requesting authorization
Step 4: Google gives back an authorization code
Step 5: App sends the original code_verifier when exchanging the code
Step 6: Google hashes the verifier and checks it matches the challenge
Step 7: If it matches, Google sends the access token
```

**Why this works**: Even if someone steals the authorization code, they don't have the original code_verifier, so they can't exchange it.

**This is now the RECOMMENDED flow for ALL apps** (even those with backends).

---

### 3. Client Credentials Grant

**Use when**: Server-to-server communication (no user involved)

```
Step 1: Your server sends its client_id + client_secret to the provider
Step 2: Provider sends back an access token
Step 3: Your server uses the token to access the API
```

**Examples**:
- Your backend fetching data from another API
- A cron job accessing cloud services
- Microservice-to-microservice communication

**No user is involved** - the app accesses its own resources or public data.

---

### 4. Device Code Grant

**Use when**: The device has no browser or limited input (TV, CLI, IoT)

```
Step 1: Device asks provider for a device code
Step 2: Provider returns a code and a URL
Step 3: Device shows: "Go to https://google.com/device and enter code: ABCD-1234"
Step 4: User opens the URL on their phone/laptop
Step 5: User enters the code and logs in
Step 6: Device keeps polling the provider: "Has the user approved yet?"
Step 7: Once approved, provider sends access token to the device
```

**Examples**:
- Logging into YouTube on a Smart TV
- GitHub CLI authentication
- Spotify on game consoles

---

### Deprecated Flows (DO NOT USE)

| Flow | Why Deprecated |
|------|---------------|
| **Implicit Grant** | Token exposed in URL fragment. Insecure. Use PKCE instead. |
| **Resource Owner Password** | App collects username/password directly. Defeats the purpose of OAuth. |

---

## Tokens Explained

### Access Token

- **What**: A string that proves your app has permission
- **Lifetime**: Short (5 minutes to 1 hour typically)
- **Format**: Usually a JWT (JSON Web Token) or opaque string
- **Used in**: Every API request as a header

```
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token

- **What**: A long-lived token used to get new access tokens
- **Lifetime**: Days to months (e.g., 7 days, 90 days)
- **Security**: Stored securely, never sent to APIs
- **Used when**: Access token expires

```
POST /oauth/token
grant_type=refresh_token
&refresh_token=YOUR_REFRESH_TOKEN
&client_id=YOUR_APP_ID
```

### Token Lifecycle

```
Login
  |
  v
Get Access Token (expires in 1 hour) + Refresh Token (expires in 30 days)
  |
  v
Use Access Token for API calls
  |
  v
Access Token expires after 1 hour
  |
  v
Use Refresh Token to get a NEW Access Token (no user interaction needed)
  |
  v
Repeat until Refresh Token expires (30 days)
  |
  v
User must log in again
```

---

## Scopes - Controlling Access

Scopes define **what** an app can access. The user sees these during authorization.

### Examples

| Provider | Scope | What It Allows |
|----------|-------|---------------|
| Google | `email` | Read user's email address |
| Google | `drive.readonly` | Read Google Drive files (not write) |
| GitHub | `repo` | Full access to repositories |
| GitHub | `read:user` | Read user profile info |
| Spotify | `playlist-modify-public` | Edit public playlists |
| Spotify | `user-read-email` | Read email address |

### How Scopes Look to Users

When you click "Login with Google", you see something like:

```
MyApp wants to:
  [x] See your email address
  [x] See your basic profile info
  [ ] Access your Google Drive files

        [Allow]    [Deny]
```

### Requesting Scopes

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_APP_ID
  &scope=email profile drive.readonly
  &...
```

---

## Security Best Practices

### Do

- Always use HTTPS
- Use PKCE for all public clients (mobile, SPA)
- Validate the `state` parameter to prevent CSRF attacks
- Store tokens securely (not in localStorage for web apps)
- Use short-lived access tokens
- Validate redirect URIs strictly
- Request minimum scopes needed

### Don't

- Don't store tokens in localStorage (use httpOnly cookies or secure storage)
- Don't use the Implicit flow (deprecated)
- Don't expose client secrets in frontend code
- Don't skip the `state` parameter
- Don't request more scopes than you need
- Don't use long-lived access tokens

---

## Common Errors and What They Mean

| Error | Meaning | Fix |
|-------|---------|-----|
| `invalid_client` | Wrong client_id or client_secret | Check your credentials |
| `invalid_grant` | Auth code expired or already used | Codes are single-use, request a new one |
| `invalid_scope` | Requested scope doesn't exist | Check provider's documentation |
| `access_denied` | User clicked "Deny" | Handle gracefully, show a message |
| `redirect_uri_mismatch` | Callback URL doesn't match registered URL | Must match exactly in provider settings |
| `unauthorized_client` | App not authorized for this grant type | Check app settings in provider console |

---

## OAuth 2.1 (Coming Soon)

OAuth 2.1 is a cleanup of OAuth 2.0 that:
- **Removes** Implicit Grant (already deprecated)
- **Removes** Resource Owner Password Grant (already deprecated)
- **Requires** PKCE for all authorization code flows
- **Requires** exact redirect URI matching
- **Requires** refresh token rotation or sender-constrained tokens

It's not a new version - it's OAuth 2.0 with best practices baked in as requirements.

---

## OpenID Connect (OIDC) - OAuth for Login

OAuth 2.0 is for **authorization** (access to data), not **authentication** (proving who you are).

**OpenID Connect** is a thin layer on top of OAuth 2.0 that adds authentication:

| Feature | OAuth 2.0 | OIDC (OAuth 2.0 + identity) |
|---------|-----------|---------------------------|
| Purpose | "Can this app access my photos?" | "Who is this user?" |
| Returns | Access token | Access token + **ID token** |
| ID token contains | N/A | User's name, email, picture, etc. |
| Scope | Custom per provider | Standard: `openid`, `profile`, `email` |

When you see "Login with Google", that's actually **OIDC** (not plain OAuth 2.0).

---

Next: [OAuth Platforms & Providers](./platforms.md)
