# Atyant Security Audit Report
**Date:** 2026-06-24  
**Auditor:** Claude (Senior Application Security Engineer)  
**Phase:** 1 — Report Only (no code changed)  
**Stack:** Express/Node.js + MongoDB + Vite/React + Cloudinary + Razorpay

---

## ⚠️ IMMEDIATE ACTION REQUIRED BEFORE READING FURTHER

**`backend/.env` — including live MongoDB Atlas credentials, Razorpay live keys, and Google private keys — was committed to git history multiple times. These secrets are exposed to anyone with `git clone` access.**  
Rotate every credential listed in Finding #1 TODAY before deploying anything.

---

## Findings Table

| # | Severity | Category | Title | File : Line |
|---|----------|----------|-------|-------------|
| 1 | **CRITICAL** | Secrets in Git | Full `.env` committed to history — all production secrets exposed | `git history` (commits: `e4d4b7c2`, `5bc098df`, `0914693e`, others) |
| 2 | **CRITICAL** | Auth / Privilege | Signup accepts arbitrary `role` — any user can self-assign `admin` | `backend/routes/auth.js:30,70` |
| 3 | **CRITICAL** | Payments | Credits order: client controls both `amount` AND `credits` — pay ₹1, get unlimited credits | `backend/routes/paymentRoutes.js:61–74,105` |
| 4 | **CRITICAL** | IDOR | `/api/messages/:u1/:u2` — no auth; anyone can read any private chat history | `backend/server.js:604` |
| 5 | **CRITICAL** | IDOR / Socket | `delete_message` socket: uses client-supplied `userId` to verify ownership, not JWT identity | `backend/server.js:571–580` |
| 6 | **CRITICAL** | Secrets in Source | Groq API key hardcoded as inline fallback | `backend/routes/searchRoutes.js:162` |
| 7 | **HIGH** | Auth | JWT secret fallback `'your_jwt_secret'` in two auth routes if env var unset | `backend/routes/auth.js:22,252` |
| 8 | **HIGH** | Brute-force | Zero rate limiting on login, signup, forgot-password endpoints | `backend/routes/auth.js` (all routes) |
| 9 | **HIGH** | Cost Abuse | No per-user/per-route rate limit on Gemini or Groq AI endpoints | `backend/routes/searchRoutes.js`, `backend/routes/askRoutes.js` |
| 10 | **HIGH** | CVE — nodemailer | nodemailer: CRLF injection, TLS bypass, arbitrary file read, SSRF (4 HIGH CVEs) | `backend/package.json` |
| 11 | **HIGH** | CVE — ws | `ws` 8.x: uninitialized memory disclosure + memory exhaustion DoS (both repos) | `backend/package.json`, `frontend/package.json` |
| 12 | **MEDIUM** | Auth Storage | JWT in `localStorage` — XSS anywhere steals all session tokens | `frontend/src/AuthContext.jsx`, `frontend/src/services/api.js` |
| 13 | **MEDIUM** | Payments | Mentorship order: `amount` accepted from client, not validated against any price table | `backend/routes/paymentRoutes.js:137,150` |
| 14 | **MEDIUM** | Payments | Booking order: `amount` accepted from client, not validated | `backend/routes/paymentRoutes.js:416,424` |
| 15 | **MEDIUM** | Auth | Resume order route uses `optionalAuth` — unauth users can create orders; no idempotency guard | `backend/routes/resumeRoutes.js:create-order` |
| 16 | **MEDIUM** | Crypto | `bcrypt` cost factor 8 used in reset-password (inconsistent with 10 elsewhere) | `backend/routes/auth.js:248` |
| 17 | **MEDIUM** | Info Leak | `/api/health` returns `process.memoryUsage()` and uptime publicly | `backend/server.js:~570` |
| 18 | **MEDIUM** | CVE — react-router | react-router 6.x open redirect via `//`-prefixed protocol-relative URLs | `frontend/package.json` |
| 19 | **MEDIUM** | CVE — vite | Vite ≤6.4.2: NTLM hash disclosure on Windows + `server.fs.deny` bypass | `frontend/package.json` |
| 20 | **LOW** | Config | `.gitignore` incomplete — only covers `backend/.env`, not `backend/.env.*` variants | `.gitignore` |
| 21 | **LOW** | Log Hygiene | `console.log` outputs sensitive user fields (JWT contents, profilePicture) in production | `backend/routes/auth.js:127`, many others |
| 22 | **LOW** | Dead Code | `router.post('https://atyant.in//search', ...)` — Express never matches a full URL as path; intelligence search is silently unreachable | `backend/routes/searchRoutes.js:153` |

