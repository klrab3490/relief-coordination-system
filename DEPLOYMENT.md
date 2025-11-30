# 🚀 Production Deployment Guide

## Overview
This guide covers deploying the Relief Coordination System to production with proper cloud services.

---

## 🔧 Required Changes for Production

### 1. Image Storage Options

#### **Option A: Cloudinary (Easiest - Recommended)**

1. **Sign up at [cloudinary.com](https://cloudinary.com)** (Free tier: 25GB storage)

2. **Install Cloudinary SDK:**
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

3. **Update `backend/routes/upload.js`:**
```javascript
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Cloudinary storage instead of local disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "relief-reports",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});
```

4. **Add to `backend/.env`:**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### **Option B: AWS S3**
- More control, but requires AWS account
- Use `multer-s3` package
- Configure S3 bucket with public read access

#### **Option C: Keep Local Storage (Only for VPS/Railway/Render)**
- ✅ Works on: Railway, Render, DigitalOcean, AWS EC2
- ❌ Doesn't work on: Vercel, Netlify (serverless)
- Current implementation works as-is

---

## 🌐 Deployment Platforms

### **Recommended Setup:**
- **Frontend:** Vercel (fast, free, auto-deploys from Git)
- **Backend:** Railway (persistent storage, WebSocket support)
- **Database:** MongoDB Atlas (already configured ✅)

---

## 📦 Backend Deployment (Railway)

### **Why Railway?**
- ✅ WebSocket support (Socket.IO works)
- ✅ Persistent disk storage (for local image uploads)
- ✅ Environment variables
- ✅ Auto-deploy from Git
- ✅ Free tier available

### **Steps:**

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project → Deploy from GitHub**

3. **Configure Environment Variables:**
```bash
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

4. **Add `backend/railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

5. **Deploy:**
   - Push to GitHub
   - Railway auto-deploys
   - Note your backend URL: `https://your-app.railway.app`

---

## 🎨 Frontend Deployment (Vercel)

### **Why Vercel?**
- ✅ Built for React/Vite
- ✅ Auto-deploy from Git
- ✅ Global CDN
- ✅ Free SSL certificate
- ✅ Environment variables

### **Steps:**

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import GitHub Repository**

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
```bash
VITE_BACKEND_URL=https://your-backend.railway.app
```

5. **Deploy:**
   - Click "Deploy"
   - Get your URL: `https://your-app.vercel.app`

6. **Update Backend ALLOWED_ORIGINS:**
   - Go to Railway dashboard
   - Add `https://your-app.vercel.app` to `ALLOWED_ORIGINS`
   - Redeploy backend

---

## 🔐 Security Checklist for Production

### **Backend:**
- ✅ CORS configured with specific origins (done ✅)
- ✅ Rate limiting enabled (already configured ✅)
- ✅ Helmet security headers (already configured ✅)
- ✅ Environment variables in `.env` (not committed to Git)
- ⚠️ **TODO:** Add HTTPS redirect
- ⚠️ **TODO:** Use stronger JWT secrets (32+ characters)

### **Frontend:**
- ✅ Environment variables configured
- ✅ API URL points to production backend
- ⚠️ **TODO:** Add error boundaries
- ⚠️ **TODO:** Add loading states for all async operations

### **Database:**
- ✅ MongoDB Atlas (cloud-hosted)
- ⚠️ **TODO:** Enable MongoDB authentication
- ⚠️ **TODO:** Whitelist specific IPs in MongoDB Atlas

---

## 🧪 Testing Production Setup Locally

Before deploying, test production configuration locally:

### **Backend:**
```bash
cd backend
cp .env .env.local
# Edit .env.local with production settings
NODE_ENV=production npm start
```

### **Frontend:**
```bash
cd frontend
cp .env .env.production
# Edit .env.production
npm run build
npm run preview
```

---

## 🔄 Alternative: Same-Domain Deployment

If you want backend and frontend on same domain:

### **Option 1: Vercel Rewrites (Frontend + Backend)**

**frontend/vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.railway.app/api/:path*"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://your-backend.railway.app/uploads/:path*"
    }
  ]
}
```

Then use:
```bash
VITE_BACKEND_URL=  # Empty - same domain
```

### **Option 2: Single Server (VPS)**
- Deploy both frontend and backend on same server
- Use Nginx reverse proxy:
  - `/api/*` → `localhost:5000`
  - `/*` → Frontend static files

---

## 🚨 Common Production Issues & Fixes

### **Issue 1: WebSocket Connection Fails**
**Symptom:** Chat doesn't connect
**Fix:**
```typescript
// frontend/src/context/ChatContext.tsx
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const newSocket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // Fallback to polling
  secure: true, // Use wss:// for HTTPS
});
```

### **Issue 2: CORS Errors**
**Symptom:** API calls fail with CORS error
**Fix:**
1. Add frontend URL to `ALLOWED_ORIGINS`
2. Ensure no trailing slashes: `https://app.com` not `https://app.com/`
3. Restart backend after environment variable change

### **Issue 3: Images Don't Load**
**Symptom:** Uploaded images return 404
**Fix:**
- If using local storage: Ensure `uploads/` directory exists
- If using Cloudinary: Check API credentials
- Verify `imageUrl` returned from upload API

### **Issue 4: Map Doesn't Load**
**Symptom:** Blank map on CreateReport page
**Fix:**
1. Check browser console for errors
2. Ensure Leaflet CSS is imported
3. Check if HTTPS (some browsers block geolocation on HTTP)

---

## 📊 Monitoring & Logs

### **Backend Logs (Railway):**
```bash
# View in Railway dashboard under "Deployments" tab
```

### **Frontend Logs (Vercel):**
```bash
# Build logs in Vercel dashboard
# Runtime errors in browser console
```

### **Database Monitoring (MongoDB Atlas):**
- Dashboard → Metrics
- Set up alerts for high CPU/memory usage

---

## 🎯 Post-Deployment Testing Checklist

- [ ] Can register new user
- [ ] Can login successfully
- [ ] JWT refresh works (wait 15+ minutes, app still works)
- [ ] Can create report with image upload
- [ ] Map loads and location selection works
- [ ] Uploaded images display correctly
- [ ] WebSocket chat connects (check green badge)
- [ ] Real-time messages work between different browsers
- [ ] Volunteer can accept/resolve tasks
- [ ] Admin can delete users/reports
- [ ] All protected routes redirect to login when logged out

---

## 💰 Estimated Costs

### **Free Tier (Good for MVP/Testing):**
- MongoDB Atlas: Free (512MB)
- Railway: Free ($5 credit/month)
- Vercel: Free (100GB bandwidth/month)
- Cloudinary: Free (25GB storage)
- **Total: $0/month** (within free limits)

### **Production Scale (~1000 users):**
- MongoDB Atlas: ~$10/month
- Railway: ~$10/month
- Vercel: Free (likely sufficient)
- Cloudinary: ~$15/month (if heavy image usage)
- **Total: ~$35/month**

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Socket.IO Production Guide](https://socket.io/docs/v4/server-deployment/)

---

## 📝 Final Notes

1. **Always test locally with production settings first**
2. **Keep `.env` files out of Git** (use `.env.example` for templates)
3. **Set up proper error logging** (consider Sentry for production)
4. **Enable HTTPS** (Vercel/Railway provide this automatically)
5. **Monitor your MongoDB usage** (Atlas free tier has 512MB limit)

**Your app is production-ready!** 🚀
