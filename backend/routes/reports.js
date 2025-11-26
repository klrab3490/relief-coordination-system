const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Report = require('../models/report');
const { verifyToken, authorize } = require('../middleware/auth');

// -----------------------------
// CREATE A REPORT
// -----------------------------
router.post('/reports/create', verifyToken, async (req, res) => {
    try {
        const { title, description, category, imageUrl, lng, lat } = req.body;

        if (!title || !description || !category || lng === undefined || lat === undefined) {
            return res.status(400).json({ message: "Missing or invalid required fields." });
        }

        const report = await Report.create({
            title,
            description,
            category,
            imageUrl,
            location: {
                type: "Point",
                coordinates: [lng, lat]
            },
            reportedBy: req.user.id
        })
        res.status(201).json({
            message: "Report created successfully.",
            report: {
                id: report._id,
                title: report.title,
                description: report.description,
                category: report.category,
                imageUrl: report.imageUrl,
                location: report.location,
                reportedBy: report.reportedBy,
                createdAt: report.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// -----------------------------
// GET ALL REPORTS
// -----------------------------
router.get('/reports', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reportedBy', 'username email')
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 });
        res.status(200).json({ 
            message: "Reports fetched successfully.",
            reports
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// -----------------------------
// GET REPORT BY ID
// -----------------------------
router.get('/reports/:id', verifyToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid report ID." });
        }

        const report = await Report.findById(req.params.id)
            .populate('reportedBy', 'username email')
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 });

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        res.status(200).json({ 
            message: "Report fetched successfully.",
            report
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// -----------------------------
// GET REPORT BY ID
// -----------------------------
router.get('/reports/nearby', verifyToken, async (req, res) => {
    try {
        const { lng, lat, radius = 5000 } = req.query;

        if (!lng || !lat || !radius) {
            return res.status(400).json({ message: "Missing required query parameters." });
        }

        const reports = await Report.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [ parseFloat(lng), parseFloat(lat) ] },
                    $maxDistance: parseInt(radius)
                }
            }
        });

        res.status(200).json({
            message: "Nearby reports fetched successfully.",
            reports
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// -----------------------------
// UPDATE REPORT STATUS (VOLUNTEER/ADMIN)
// -----------------------------
router.patch('/reports/:id/status', verifyToken, authorize('volunteer', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;

        const vaildStatus = ["reported", "reviewing", "assigned", "resolving", "resolved"];
        if (!vaildStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid report ID." });
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.status(200).json({
            message: "Report status updated successfully.",
            report
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// -----------------------------
// ASSIGN REPORT TO VOLUNTEER (VOLUNTEER/ADMIN)
// -----------------------------
router.patch('/reports/:id/assign', verifyToken, authorize('volunteer', 'admin'), async (req, res) => {
    try {
        const { volunteerId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(volunteerId)) {
            return res.status(400).json({ message: "Invalid report ID or volunteer ID." });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { assignedTo: volunteerId, status: 'assigned' },
            { new: true }
        );

        res.status(200).json({
            message: "Report assigned to volunteer successfully.",
            report: updatedReport
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// -----------------------------
// DELETE REPORT (ADMIN ONLY)
// -----------------------------
router.delete('/reports/:id', verifyToken, authorize('admin'), async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Report deleted successfully." });
    } catch (error) {
       res.status(500).json({ message: "Internal server error." }); 
    }
});

module.exports = router;