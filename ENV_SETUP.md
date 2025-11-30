# 🔧 Environment Variables Setup Guide

## ✅ What Just Got Updated

I've updated your environment configuration files to support production deployment with proper CORS security.

---

## 📂 Files Updated/Created

### **Backend:**
1. ✅ `backend/.env` - Updated with new `ALLOWED_ORIGINS` variable
2. ✅ `backend/.env.example` - Complete template with all variables documented
3. ✅ `backend/.gitignore` - Created to ignore .env and uploads/

### **Frontend:**
1. ✅ `frontend/.env` - Added helpful comments
2. ✅ `frontend/.env.example` - Updated with correct variable name (`VITE_BACKEND_URL`)

---

## 🆕 New Environment Variable

### **Backend `ALLOWED_ORIGINS`**

**Purpose:** Controls which frontend URLs can access your backend API (CORS security)

**Development (current setup):**
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Production (when deployed):**
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
```

**Why this matters:**
- ✅ Prevents unauthorized websites from accessing your API
- ✅ Allows multiple frontend domains (staging + production)
- ✅ Required for WebSocket (Socket.IO) connections to work

---

## 📋 Current Environment Variables

### **Backend (.env):**
```bash
# Database
MONGODB_URI=mongodb+srv://...         # ✅ Already configured

# Server
PORT=5000                              # ✅ Port number
NODE_ENV=development                   # ✅ development or production

# Security
JWT_SECRET=...                         # ✅ Access token secret
JWT_REFRESH_SECRET=...                 # ✅ Refresh token secret
ALLOWED_ORIGINS=http://localhost:5173  # 🆕 NEW! CORS allowed origins

# Optional (for production)
CLOUDINARY_CLOUD_NAME=                 # Cloud image storage
CLOUDINARY_API_KEY=                    # Cloudinary API key
CLOUDINARY_API_SECRET=                 # Cloudinary secret
```

### **Frontend (.env):**
```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000  # ✅ Points to backend
```

---

## 🚀 How to Use (Different Scenarios)

### **Scenario 1: Local Development (Current)**
✅ **No changes needed!** Everything is already configured.

**Backend (.env):**
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env):**
```bash
VITE_BACKEND_URL=http://localhost:5000
```

---

### **Scenario 2: Deploy to Production**

#### **Step 1: Deploy Backend to Railway**

**Railway Environment Variables:**
```bash
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=production
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ALLOWED_ORIGINS=https://your-app.vercel.app  # ⬅️ Your frontend URL
```

Railway gives you: `https://your-backend.railway.app`

#### **Step 2: Deploy Frontend to Vercel**

**Vercel Environment Variables:**
```bash
VITE_BACKEND_URL=https://your-backend.railway.app  # ⬅️ Your backend URL
```

Vercel gives you: `https://your-app.vercel.app`

#### **Step 3: Update Backend ALLOWED_ORIGINS**

Go back to Railway and update:
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Done!** Your app is live and secure.

---

### **Scenario 3: Multiple Environments (Staging + Production)**

You can allow multiple frontend URLs:

```bash
ALLOWED_ORIGINS=https://staging.yourdomain.com,https://yourdomain.com,https://your-app.vercel.app
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env` files out of Git (already configured in .gitignore)
- ✅ Use different JWT secrets for development and production
- ✅ Set `NODE_ENV=production` in production
- ✅ Only add trusted domains to `ALLOWED_ORIGINS`
- ✅ Use `.env.example` files as templates (safe to commit)

### ❌ DON'T:
- ❌ Never commit `.env` files to Git
- ❌ Don't use weak JWT secrets (minimum 32 characters)
- ❌ Don't allow `*` (all origins) in production
- ❌ Don't share `.env` files via email/Slack
- ❌ Don't reuse the same secrets across projects

---

## 🧪 Testing Your Setup

### **1. Test CORS is Working:**

**Start both servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Open browser console (F12) and check:**
- ✅ No CORS errors when logging in
- ✅ API calls succeed
- ✅ WebSocket connects (green badge in chat)

### **2. Test CORS Blocking (Security Check):**

Open browser console and try:
```javascript
fetch('http://localhost:5000/api/reports', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer fake-token' }
})
```

From a different website (e.g., google.com). You should see:
❌ **CORS error** - This is correct! It means unauthorized sites can't access your API.

---

## 🆘 Troubleshooting

### **Issue: "Not allowed by CORS" error**

**Symptoms:**
- Frontend can't connect to backend
- API calls fail with CORS error

**Solution:**
1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Ensure no trailing slashes: `http://localhost:5173` ✅ not `http://localhost:5173/` ❌
3. Restart backend server after changing `.env`

### **Issue: WebSocket won't connect**

**Symptoms:**
- Red "Disconnected" badge in chat
- Console shows Socket.IO connection error

**Solution:**
1. Verify `VITE_BACKEND_URL` is correct in frontend `.env`
2. Check `ALLOWED_ORIGINS` includes frontend URL in backend `.env`
3. Ensure backend server is running
4. Check browser console for specific error messages

### **Issue: Changes to .env not working**

**Solution:**
1. Restart the development server
2. For Vite (frontend), sometimes need to clear cache: `rm -rf node_modules/.vite`
3. Verify variable name is correct (`VITE_` prefix required for frontend)

---

## 📚 Reference Links

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Express CORS Docs](https://expressjs.com/en/resources/middleware/cors.html)
- [Socket.IO CORS Guide](https://socket.io/docs/v4/handling-cors/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎯 Quick Reference

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| `MONGODB_URI` | Backend | Database connection | `mongodb+srv://...` |
| `PORT` | Backend | Server port | `5000` |
| `NODE_ENV` | Backend | Environment mode | `development` or `production` |
| `JWT_SECRET` | Backend | Access token secret | Random 32+ chars |
| `JWT_REFRESH_SECRET` | Backend | Refresh token secret | Random 32+ chars |
| `ALLOWED_ORIGINS` | Backend | **🆕 CORS allowed domains** | `http://localhost:5173` |
| `VITE_BACKEND_URL` | Frontend | Backend API URL | `http://localhost:5000` |

---

**Your environment is now production-ready!** 🎉
