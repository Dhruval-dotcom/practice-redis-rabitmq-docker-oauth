# OAuth Implementation Guide

Practical steps to add OAuth to your app.

---

## Before You Start

### What You Need

1. **A web app** (any language/framework)
2. **An OAuth provider** (Google, GitHub, etc.)
3. **A registered app** on that provider (to get client_id and client_secret)
4. **HTTPS** (required for OAuth 2.0, use localhost for dev)

---

## Step 1: Register Your App

Every provider has a developer console. Here's what you'll fill in:

| Field | Example | Notes |
|-------|---------|-------|
| App Name | "My Cool App" | Users see this during login |
| Homepage URL | `https://mycoolapp.com` | Your app's URL |
| Redirect URI | `https://mycoolapp.com/auth/callback` | Where users land after login |

**You'll get back:**
- `client_id` - Public identifier for your app
- `client_secret` - Secret key (keep this safe, NEVER expose in frontend)

---

## Step 2: The Authorization Code Flow

This is the most common flow. Here's how to implement it.

### 2a. Redirect User to Provider

When user clicks "Login with Google":

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/auth/callback
  &response_type=code
  &scope=openid email profile
  &state=RANDOM_STRING_TO_PREVENT_CSRF
```

**Parameters explained:**
- `client_id` - Your app's ID
- `redirect_uri` - Must match what you registered
- `response_type=code` - You want an authorization code
- `scope` - What permissions you're requesting
- `state` - Random string you generate. Verify it in the callback to prevent CSRF attacks.

### 2b. Handle the Callback

After user approves, they're redirected to:
```
https://yourapp.com/auth/callback?code=AUTH_CODE_HERE&state=YOUR_STATE_STRING
```

Your server should:
1. Verify the `state` matches what you sent
2. Exchange the `code` for tokens

### 2c. Exchange Code for Tokens

Make a server-side POST request:

```
POST https://oauth2.googleapis.com/token

Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_FROM_CALLBACK
&redirect_uri=https://yourapp.com/auth/callback
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
```

**Response:**
```json
{
  "access_token": "ya29.a0AfH6SM...",
  "expires_in": 3600,
  "refresh_token": "1//0eXx...",
  "scope": "openid email profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOi..."
}
```

### 2d. Use the Access Token

```
GET https://www.googleapis.com/oauth2/v2/userinfo
Authorization: Bearer ya29.a0AfH6SM...
```

**Response:**
```json
{
  "id": "1234567890",
  "email": "user@gmail.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

---

## Step 3: Store and Manage Tokens

### What to Store

| Token | Where | Why |
|-------|-------|-----|
| Access Token | Server memory or secure session | Short-lived, used for API calls |
| Refresh Token | Database (encrypted) | Long-lived, used to get new access tokens |
| User Info | Database | Name, email, profile picture |

### Token Refresh Flow

When the access token expires:

```
POST https://oauth2.googleapis.com/token

grant_type=refresh_token
&refresh_token=STORED_REFRESH_TOKEN
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
```

---

## Code Examples

### Node.js + Express (Minimal)

```javascript
const express = require("express");
const axios = require("axios");
const app = express();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/callback";

// Step 1: Redirect to Google
app.get("/auth/google", (req, res) => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", "random_csrf_token"); // generate properly in production
  res.redirect(url.toString());
});

// Step 2: Handle callback
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;

  // Verify state parameter here

  // Step 3: Exchange code for tokens
  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    })
  );

  const { access_token } = tokenResponse.data;

  // Step 4: Get user info
  const userResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  // Create session, store user, etc.
  res.json(userResponse.data);
});

app.listen(3000);
```

### Using NextAuth.js (Easiest for Next.js)

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
});

export { handler as GET, handler as POST };
```

That's it. NextAuth handles the entire flow.

### Using Passport.js (Node.js)

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Find or create user in your database
      return done(null, profile);
    }
  )
);

// Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/dashboard")
);
```

---

## Provider-Specific Setup URLs

| Provider | Where to Register Your App |
|----------|---------------------------|
| Google | https://console.cloud.google.com/apis/credentials |
| GitHub | https://github.com/settings/developers |
| Facebook | https://developers.facebook.com/apps |
| Microsoft | https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps |
| Apple | https://developer.apple.com/account/resources/authkeys |
| Discord | https://discord.com/developers/applications |
| Twitter | https://developer.twitter.com/en/portal |
| Spotify | https://developer.spotify.com/dashboard |
| LinkedIn | https://www.linkedin.com/developers/apps |

---

## Security Checklist

Before going to production, verify:

- [ ] Using HTTPS everywhere (not just login)
- [ ] `state` parameter generated and validated (prevents CSRF)
- [ ] Using PKCE for mobile/SPA clients
- [ ] Client secret stored in environment variables (not in code)
- [ ] Redirect URIs are exact matches (no wildcards)
- [ ] Access tokens stored securely (httpOnly cookies, not localStorage)
- [ ] Refresh tokens encrypted in database
- [ ] Requesting minimum scopes needed
- [ ] Handling token expiration and refresh properly
- [ ] Handling user denying permission gracefully
- [ ] Validating ID tokens (if using OIDC)
- [ ] Rate limiting auth endpoints

---

## Common Mistakes

| Mistake | Why It's Bad | Fix |
|---------|------------|-----|
| Storing tokens in localStorage | XSS attacks can steal them | Use httpOnly cookies |
| Skipping `state` parameter | CSRF attacks possible | Always generate and verify |
| Using Implicit flow | Token exposed in URL | Use Authorization Code + PKCE |
| Hardcoding client_secret | Leaked in version control | Use environment variables |
| Not validating redirect URI | Open redirect attacks | Exact match only |
| Requesting too many scopes | Users won't trust your app | Ask for minimum needed |
| Not handling token refresh | Users get logged out randomly | Implement refresh flow |
| Ignoring error responses | Bad user experience | Handle all OAuth errors gracefully |

---

## Testing OAuth Locally

### Problem
OAuth requires redirect URIs, and `localhost` can be tricky.

### Solutions

1. **Most providers allow localhost**
   - Register `http://localhost:3000/auth/callback` as redirect URI
   - Google, GitHub, Discord all support this

2. **Use ngrok for providers that don't**
   ```bash
   ngrok http 3000
   # Gives you: https://abc123.ngrok.io
   # Use that as your redirect URI
   ```

3. **Use a `.env.local` file**
   ```
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   REDIRECT_URI=http://localhost:3000/auth/callback
   ```

---

## Next Steps

1. Pick a provider from the [Platforms Guide](./platforms.md)
2. Register your app and get credentials
3. Implement the flow (or use a library like NextAuth.js / Passport.js)
4. Test locally with localhost redirect URIs
5. Go through the security checklist before deploying
6. Deploy and update redirect URIs to production URLs

---

Back to [Main Guide](./README.md)
