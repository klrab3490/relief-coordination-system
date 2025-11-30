# ☁️ Cloudinary Setup Guide

## ✅ Status: FULLY IMPLEMENTED

Cloudinary image storage is **fully implemented** with automatic fallback!

- ✅ Development: Uses local disk storage (`uploads/` folder)
- ✅ Production: Automatically uses Cloudinary if configured
- ✅ Smart detection: Checks for credentials at startup
- ✅ Bonus: Image delete endpoint included

---

## 🎯 How It Works

The system automatically detects which storage to use:

```javascript
// Checks for Cloudinary credentials
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  ✅ Use Cloudinary (production)
} else {
  ⚠️  Use local disk storage (development)
}
```

**When you start the backend, you'll see:**
```bash
✅ Using Cloudinary for image uploads
# OR
⚠️  Using local disk storage for images (development mode)
```

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Sign Up for Cloudinary**

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. **Free tier includes:**
   - 25 GB storage
   - 25 GB bandwidth/month
   - Image transformations
   - CDN delivery

### **Step 2: Get Your Credentials**

After signing up:
1. Go to **Dashboard**
2. You'll see:
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrst
   ```

### **Step 3: Add to Backend .env**

**Development (optional - local storage works fine):**
```bash
# Uncomment these lines in backend/.env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrst
```

**Production (Railway/Render/etc):**
Add these environment variables in your hosting platform:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrst
```

### **Step 4: Restart Backend**
```bash
cd backend
npm run dev
```

You should see:
```bash
✅ Using Cloudinary for image uploads
```

**Done!** Images now upload to Cloudinary instead of local storage.

---

## 📊 What You Get with Cloudinary

### **Automatic Features:**
- ✅ **CDN Delivery** - Images load faster globally
- ✅ **Auto Resizing** - Large images resized to max 1500x1500
- ✅ **Quality Optimization** - Automatic compression
- ✅ **Format Conversion** - WebP support for modern browsers
- ✅ **Secure URLs** - HTTPS by default
- ✅ **No Server Storage** - Works on serverless platforms (Vercel)

### **Example URLs:**

**Local Storage:**
```
http://localhost:5000/uploads/report-1234567890.jpg
```

**Cloudinary:**
```
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/relief-reports/report-1234567890.jpg
```

---

## 🧪 Testing

### **Test Upload:**
1. Create a report with an image
2. Check the response:
   ```json
   {
     "message": "Image uploaded successfully.",
     "imageUrl": "https://res.cloudinary.com/...",
     "storage": "cloudinary"  // ← Confirms it's using Cloudinary
   }
   ```

### **Test in Frontend:**
- Upload an image
- Check browser DevTools → Network tab
- Look for request to Cloudinary CDN
- Image should load from `res.cloudinary.com`

---

## 🔄 Switching Between Local and Cloudinary

**Want to use local storage again?**
```bash
# Just comment out Cloudinary vars in .env
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

**Want to use Cloudinary?**
```bash
# Uncomment the vars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrst
```

Restart the server - it auto-detects!

---

## 🗑️ Deleting Images

Bonus feature: Delete endpoint included!

```javascript
// DELETE /api/upload/image
fetch('/api/upload/image', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ imageUrl: 'url-to-delete' })
})
```

Works for both local and Cloudinary storage.

---

## 📈 Cloudinary Dashboard

After uploading images, check your Cloudinary dashboard:

1. **Media Library** - See all uploaded images
2. **Analytics** - Bandwidth usage, transformations
3. **Transformations** - Applied automatically (resize, quality)

All images are stored in the `relief-reports/` folder.

---

## 💰 Pricing (Free Tier Limits)

**Free Plan Includes:**
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month
- Users: Unlimited

**Estimated Capacity:**
- ~25,000 images (1 MB average)
- Good for up to 1,000 active users

**Upgrade needed when:**
- You exceed 25 GB bandwidth/month
- You need more than 25 GB storage

---

## 🚨 Troubleshooting

### **Issue: Still using local storage after adding credentials**

**Solution:**
1. Verify credentials are correct (no extra spaces)
2. Restart backend server
3. Check startup logs for "✅ Using Cloudinary"

### **Issue: Upload fails with Cloudinary**

**Solution:**
1. Check API credentials are valid
2. Verify Cloudinary dashboard → Settings → Security
3. Ensure "Unsigned uploads" is disabled
4. Check backend logs for specific error

### **Issue: Images don't load from Cloudinary**

**Solution:**
1. Check the imageUrl in the database
2. Should start with `https://res.cloudinary.com/`
3. Open the URL directly in browser
4. Check Cloudinary dashboard → Media Library

---

## 🎯 Production Deployment Checklist

When deploying to production:

- [ ] Sign up for Cloudinary
- [ ] Get credentials from dashboard
- [ ] Add credentials to production environment variables
- [ ] Deploy backend with new env vars
- [ ] Upload a test image
- [ ] Verify image loads from Cloudinary CDN
- [ ] Check Cloudinary dashboard shows the upload

---

## 📚 Advanced Configuration

Want more control? Update `backend/routes/upload.js`:

```javascript
transformation: [
  { width: 2000, height: 2000, crop: "limit" }, // Larger max size
  { quality: 80 }, // Fixed quality instead of "auto"
  { fetch_format: "auto" }, // Auto WebP conversion
],
```

See [Cloudinary Transformations Docs](https://cloudinary.com/documentation/image_transformations) for more options.

---

## ✨ Summary

**Current Status:**
- ✅ Cloudinary **FULLY IMPLEMENTED**
- ✅ Auto-detection based on environment variables
- ✅ Works in development (local) and production (Cloudinary)
- ✅ Delete endpoint included
- ✅ Automatic image optimization
- ✅ No code changes needed to switch

**To Enable:**
1. Sign up at cloudinary.com (free)
2. Add 3 environment variables
3. Restart backend
4. Done! 🎉

**Your app now supports both local and cloud storage!**
