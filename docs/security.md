# Security Documentation

This document outlines security measures, known limitations, and recommendations for ClipSnap.

---

## Security Measures Implemented

### 1. Authentication & Authorization

| Measure | Implementation |
|---------|----------------|
| Creator Token | 64-byte cryptographically random token |
| Token Storage | Client: localStorage; Server: bcrypt hash only |
| Edit Authorization | bcrypt.compare() on every edit attempt |
| Socket Auth | Token verified on `join-room` |

**Token Generation:**
```javascript
crypto.randomBytes(32).toString('hex') // 64 hex characters
```

### 2. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/clip | 30 | 1 hour |
| POST /api/clip/:id/edit | 60 | 1 minute |
| General API | 100 | 1 minute |

Implemented via `express-rate-limit` with IP-based tracking.

### 3. Input Validation

| Check | Location | Action |
|-------|----------|--------|
| Content size | Client + Server | Reject > 100KB |
| Text-only | Server | Reject binary signatures |
| Clip ID format | Client | Alphanumeric only |
| Content type | Server | JSON only |

### 4. XSS Prevention

- All content rendered as **plain text**
- Uses `<pre><code>` blocks (auto-escaped)
- Never `dangerouslySetInnerHTML`
- No HTML parsing or Markdown rendering

### 5. Security Headers (Helmet.js)

```javascript
helmet({
  contentSecurityPolicy: true,
  crossOriginOpenerPolicy: true,
  // ... additional headers
})
```

Headers set:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (in production)
- `Content-Security-Policy`

### 6. CORS Configuration

```javascript
cors({
  origin: FRONTEND_ORIGIN, // Explicit whitelist
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
})
```

Only the configured frontend origin can access the API.

---

## Known Limitations

### 1. Token in localStorage

**Risk:** XSS vulnerability could expose token.

**Mitigation:**
- No user-generated HTML rendered
- Content-Security-Policy headers
- Token is single-use per clip (no reuse risk)

**Alternative considered:** httpOnly cookies — rejected because:
- Adds session management complexity
- Cross-origin cookies increasingly restricted
- localStorage is acceptable for non-sensitive data

### 2. No Token Revocation

**Risk:** If token leaks, attacker can edit until clip expires.

**Mitigation:**
- Clips are ephemeral (15-min TTL)
- Creator can delete localStorage, making clip orphaned
- No persistent damage possible

**Future option:** Add explicit "delete clip" endpoint.

### 3. No Encryption at Rest

**Risk:** Database admin can read clip content.

**Mitigation:**
- Use MongoDB Atlas (encrypted at rest by default)
- Clips are ephemeral, reducing exposure window

**Out of scope:** Client-side encryption would require key management.

### 4. IP-Based Rate Limiting

**Risk:** Shared IPs (corporate, VPN) may hit limits unfairly.

**Mitigation:**
- Reasonable limits (30/hour creates)
- Rate limits are configurable

### 5. No Account Recovery

**Risk:** User loses edit access if localStorage cleared.

**By design:** Anonymous model trades convenience for privacy.

---

## Best Practices for Operators

### MongoDB Atlas
- [ ] Enable encryption at rest
- [ ] Use strong database passwords
- [ ] Restrict IP access to Render IPs only
- [ ] Enable audit logging

### Render/Vercel
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (automatic)
- [ ] Review access permissions

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor rate limit hits
- [ ] Log suspicious patterns

---

## Incident Response

### If Token Leak Suspected
1. Clip will auto-expire in ≤15 minutes
2. No action required unless content is sensitive
3. Consider reducing TTL for high-security use

### If DDoS Detected
1. Rate limiting will trigger automatically
2. Render provides DDoS protection on paid tiers
3. Consider Cloudflare for additional protection

### If MongoDB Breach
1. Tokens are hashed — cannot be reversed
2. Clip content may be exposed
3. Rotate MongoDB credentials immediately

---

## Security Checklist

- [x] Input validation on all endpoints
- [x] Content size limits enforced
- [x] Rate limiting enabled
- [x] CORS restricted to frontend origin
- [x] Security headers via Helmet
- [x] Passwords/tokens hashed with bcrypt
- [x] HTTPS required in production
- [x] No sensitive data in logs
- [x] Dependencies audit: `npm audit`
- [ ] Penetration testing (optional)
- [ ] Bug bounty program (optional)

---

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Email: [security contact]
3. Include: description, reproduction steps, potential impact
4. Expected response: within 48 hours