---

## Detailed Findings

---

### [1] CRITICAL — Full `.env` Committed to Git History

**Files / Commits:**  
`backend/.env` appears in commits `e4d4b7c2`, `5bc098df`, `0914693e` and several others across git history. The `.gitignore` entry for `backend/.env` was added *after* these commits, so `git log -p --all -- backend/.env` still returns the full plaintext content.

**What was exposed:**

| Secret | Masked Value |
|--------|-------------|
| MongoDB Atlas URI | `mongodb+srv://atyantuser:qf5C****@cluster0.vutlgpa.mongodb.net/atyant` |
| JWT Secret | `supersecretkey` (trivially guessable even without git access) |
| Google Service Account Private Key #1 | RSA 2048 `MIIEvAIBAD...` (full key in history) |
| Google Service Account Private Key #2 | RSA 2048 `MIIEugIBAD...` (second key, different account) |
| Cloudinary API Secret | `yz9YnNj****` |
| Resend API Key | `re_MEnU7db****` |
| Razorpay **LIVE** Key ID | `rzp_live_ROgZ1Xkj6IMbjD` |
| Razorpay **LIVE** Key Secret | `YmtqCAfI****` |
| Gmail App Password #1 | `yynlrrbf****` (bt23mme076@students.vnit.ac.in) |
| Gmail App Password #2 | `lbybllpk****` (atyant.in@gmail.com) |
| Gemini API Key #1 | `AIzaSyCDbi****` |
| Gemini API Key #2 | `AIzaSyChxY****` |
| Gemini API Key #3 | `AIzaSyB51Z****` |
| Google Sheet IDs | `1pR125k42O8ni****`, `1XClZg0lO7wh****` |
| Google OAuth Client IDs | Two IDs committed |

**Concrete Exploit:**  
Anyone who has cloned this repository (including GitHub, CI systems, any contributor) can run `git log -p --all -- backend/.env` and obtain all credentials above in plaintext. With the Razorpay live secret an attacker can forge payment signatures, credit arbitrary amounts, and bypass all payment verification. With the MongoDB Atlas URI they can read/write/delete the entire database. With the Google private key they can impersonate the service account.

**Fix:**  
1. Rotate EVERY credential listed above immediately. This is not optional — the secrets are in permanent git history accessible to all cloners.  
2. To purge from history: use `git filter-repo --path backend/.env --invert-paths` on all branches, then force-push. Notify all collaborators to re-clone.  
3. Add `backend/.env*` (glob) to `.gitignore`, not just `backend/.env`.

---

### [2] CRITICAL — Signup Accepts Arbitrary `role` from Client

**File:** `backend/routes/auth.js:30,70`

```js
// Line 30
const { username, email, password, role, phone } = req.body;
// ...
// Line 70
role: role || 'user'   // attacker sends role:"admin"
```

**Concrete Exploit:**  
```
POST /api/auth/signup
{"username":"evil","email":"evil@x.com","password":"pass1234","phone":"9876543210","role":"admin"}
```
The created account will have `role: "admin"`, bypassing all `adminOnly` guards in `adminRoutes.js`, `mentorRoutes.js`, and others.

**Fix:**  
Strip `role` from `req.body` on signup. Assign a hardcoded `'user'`. Elevation to `mentor` or `admin` must go through a verified, admin-only workflow.

