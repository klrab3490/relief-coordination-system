const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middleware/auth");

// Configure multer for image uploads
const storage = multer.diskStorage({
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
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// -----------------------------
// UPLOAD IMAGE
// -----------------------------
router.post("/upload/image", verifyToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Return the file URL (accessible via /uploads/filename)
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "Image uploaded successfully.",
      imageUrl: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image." });
  }
});

module.exports = router;
