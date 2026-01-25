# QA Checklist & Test Procedures

Comprehensive testing guide for ClipSnap.

---

## Quick Smoke Test

Run these tests before any deployment:

- [ ] Create a clip → receives clipboardId
- [ ] Open clip in another browser → content displays
- [ ] Edit as creator → change persists
- [ ] Viewer cannot see edit controls
- [ ] Auto-copy works (or fallback shown)

---

## Automated Tests

### Running Tests

```bash
# Server unit tests
cd server && npm test

# Integration tests
cd server && npm run test:integration
```

### Test Coverage

| Area | Tests |
|------|-------|
| ID Generation | Uniqueness, format validation |
| Token Hashing | bcrypt hash/compare |
| TTL Reset | lastUpdated updates on access |
| Size Validation | Rejects >100KB |
| Rate Limiting | Triggers after threshold |
| Socket Events | join-room, client-edit, server-edit |

---

## Manual Test Procedures

### T1: Creator Flow

**Steps:**
1. Open http://localhost:5173
2. Click "Create new clip"
3. Enter text: "Test content 12345"
4. Click "Create Clip"

**Expected:**
- [ ] Redirected to /clip/:id
- [ ] Clipboard ID displayed
- [ ] "Creator" badge visible
- [ ] Textarea is editable
- [ ] Copy and Download buttons present

---

### T2: Viewer Flow

**Steps:**
1. Copy clipboard ID from T1
2. Open new incognito window
3. Go to http://localhost:5173
4. Enter clipboard ID
5. Click "Go / Fetch"

**Expected:**
- [ ] Content loads correctly
- [ ] Toast: "Copied to clipboard — ready to paste!"
- [ ] Paste in notepad verifies content
- [ ] "Read-only" badge visible
- [ ] No textarea (read-only pre/code block)

---

### T3: Real-time Sync

**Preparation:** Have T1 (creator) and T2 (viewer) open side-by-side.

**Steps:**
1. In creator window, add text: " - LIVE UPDATE"
2. Observe viewer window

**Expected:**
- [ ] Viewer sees update within 1 second
- [ ] No page refresh required
- [ ] "Live" indicator is green

---

### T4: Edit Permission Enforcement

**Steps:**
1. As viewer (incognito), try to:
   - Locate any edit UI elements
   - Use browser DevTools to send client-edit event

**Expected:**
- [ ] No edit textarea visible
- [ ] Socket edit rejected with error
- [ ] Content unchanged

---

### T5: Size Limit Rejection

**Steps:**
1. Create a new clip
2. Paste 150KB of text (generate with: `'x'.repeat(150000)`)
3. Attempt to save

**Expected:**
- [ ] Error shown: "Content exceeds 100KB limit"
- [ ] Clip not created
- [ ] Size indicator shows red/warning

---

### T6: TTL Expiration (Short TTL Test)

**Setup:** Set `CLIP_TTL_SECONDS=60` in server .env

**Steps:**
1. Create a clip
2. Note the time
3. Wait 70 seconds without accessing
4. Try to access the clip

**Expected:**
- [ ] Returns 404 "Clip not found or expired"
- [ ] Clip no longer exists in database

---

### T7: TTL Reset on Access

**Setup:** Set `CLIP_TTL_SECONDS=60` in server .env

**Steps:**
1. Create a clip
2. Wait 30 seconds
3. Access the clip (GET request)
4. Wait 40 more seconds (total 70s from creation)
5. Access the clip again

**Expected:**
- [ ] Clip still exists (TTL reset at step 3)
- [ ] lastUpdated was updated

---

### T8: Auto-copy Fallback

**Steps:**
1. Block clipboard permission (browser settings)
2. Open a clip as viewer

**Expected:**
- [ ] Toast: "Could not auto-copy. Use the Copy button below."
- [ ] Fallback section visible with Copy button
- [ ] Manual copy button works

---

### T9: Download Functionality

**Steps:**
1. Open a clip with content
2. Click "Download .txt"

**Expected:**
- [ ] File downloads
- [ ] Filename is `<clipboardId>.txt`
- [ ] Content matches clip content

---

### T10: Rate Limiting

**Steps:**
1. Create 31 clips rapidly (script or manual)

**Expected:**
- [ ] 31st request returns 429
- [ ] Error message: "Too many clips created"
- [ ] Retry-After header present

---

### T11: Invalid Clip ID

**Steps:**
1. Navigate to /clip/nonexistent123

**Expected:**
- [ ] Error page: "Clip Not Found"
- [ ] "Go Home" button works

---

### T12: Connection Recovery

**Steps:**
1. Open clip as creator
2. Disable network (airplane mode)
3. Re-enable network

**Expected:**
- [ ] "Offline" indicator shown when disconnected
- [ ] "Live" indicator returns after reconnection
- [ ] Edits resume working

---

## Browser Compatibility

Test core flows in:

| Browser | Status |
|---------|--------|
| Chrome (latest) | [ ] |
| Firefox (latest) | [ ] |
| Safari (latest) | [ ] |
| Edge (latest) | [ ] |
| Mobile Chrome | [ ] |
| Mobile Safari | [ ] |

---

## Accessibility Testing

- [ ] Keyboard navigation works (Tab through all controls)
- [ ] Screen reader announces: clip ID, status, buttons
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Error messages announced to screen readers

---

## Performance Benchmarks

| Metric | Target |
|--------|--------|
| Initial page load | < 2s |
| Clip creation response | < 500ms |
| Real-time sync latency | < 300ms |
| Time to auto-copy | < 1s after load |

---

## Deployment Verification

After deploying to Vercel + Render:

- [ ] Health endpoint returns 200: `/health`
- [ ] CORS working (no console errors)
- [ ] WebSocket connects (Live indicator green)
- [ ] Create → View flow works
- [ ] TTL expiration works
- [ ] Rate limiting active

---

## Test Data Cleanup

For development/testing:

```javascript
// MongoDB shell - delete all clips
db.clips.deleteMany({})

// Delete expired only (already TTL indexed)
// No action needed - MongoDB handles automatically
```

---

## Known Test Gaps

- [ ] Load testing (100+ concurrent users)
- [ ] Chaos testing (network partitions)
- [ ] Fuzz testing on API inputs
- [ ] Security penetration testing
