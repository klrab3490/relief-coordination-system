const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const { verifyToken, authorize } = require("../middleware/auth");

// -----------------------------
// GET USER PROFILE BY ID
// -----------------------------
router.get("/users/profile/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// -----------------------------
// UPDATE USER LOCATION
// -----------------------------
router.patch("/users/location/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { lng, lat } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Validate coordinates
    if (typeof lng !== "number" || typeof lat !== "number") {
      return res.status(400).json({
        message: "Location must include numeric lng and lat fields.",
      });
    }

    const locationData = {
      type: "Point",
      coordinates: [lng, lat],
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { location: locationData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "Location updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