```js
role: 'user'   // never trust client-supplied role
```

---

### [3] CRITICAL — Credits Purchase: Client Controls Both Price and Reward

**File:** `backend/routes/paymentRoutes.js:61–74,105`

```js
// create-order
const { amount = 1, credits = 5 } = req.body;  // BOTH from client!
const order = await razorpay.orders.create({
  amount: Math.round(amount * 100),
  notes: { credits: String(credits), ... }   // attacker-controlled
});

// verify-payment
const creditsToAdd = parseInt(order.notes?.credits) || 5;  // trusts attacker's note
await User.findByIdAndUpdate(req.user.userId, {
  $inc: { messageCredits: creditsToAdd, credits: creditsToAdd }
});
```

**Concrete Exploit:**  
1. Send `POST /api/payment/create-order {"amount": 1, "credits": 999999}` → Razorpay order for ₹1 created, with 999999 stored in order notes.  
2. Pay ₹1 through normal Razorpay checkout.  
3. `POST /api/payment/verify-payment` → server reads `order.notes.credits = 999999` and grants 999999 credits.

The same issue exists for the mentorship order (`/create-mentorship-order`) and booking order (`/create-booking-order`) — `amount` is taken from client and passed directly to Razorpay without checking against any server-side price catalogue.

**Fix:**  
Define a server-side price catalogue and derive amount from it:
```js
const CREDIT_PACKAGES = { 5: 99, 15: 249, 30: 449 }; // credits: price_rupees
const { credits } = req.body;
const price = CREDIT_PACKAGES[credits];
if (!price) return res.status(400).json({ error: 'Invalid package' });
const order = await razorpay.orders.create({ amount: price * 100, ... });
```
For mentorship/booking: look up the mentor's service price from the DB, never from req.body.

---

### [4] CRITICAL — Message History Endpoint Has No Authentication

**File:** `backend/server.js:604`

```js
// No 'protect' middleware here — completely public
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  const messages = await Message.find({ $or: [...] }).lean();
  res.json(messages);
});
```

**Concrete Exploit:**  
```
GET https://api.atyant.in/api/messages/64aaa.../64bbb...
```
No token required. Any unauthenticated caller who knows (or guesses) two MongoDB ObjectIDs retrieves the full private message history between those users. ObjectIDs are not secret — they appear in other API responses (mentor profiles, question details, etc.).

**Fix:**  
Add `protect` middleware and verify the caller is one of the two participants:
```js
app.get('/api/messages/:userId1/:userId2', protect, async (req, res) => {
  const callerId = req.user.userId.toString();
  if (callerId !== userId1 && callerId !== userId2)
    return res.status(403).json({ error: 'Forbidden' });
  // ...
});
```

---

### [5] CRITICAL — Socket `delete_message`: Ownership Verified Against Client-Supplied `userId`

**File:** `backend/server.js:571–580`

```js
socket.on('delete_message', async ({ messageId, userId }) => {  // userId from client!
  const msg = await Message.findById(messageId);
  if (msg && msg.sender.toString() === userId) {   // comparing attacker-supplied value
    await Message.deleteOne({ _id: messageId });
    // ...
  }
});
```

**Concrete Exploit:**  
An authenticated socket can delete any message in the database by sending:
```json
{ "messageId": "<victim_message_id>", "userId": "<victim_sender_id>" }
```
The server compares `msg.sender` with the attacker's `userId` claim — if the attacker also supplies the correct sender ID (visible in previous message history), the check passes and the message is deleted.

**Fix:**  
Use `socket.user.userId` (the JWT-verified identity) instead:
```js
socket.on('delete_message', async ({ messageId }) => {
  const msg = await Message.findById(messageId);
  if (msg && msg.sender.toString() === socket.user.userId.toString()) {
    await Message.deleteOne({ _id: messageId });
    // ...
  }
});
```

---

### [6] CRITICAL — Groq API Key Hardcoded in Source Code

**File:** `backend/routes/searchRoutes.js:162`

