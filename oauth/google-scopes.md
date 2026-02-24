# Google OAuth Scopes - Complete Guide

---

## What Are Scopes?

Scopes are **permission labels** that tell Google exactly what your app wants to access.

Think of it like this:
- Your app knocks on Google's door
- Google asks: "What do you want?"
- Your app shows a list of scopes: "I want to read their email and see their name"
- Google shows that list to the user: "This app wants your email and name. Allow?"
- User decides yes or no

**Without scopes**: App gets nothing
**With scopes**: App gets only what it asked for and user approved

---

## How Scopes Work (Step by Step)

### 1. You request scopes in the auth URL

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_ID
  &scope=openid email profile
  &...
```

### 2. User sees a consent screen

```
+------------------------------------------+
|          Sign in with Google              |
|                                           |
|  "My App" wants to:                       |
|                                           |
|  [✓] See your email address               |
|  [✓] See your basic profile info          |
|                                           |
|        [ Allow ]    [ Deny ]              |
+------------------------------------------+
```

### 3. Your app gets a token limited to those scopes

- If you asked for `email` → you can read their email
- If you asked for `email` but try to read their Drive → **Access Denied**

---

## Scope Categories

Google organizes scopes into 3 sensitivity levels:

| Level | What It Means | Google Review Required? | Example |
|-------|--------------|------------------------|---------|
| **Non-sensitive** | Basic info, low risk | No | `openid`, `email`, `profile` |
| **Sensitive** | Access to user data | Yes (verification needed) | `calendar.readonly`, `drive.readonly` |
| **Restricted** | Deep access to personal data | Yes (strict security audit) | `gmail.readonly`, `drive` (full access) |

**Important**: If you use sensitive or restricted scopes, Google will review your app before allowing public use. For development/testing, you can use them with up to 100 test users without review.

---

## Most Common Scopes

### Basic Identity (Non-Sensitive)

These are what 90% of apps need for "Login with Google":

| Scope | What You Get | When to Use |
|-------|-------------|-------------|
| `openid` | User's unique Google ID | Always include this for login |
| `email` | Email address + verified status | When you need their email |
| `profile` | Name, profile picture, locale | When you need their name/avatar |

**Usage:**
```
scope=openid email profile
```

**Response you get:**
```json
{
  "sub": "1234567890",
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/a/photo.jpg",
  "given_name": "John",
  "family_name": "Doe",
  "locale": "en"
}
```

---

### Google Drive

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `drive.metadata.readonly` | See file names, sizes, dates (not content) | File browser, storage tracker |
| `drive.readonly` | Read file content | Document viewer |
| `drive.file` | Read/write files YOUR APP created | App-specific file storage |
| `drive` | Full read/write/delete access | Full Drive management app |
| `drive.appdata` | Read/write to hidden app folder | Storing app settings/data |

**Tip**: Always use the most restrictive scope possible. `drive.file` is much easier to get approved than `drive`.

---

### Gmail

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `gmail.readonly` | Read emails | Email client, analytics |
| `gmail.send` | Send emails only | Notification sender |
| `gmail.compose` | Create drafts, send emails | Email composer |
| `gmail.modify` | Read, send, delete, manage labels | Full email client |
| `gmail.metadata` | Read headers only (no body) | Email organizer |

**Warning**: Gmail scopes are **restricted**. You'll need a full security audit by Google to use them publicly.

---

### Google Calendar

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `calendar.readonly` | Read calendar events | Schedule viewer |
| `calendar.events.readonly` | Read events only (not settings) | Event display |
| `calendar.events` | Create, edit, delete events | Meeting scheduler |
| `calendar` | Full calendar access | Calendar management app |
| `calendar.settings.readonly` | Read calendar settings | Timezone detection |

---

### Google Sheets

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `spreadsheets.readonly` | Read spreadsheet data | Data viewer, reports |
| `spreadsheets` | Read and write | Data editor, automation |

---

### YouTube

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `youtube.readonly` | View account info, playlists | Channel viewer |
| `youtube` | Manage YouTube account | Video uploader |
| `youtube.upload` | Upload videos only | Video publishing tool |
| `youtube.force-ssl` | Same as `youtube` but requires SSL | Recommended over `youtube` |

---

### Google Contacts / People API

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `contacts.readonly` | Read contacts | Contact list display |
| `contacts` | Read and write contacts | Contact management |
| `contacts.other.readonly` | Read "Other contacts" | Extended contact access |
| `userinfo.email` | Same as `email` (legacy) | Older apps |
| `userinfo.profile` | Same as `profile` (legacy) | Older apps |

---

### Google Maps / Places

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| Maps APIs use **API keys**, not OAuth scopes | - | - |

**Note**: Google Maps doesn't use OAuth. It uses API keys for authentication. This is a common confusion.

---

### Firebase / Cloud

| Scope | Access Level | Use Case |
|-------|-------------|----------|
| `cloud-platform` | Full access to Google Cloud | Admin tools |
| `cloud-platform.read-only` | Read-only Cloud access | Monitoring dashboards |
| `firebase` | Full Firebase access | Firebase admin tools |

---

## Full Scope URL Format

Google scopes have a long URL format. Both short and long forms work:

| Short Form | Full URL Form |
|------------|--------------|
| `email` | `https://www.googleapis.com/auth/userinfo.email` |
| `profile` | `https://www.googleapis.com/auth/userinfo.profile` |
| `openid` | `openid` (special, no URL needed) |
| `drive.readonly` | `https://www.googleapis.com/auth/drive.readonly` |
| `calendar` | `https://www.googleapis.com/auth/calendar` |

