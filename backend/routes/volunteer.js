const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Report = require("../models/report");
const { verifyToken, authorize } = require("../middleware/auth");

// -----------------------------
// VIEW VOLUNTEER ASSIGNED TASKS
// -----------------------------
router.get("/volunteer/tasks", verifyToken, authorize("volunteer", "admin"), async (req, res) => {
  try {
    const tasks = await Report.find({ assignedTo: req.userId });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -----------------------------
// VOLUNTEER ACCEPTS A TASK
// -----------------------------
router.patch("/volunteer/tasks/:id/accept", verifyToken, authorize("volunteer"), async (req, res) => {
  try {
    const reportId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, message: "Invalid report ID" });
    }

    const updated = await Report.findByIdAndUpdate(
      reportId,
      { assignedTo: req.userId, status: "assigned" },
      { new: true }
    );

    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -----------------------------
// VOLUNTEER MARKS TASK AS RESOLVED
// -----------------------------
router.patch("/volunteer/tasks/:id/resolve", verifyToken, authorize("volunteer", "admin"), async (req, res) => {
  try {
    const reportId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, message: "Invalid report ID" });
    }

    const updated = await Report.findByIdAndUpdate(
      reportId,
      { status: "resolved" },
      { new: true }
    );

    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