```js
'Authorization': `Bearer ${process.env.GROQ_API_KEY || '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'}`,
```

The Groq key `gsk_yeIVxsP4Lq97****` is committed in source and will be used if `GROQ_API_KEY` is not set in env. Anyone with repo access (or git history) can use this key to make Groq API calls at Atyant's expense.

**Fix:**  
Remove the fallback entirely. Throw a startup error if the key is missing:
```js
if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY required');
```

---

### [7] HIGH — JWT Secret Has a Hardcoded Insecure Fallback

**File:** `backend/routes/auth.js:22,252`

```js
jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'your_jwt_secret', ...)
```

If `JWT_SECRET` is absent from the environment, tokens are signed with `'your_jwt_secret'` — the first string anyone would try. This affects the signup and forgot-password routes (the main `protect` middleware in `authMiddleware.js` does NOT have this fallback, so it would reject such tokens — but the tokens would still be issued).

Additionally, the historical `.env` reveals the actual deployed JWT_SECRET is `supersecretkey` — a dictionary word, trivially brute-forceable with `jwt-cracker` or `hashcat`.

**Fix:**  
- Remove the `|| 'your_jwt_secret'` fallback. Throw on startup if `JWT_SECRET` is missing.  
- Rotate `JWT_SECRET` to a cryptographically random 256-bit value: `openssl rand -hex 32`.

---

### [8] HIGH — No Rate Limiting on Auth Endpoints

**File:** `backend/routes/auth.js` (all POST routes)  
**Relevant middleware:** `backend/middleware/globalRateLimiter.js` (100 req/min per IP, shared across all `/api/` routes)

The global limiter (100 req/min/IP) is not sufficient to prevent credential stuffing. Login, signup, and forgot-password have no dedicated stricter limits. An attacker can:
- Try 100 password guesses per minute per IP against any account.
- Register thousands of throwaway accounts per hour (farming credits).
- Flood the forgot-password endpoint to spam victim email inboxes.

**Fix:**  
Apply dedicated, strict rate limiters:
```js
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, skipSuccessfulRequests: false });
router.post('/login', authLimiter, ...);
router.post('/forgot-password', rateLimit({ windowMs: 60*60*1000, max: 5 }), ...);
```

---

### [9] HIGH — No Per-User Rate Limiting on AI Endpoints

