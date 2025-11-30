const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middleware/auth");

// Check if Cloudinary is configured
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let storage;
let upload;

if (useCloudinary) {
  // ========================================
  // CLOUDINARY STORAGE (Production)
  // ========================================
  console.log("✅ Using Cloudinary for image uploads");

  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure Cloudinary storage for multer
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "relief-reports", // Cloudinary folder name
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        { width: 1500, height: 1500, crop: "limit" }, // Resize large images
        { quality: "auto" }, // Automatic quality optimization
      ],
      public_id: (req, file) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return "report-" + uniqueSuffix;
      },
    },
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
} else {
  // ========================================
  // LOCAL DISK STORAGE (Development)
  // ========================================
  console.log("⚠️  Using local disk storage for images (development mode)");
  console.log("   For production, configure Cloudinary environment variables");

  // Configure local disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  // File filter - only allow images
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  };

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
  });
}

// -----------------------------
// UPLOAD IMAGE ENDPOINT
// -----------------------------
router.post("/upload/image", verifyToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    let imageUrl;

    if (useCloudinary) {
      // Cloudinary returns the full URL
      imageUrl = req.file.path; // Cloudinary secure URL
    } else {
      // Local storage - return relative path
      imageUrl = `/uploads/${req.file.filename}`;
    }

    res.status(200).json({
      message: "Image uploaded successfully.",
      imageUrl: imageUrl,
      storage: useCloudinary ? "cloudinary" : "local",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading image." });
  }
});

// -----------------------------
// DELETE IMAGE (Optional - for cleanup)
// -----------------------------
router.delete("/upload/image", verifyToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required." });
    }

    if (useCloudinary) {
      // Extract public_id from Cloudinary URL
      const cloudinary = require("cloudinary").v2;
      const urlParts = imageUrl.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = "relief-reports/" + publicIdWithExt.split(".")[0];

      await cloudinary.uploader.destroy(publicId);
      res.status(200).json({ message: "Image deleted from Cloudinary." });
    } else {
      // Local storage - delete file from disk
      const fs = require("fs");
      const filePath = path.join(__dirname, "..", imageUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.status(200).json({ message: "Image deleted from local storage." });
      } else {
        res.status(404).json({ message: "Image not found." });
      }
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting image." });
  }
});

module.exports = router;
