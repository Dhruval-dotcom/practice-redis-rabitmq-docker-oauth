# OAuth 1.0 - The Original

---

## Timeline

- **2006** - Blaine Cook (Twitter) and others started discussing the need for open authorization
- **2007** - OAuth 1.0 spec released
- **2009** - OAuth 1.0a released (fixed a security flaw)
- **2010** - Published as RFC 5849
- **2012** - Replaced by OAuth 2.0

---

## Why Was OAuth 1.0 Created?

Before OAuth, if Flickr wanted to let a printing service access your photos:
- The printing service would ask for your Flickr username + password
- It would store your password on its servers
- It had full access to your entire Flickr account

This was dangerous, insecure, and had no standard way to limit access.

OAuth 1.0 solved this by creating a standard protocol where apps could get **limited access tokens** instead of passwords.

---

## How OAuth 1.0 Worked

### The 3-Legged Flow

```
Step 1: App gets a "Request Token" from the provider
        App -> Provider: "I need a temporary token"
        Provider -> App: "Here's a request token"

Step 2: User authorizes the app
        App -> User: "Go to this URL to approve"
        User -> Provider: "Yes, I approve this app"
        Provider -> User: "Here's a verification code"

Step 3: App exchanges request token for access token
        App -> Provider: "Here's my request token + verification code"
        Provider -> App: "Here's your access token"

Step 4: App uses access token to fetch data
        App -> Provider API: "Give me user's photos" + signed request
        Provider API -> App: "Here are the photos"
```

### The Signature Problem

Every single API request in OAuth 1.0 needed to be **cryptographically signed**:

1. Collect all request parameters
2. Sort them alphabetically
3. Encode them in a specific way
4. Combine with HTTP method and URL
5. Sign using HMAC-SHA1 with a secret key
6. Include the signature in the request

This looked something like:

```
OAuth oauth_consumer_key="app123",
      oauth_token="user_token_456",
      oauth_signature_method="HMAC-SHA1",
      oauth_signature="tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D",
      oauth_timestamp="1318622958",
      oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
      oauth_version="1.0"
```

---

## Why OAuth 1.0 Failed

### 1. Too Complex

- Developers had to implement cryptographic signatures manually
- Tiny errors in sorting, encoding, or signing broke everything
- Debugging was a nightmare ("Why is my signature wrong?")

### 2. Poor Mobile Support

- OAuth 1.0 was designed for web browsers with redirects
- Mobile apps struggled with the redirect-based flow
- No good way to handle native app authorization

### 3. Signature Overhead

- Every API call required computing a signature
- Added CPU cost and code complexity
- HTTPS (SSL/TLS) made this unnecessary - the transport layer already encrypts

### 4. No Token Expiration

- Access tokens in OAuth 1.0 never expired by default
- If a token was stolen, it worked forever
- No built-in refresh mechanism

### 5. Scaling Issues

- The cryptographic signing didn't scale well
- Server-side signature validation was expensive
- Large APIs (Google, Facebook) needed something simpler

---

## OAuth 1.0a - The Security Patch

A security flaw was discovered in OAuth 1.0:
- An attacker could trick a user into authorizing the attacker's account
- This was called a **session fixation attack**

OAuth 1.0a fixed this by:
- Adding a verification code in the callback
- Requiring the callback URL to be registered in advance

Most people refer to "OAuth 1.0" meaning "OAuth 1.0a" since the original was quickly deprecated.

---

## Who Still Uses OAuth 1.0?

Almost nobody. But historically:

| Service | Status |
|---------|--------|
| Twitter | Used OAuth 1.0a until 2023, now uses OAuth 2.0 |
| Tumblr | Migrated to OAuth 2.0 |
| Flickr | Migrated to OAuth 2.0 |
| Evernote | Migrated to OAuth 2.0 |

If you see OAuth 1.0 in the wild today, it's legacy code that hasn't been updated.

---

## Key Takeaway

OAuth 1.0 was a great idea (tokens instead of passwords) with a painful implementation (cryptographic signatures). OAuth 2.0 kept the good idea and made it much simpler by relying on HTTPS for security instead of signatures.

---

Next: [OAuth 2.0 - The Current Standard](./oauth-2.0.md)