AI calls to Gemini (`/api/ask`, `/api/engine`) and Groq (`/api/search`) are only gated by the shared global 100 req/min IP limiter. A single authenticated user could:
- Create many accounts (no signup limit — see #8).
- Hammer AI endpoints from multiple IPs to exhaust Gemini/Groq API quotas and drive up costs.

**Fix:**  
Add per-user (userId) rate limits on all AI-calling endpoints, e.g., 10 AI requests/hour per user.

---

### [10] HIGH — nodemailer: 4 HIGH CVEs

**File:** `backend/package.json`  
**Package:** `nodemailer` (installed version triggers CVEs for nodemailer ≤9.0.0)

| CVE | Advisory | Impact |
|-----|----------|--------|
| GHSA-268h-hp4c-crq3 | CRLF injection in `List-*` header comments | Arbitrary email header injection |
| GHSA-wqvq-jvpq-h66f | jsonTransport bypasses `disableFileAccess`/`disableUrlAccess` | File read via email |
| GHSA-r7g4-qg5f-qqm2 | Improper TLS validation in OAuth2 token fetch | Credential interception on MITM |
| GHSA-p6gq-j5cr-w38f | `raw` option bypasses access restrictions | Arbitrary file read + full-response SSRF |

The contact form and notification emails pass user-supplied `name`/`message` fields into nodemailer with no sanitization, making the CRLF injection directly exploitable.

**Fix:**  
```
npm audit fix
```
Verify nodemailer is updated to ≥9.x.x after fix.

---

### [11] HIGH — `ws` 8.x: Memory Disclosure + DoS (Both Repos)

**Packages:** `ws` in `backend/node_modules` and `frontend/node_modules`  
- GHSA-58qx-3vcg-4xpx: Uninitialized memory disclosure — server leaks heap memory in WebSocket frames.  
- GHSA-96hv-2xvq-fx4p: Memory exhaustion from tiny fragments.

**Fix:** `npm audit fix` in both `backend/` and `frontend/`.

---

### [12] MEDIUM — JWT Stored in `localStorage` (XSS-Accessible)

**File:** `frontend/src/AuthContext.jsx:21–22`, `frontend/src/services/api.js:47`

```js
localStorage.setItem('token', token);
const token = localStorage.getItem('token');
```

Any XSS in any component (a mentor's bio, a chat message that bypasses the content filter, a third-party script) can call `localStorage.getItem('token')` and exfiltrate the session token.

**Fix:**  
Store the JWT in an `httpOnly; Secure; SameSite=Strict` cookie set by the backend. The frontend never reads it directly. Update backend to set the cookie on login and verify it via `req.cookies.token` (the `cookieParser` middleware is already present).

---

### [13–14] MEDIUM — Mentorship and Booking Orders Accept Client-Supplied `amount`

**File:** `backend/routes/paymentRoutes.js:137,150` (mentorship), `backend/routes/paymentRoutes.js:416,424` (booking)

```js
const { amount, mentorshipType, questionId } = req.body;  // amount from attacker
const order = await razorpay.orders.create({ amount: Math.round(amount * 100), ... });
```

**Concrete Exploit:** A user sends `amount: 1` for a ₹499 video call, pays ₹1, and the booking is confirmed because the signature verifies correctly (the order was legitimately created at ₹1).

**Fix:**  
Look up the mentor's actual `Service.price` from the database and use that:
```js
const service = await Service.findById(serviceId);
const amount = service.price;
```

---

### [15] MEDIUM — Resume Order: No Auth Required, No Idempotency Guard

**File:** `backend/routes/resumeRoutes.js`

`/api/resume/create-order` uses `optionalAuth` — unauthenticated users can create Razorpay orders. More critically, `/api/resume/verify-payment` has no idempotency check: if a valid `razorpay_payment_id` is replayed, the Canva link is returned again (and `purchasedTemplates` may be appended again for authenticated users).

**Fix:**  
- Require auth on `create-order`.
- Add idempotency check (find existing purchase by `razorpay_payment_id` before granting the link).

---

### [16] MEDIUM — bcrypt Cost Factor 8 in Reset-Password

**File:** `backend/routes/auth.js:248`

`bcrypt.hash(password, 8)` — the comment says "OPTIMIZED: Reduced bcrypt cost from 10 to 8". Cost 8 is ~4× faster to crack than cost 10. Given the JWT secret was `supersecretkey`, if the DB is leaked (which is trivially possible via Finding #4), passwords would crack much faster.

**Fix:** Use cost 12 everywhere. The performance difference on modern hardware is negligible for auth endpoints.

---

### [17] MEDIUM — `/api/health` Leaks Internal Process Metrics

**File:** `backend/server.js:~570`

```js
res.json({ status:'OK', uptime: process.uptime(), memory: process.memoryUsage(), ... });
```

Returns heap size, RSS, uptime, and socket connection count publicly. Useful for attackers profiling memory layout or timing restarts.

**Fix:** Remove `memory` and `uptime` from the public response, or gate the endpoint with `protect`.

---

### [18] MEDIUM — react-router Open Redirect (GHSA-2j2x-hqr9-3h42)

**File:** `frontend/package.json`  
Affects react-router 6.7.0–6.30.3. A path starting with `//` is reinterpreted as a protocol-relative URL, enabling open redirect to attacker-controlled domains. `npm audit fix` resolves.

---

### [19] MEDIUM — Vite: NTLM Hash Disclosure + `fs.deny` Bypass on Windows

**File:** `frontend/package.json` (Vite ≤6.4.2)  
- GHSA-v6wh-96g9-6wx3: UNC path handling triggers NTLM negotiation, leaking Windows credentials to an attacker-controlled server.  
- GHSA-fx2h-pf6j-xcff: `server.fs.deny` bypass via alternate paths.  

Since the dev environment runs on Windows, these are directly applicable. `npm audit fix` resolves.

---

### [20] LOW — `.gitignore` Incomplete

**File:** `.gitignore:13–14`

```
backend/.env
backend/google-key.json
```

Does not cover `backend/.env.local`, `backend/.env.development`, `backend/.env.production`, or `backend/*.pem`.

**Fix:**
```
backend/.env
backend/.env.*
backend/*.pem
backend/*.key
```

---

### [21] LOW — Sensitive Data in Production Logs

Multiple `console.log` calls output sensitive user fields:
- `backend/routes/auth.js:127`: logs `profilePicture` URL
- `backend/routes/auth.js:136`: logs full user object after login
- `backend/middleware/authMiddleware.js` & `backend/middleware/auth.js`: various debug logs

In production these go to stdout, which may be captured by Dokploy/PM2 log files. Log files are often less protected than databases.

**Fix:** Remove `console.log` calls that output user data. Use a structured logger (`pino`, `winston`) with log-level filtering.

---

### [22] LOW — Dead Route: Intelligence Search Unreachable

**File:** `backend/routes/searchRoutes.js:153`

```js
router.post('https://atyant.in//search', async (req, res) => { ... });
```

Express uses the argument as a path string. A full URL is never matched against incoming requests — only the pathname portion is compared. This route is permanently unreachable and the feature silently does nothing.

**Fix:** Change to `router.post('/intelligence-search', ...)` and update the frontend to call that path.

---

## Fix Order (Maximum Risk Reduction per Hour of Work)

| Priority | Finding | Why First |
|----------|---------|-----------|
| 1 | **#1 — Rotate all secrets NOW** | Credentials already exposed; every minute they remain valid, the DB and payments are at risk |
| 2 | **#4 — Auth on message history endpoint** | One-liner fix; unauthenticated DB read on a production endpoint |
| 3 | **#2 — Strip role from signup** | One-liner fix; admin account creation is trivial |
| 4 | **#5 — Socket delete_message uses JWT identity** | One-liner fix; arbitrary message deletion |
| 5 | **#3 — Server-side price catalogue for credits** | Prevents financial fraud; requires new CREDIT_PACKAGES map |
| 6 | **#13/#14 — Validate mentorship/booking amount from DB** | Same class as #3; look up `Service.price` |
| 7 | **#6 — Remove Groq hardcoded key** | Delete one line |
| 8 | **#7 — Remove JWT fallback + generate strong secret** | One-liner remove + `openssl rand -hex 32` |
| 9 | **#8 — Auth endpoint rate limits** | Add dedicated `express-rate-limit` on login/signup/forgot-password |
| 10 | **#10/#11 — npm audit fix (both repos)** | `npm audit fix` in backend/ and frontend/ |
| 11 | **#9 — Per-user AI rate limits** | Prevents runaway Gemini/Groq spend |
| 12 | **#12 — httpOnly cookie auth** | Larger refactor; schedule for next sprint |
| 13 | **#15 — Resume route auth + idempotency** | Smaller scope, easy win |
| 14 | **#16 — bcrypt cost to 12** | One-line change everywhere |
| 15 | **#17/#20/#21/#22** | Housekeeping; schedule at end |

---

## Summary Statistics

- **CRITICAL:** 6 findings (act today)
- **HIGH:** 5 findings (act this week)
- **MEDIUM:** 7 findings (act this sprint)
- **LOW:** 4 findings (backlog)
- **npm audit — backend:** 13 vulnerabilities (5 HIGH, 8 MODERATE)
- **npm audit — frontend:** 9 vulnerabilities (4 HIGH, 4 MODERATE, 1 LOW)

---

*Phase 2 (fixes) awaiting approval. Do not commit this file to main — keep it on `security/audit-hardening` branch.*
