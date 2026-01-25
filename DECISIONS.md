# Design Decisions & Tradeoffs

This document explains the key architectural and design decisions made for ClipSnap.

---

## 1. Database: MongoDB vs Redis

### Decision: MongoDB with TTL Index

**Why MongoDB:**
- Native TTL index support with `expireAfterSeconds`
- Document structure fits the clip model naturally
- Free tier available on MongoDB Atlas
- Familiar for MERN stack developers
- Persistent storage (survives restarts)

**When Redis would be preferable:**
- High-traffic production (millions of clips/day)
- Sub-second expiration precision required
- Pure in-memory caching needs
- Complex pub/sub patterns beyond Socket.IO

**Tradeoff:** MongoDB TTL has ~60-second precision (background task runs every 60s). For a clipboard app, this is acceptable. Redis would provide sub-second precision but adds infrastructure complexity.

---

## 2. Authentication: Anonymous with Creator Token

### Decision: Browser-stored tokens, no accounts

**Implementation:**
- Server generates 64-character random `creatorToken` on clip creation
- Token is returned once to client and stored in `localStorage`
- Server stores only bcrypt hash of token
- Token presence = edit permission

**Why this approach:**
- Zero friction (no signup/login)
- Privacy-friendly (no personal data)
- Simpler infrastructure (no OAuth, sessions, password resets)
- Fits the ephemeral nature of clips

**Tradeoffs:**
- If user clears localStorage, edit access is permanently lost
- Token cannot be recovered (by design)
- No cross-device continuation for creator
- If token leaks, attacker can edit (mitigation: clips are ephemeral)

**Alternative considered:** Magic links via email — rejected for complexity and friction.

---

## 3. Real-time: Socket.IO vs Alternatives

### Decision: Socket.IO

**Why Socket.IO:**
- Automatic fallback (WebSocket → long-polling)
- Room-based broadcasting built-in
- Mature, well-documented
- Easy integration with Express
- Handles reconnection automatically

**Alternatives considered:**
- **Plain WebSocket:** Lower-level, no fallback, more boilerplate
- **Pusher/Ably:** External service, cost at scale
- **Server-Sent Events:** One-way only, not suitable for creator edits

---

## 4. Persistence Strategy: Debounced Writes

### Decision: 1500ms debounce + save on disconnect

**Why debouncing:**
- Typing generates many events per second
- Direct DB writes would overwhelm MongoDB
- Reduces write operations by 95%+

**Implementation:**
- Client debounces edits at 300ms before emitting
- Server debounces DB writes at 1500ms after last edit
- Forced save on socket disconnect

**Tradeoff:** If server crashes mid-debounce, up to 1.5s of edits could be lost. Acceptable for an ephemeral clipboard.

---

## 5. TTL Reset Behavior

### Decision: Reset on edit AND on access (GET)

**Why reset on access:**
- Prevents "mid-read" expiration
- Viewers accessing clip keep it alive
- More intuitive UX (if someone's using it, it stays)

**Configuration:** Can be changed via environment variable if needed.

---

## 6. Clip ID Format

### Decision: 7-character Base62

**Format:** `[0-9A-Za-z]{7}` (e.g., `Ab3xF9k`)

**Why:**
- 62^7 = 3.5 trillion combinations (collision-resistant)
- URL-safe (no encoding needed)
- Short enough to share verbally
- Human-readable, easy to type

**Collision handling:** Generate and check, retry up to 10 times.

---

## 7. Content Size Limit

### Decision: 100KB maximum

**Why 100KB:**
- Sufficient for ~50-100K characters of text
- Prevents abuse (large file storage)
- Reasonable for clipboard use cases
- Fast to transfer and render

**Enforcement:** Validated on both client (before submit) and server (before save).

---

## 8. Auto-copy Behavior

### Decision: Automatic clipboard write for viewers

**Implementation:**
- On `/clip/:id` load, viewers trigger `navigator.clipboard.writeText()`
- If successful, show success toast
- If blocked, show fallback instructions + manual copy button

**Why:**
- Core UX: receivers should be able to paste immediately
- Reduces friction from open → manual copy → paste

**Browser limitations:**
- Requires user gesture in some browsers
- May be blocked by permissions policy
- Graceful fallback always available

---

## 9. Security Model

### Decisions:

| Concern | Solution |
|---------|----------|
| Creator auth | Token stored in localStorage, hash in DB |
| XSS | Plain text rendering only (escaped in `<pre>`) |
| Rate limiting | 30 creates/hour, 60 edits/min per IP |
| Size limit | 100KB enforced on both ends |
| CORS | Strict origin whitelist |
| Headers | Helmet.js security headers |

**Not implemented (out of scope):**
- Password-protected clips
- IP-based access control
- Encryption at rest

---

## 10. Deployment Architecture

### Decision: Vercel (frontend) + Render (backend)

**Why this split:**
- Vercel: Excellent for React SPAs, automatic HTTPS, free tier
- Render: Good for Node.js services, WebSocket support, free tier
- Both support environment variables and auto-deploy

**Alternative:** Single deployment (Next.js on Vercel) — rejected because Socket.IO works better with persistent Node.js process.

---

## Summary

ClipSnap prioritizes:
1. **Simplicity** over features
2. **Privacy** over personalization
3. **Speed** over durability
4. **Minimal friction** over comprehensive auth

These tradeoffs align with the ephemeral, anonymous nature of a clipboard-sharing tool.
