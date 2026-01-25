# Deployment Guide

Complete step-by-step instructions for deploying ClipSnap to production.

---

## Prerequisites

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)
- [Vercel](https://vercel.com) account
- [Render](https://render.com) account
- Git repository with your code

---

## Step 1: MongoDB Atlas Setup

1. **Create a cluster:**
   - Go to MongoDB Atlas → Create New Cluster
   - Select Free Tier (M0 Sandbox)
   - Choose a region close to your users

2. **Create database user:**
   - Database Access → Add New Database User
   - Authentication: Password
   - Save username and password securely

3. **Configure network access:**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (For production, use Render's static IPs)

4. **Get connection string:**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your password
   - Result: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/clipsnap`

---

## Step 2: Deploy Backend to Render

1. **Create Web Service:**
   - Render Dashboard → New → Web Service
   - Connect your Git repository
   - Select the repository

2. **Configure service:**
   
   | Setting | Value |
   |---------|-------|
   | Name | `clipsnap-api` |
   | Environment | `Node` |
   | Region | Choose closest to users |
   | Branch | `main` |
   | Root Directory | `server` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

3. **Add environment variables:**

   | Key | Value |
   |-----|-------|
   | `PORT` | `3001` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `FRONTEND_ORIGIN` | `https://your-app.vercel.app` (update after Vercel deploy) |
   | `BCRYPT_SALT_ROUNDS` | `10` |
   | `CLIP_TTL_SECONDS` | `900` |
   | `RATE_LIMIT_CREATE_PER_HOUR` | `30` |
   | `RATE_LIMIT_EDIT_PER_MIN` | `60` |

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your Render URL: `https://clipsnap-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. **Import project:**
   - Vercel Dashboard → New Project
   - Import your Git repository

2. **Configure project:**
   
   | Setting | Value |
   |---------|-------|
   | Framework Preset | `Vite` |
   | Root Directory | `client` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. **Add environment variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://clipsnap-api.onrender.com` |
   | `VITE_SOCKET_URL` | `https://clipsnap-api.onrender.com` |

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment
   - Note your Vercel URL: `https://clipsnap.vercel.app`

---

## Step 4: Update CORS Configuration

1. Go back to Render Dashboard
2. Update `FRONTEND_ORIGIN` environment variable to your Vercel URL
3. Redeploy the backend service

---

## Step 5: Verify Deployment

### Health Check
```bash
curl https://clipsnap-api.onrender.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Create a Test Clip
```bash
curl -X POST https://clipsnap-api.onrender.com/api/clip \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello from deployment!"}'
```

### Full Flow Test
1. Open `https://clipsnap.vercel.app`
2. Create a new clip
3. Copy the clipboard ID
4. Open in incognito window
5. Paste the ID and fetch
6. Verify auto-copy works

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Server port |
| `MONGO_URI` | **Yes** | - | MongoDB connection string |
| `FRONTEND_ORIGIN` | **Yes** | - | Vercel frontend URL |
| `BCRYPT_SALT_ROUNDS` | No | `10` | Password hashing rounds |
| `CLIP_TTL_SECONDS` | No | `900` | Clip expiration (15 min) |
| `RATE_LIMIT_CREATE_PER_HOUR` | No | `30` | Create rate limit |
| `RATE_LIMIT_EDIT_PER_MIN` | No | `60` | Edit rate limit |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend API URL |
| `VITE_SOCKET_URL` | **Yes** | WebSocket URL (same as API) |

---

## Custom Domain Setup

### Vercel (Frontend)
1. Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

### Render (Backend)
1. Service Settings → Custom Domains
2. Add your API subdomain (e.g., `api.clipsnap.com`)
3. Configure DNS as instructed
4. Update `FRONTEND_ORIGIN` to use new domain

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_ORIGIN` exactly matches your Vercel URL (no trailing slash)
- Redeploy backend after changing

### WebSocket Connection Failed
- Render free tier may sleep after inactivity
- First connection might take 10-30 seconds
- Consider upgrading to paid tier for always-on

### MongoDB Connection Issues
- Verify IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure password has no special URL characters (encode if needed)

### Build Failures
- Check Node.js version compatibility (>=18)
- Review build logs for missing dependencies
- Ensure `client/` and `server/` have their own `package.json`

---

## Performance Optimization (Optional)

1. **Enable Render Auto-Scaling** (paid tier)
2. **Use MongoDB Atlas Dedicated Cluster** for production
3. **Add CDN** (Cloudflare) in front of Vercel
4. **Monitor with** Render Metrics + MongoDB Atlas monitoring