When writing code, you can use either:
```
scope=openid email profile
```
or:
```
scope=openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
```

Both are identical.

---

## Incremental Scopes (Ask as You Need)

You don't have to ask for all scopes at login. Google supports **incremental authorization**:

```
First login:
  scope = openid email profile
  → User sees: "App wants your name and email"

Later, when user clicks "Connect Google Drive":
  scope = drive.readonly
  → User sees: "App also wants to read your Drive"
```

**Why this is better:**
- Users are more likely to approve small requests
- A login page asking for email + Drive + Calendar + Gmail looks scary
- Ask for permissions only when the user needs that feature

### Code Example (Incremental)

```javascript
// Initial login - just basic info
const loginUrl = buildAuthUrl({
  scope: "openid email profile"
});

// Later, when user wants Drive feature
const driveUrl = buildAuthUrl({
  scope: "https://www.googleapis.com/auth/drive.readonly",
  include_granted_scopes: true  // keeps previous scopes
});
```

---

## Checking What Scopes a Token Has

You can verify which scopes were actually granted:

```
GET https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=YOUR_TOKEN
```

**Response:**
```json
{
  "issued_to": "YOUR_CLIENT_ID",
  "audience": "YOUR_CLIENT_ID",
  "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  "expires_in": 3400,
  "email": "user@gmail.com",
  "verified_email": true,
  "access_type": "offline"
}
```

---

## Google's Verification Process

If your app uses **sensitive or restricted** scopes, Google requires verification before you can have more than 100 users:

### Non-Sensitive (No Review)
- `openid`, `email`, `profile`
- You can go live immediately

### Sensitive (Basic Review)
- `calendar.readonly`, `drive.readonly`, etc.
- Submit app for verification
- Takes 3-5 business days
- Need: Privacy policy URL, homepage, explanation of why you need the data

### Restricted (Full Security Audit)
- `gmail.readonly`, `gmail.send`, `drive` (full access)
- Requires third-party security assessment (CASA Tier 2)
- Costs money (security audit fees)
- Takes weeks to months
- Need: Everything above + security audit report

### Testing Without Verification
While in development:
1. Go to Google Cloud Console > OAuth consent screen
2. Set to "Testing" mode
3. Add up to 100 test user emails
4. These users can use all scopes without verification

---

## Common Scope Combinations

### "Login with Google" (Most Apps)
```
scope=openid email profile
```

### Email App
```
scope=openid email profile https://www.googleapis.com/auth/gmail.readonly
```

### Calendar Scheduler
```
scope=openid email profile https://www.googleapis.com/auth/calendar.events
```

### File Storage App
```
scope=openid email profile https://www.googleapis.com/auth/drive.file
```

### YouTube Dashboard
```
scope=openid email profile https://www.googleapis.com/auth/youtube.readonly
```

---

## Best Practices

| Do | Don't |
|----|-------|
| Request minimum scopes needed | Ask for `drive` when you only need `drive.readonly` |
| Use incremental authorization | Request all scopes on first login |
| Explain why you need each scope | Leave users guessing |
| Use `drive.file` over `drive` | Use full `drive` access for app-created files |
| Handle scope denial gracefully | Crash if user denies a scope |
| Re-check token scopes before API calls | Assume all requested scopes were granted |

---

## Quick Reference Table

| I Want To... | Scope to Use |
|-------------|-------------|
| Get user's email | `email` |
| Get user's name and photo | `profile` |
| Read their Google Drive files | `drive.readonly` |
| Save files to Drive (only my app's files) | `drive.file` |
| Read their calendar | `calendar.readonly` |
| Create calendar events | `calendar.events` |
| Read their emails | `gmail.readonly` (restricted) |
| Send emails on their behalf | `gmail.send` (restricted) |
| Read their contacts | `contacts.readonly` |
| Read their YouTube data | `youtube.readonly` |
| Upload YouTube videos | `youtube.upload` |
| Read Google Sheets data | `spreadsheets.readonly` |

---

## Official References

- [Full list of Google OAuth scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [OAuth consent screen setup](https://console.cloud.google.com/apis/credentials/consent)
- [Verification requirements](https://support.google.com/cloud/answer/9110914)

---

Back to [Main Guide](./README.md) | [OAuth 2.0](./oauth-2.0.md) | [Platforms](./platforms.md)
