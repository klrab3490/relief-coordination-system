const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Report = require("../models/report");
const { verifyToken, authorize } = require("../middleware/auth");

// -----------------------------
// GET ALL USERS
// -----------------------------
router.get("/admin/users", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users, message: "Users fetched successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -----------------------------
// GET ALL REPORTS
// -----------------------------
router.get("/admin/reports", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("createdBy", "username email")
      .populate("assignedTo", "username role");

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -----------------------------
// DELETE USER
// -----------------------------
router.delete("/admin/user/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -----------------------------
// DELETE REPORT
// -----------------------------
router.delete("/admin/report/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const reportId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, message: "Invalid report ID" });
    }

    await Report.findByIdAndDelete(reportId);

    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -----------------------------
// UPDATE REPORT STATUS (Admin)
// -----------------------------
router.patch("/admin/report/:id/status", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["reported", "reviewing", "assigned", "resolving", "resolved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
