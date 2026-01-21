const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const DailyLog = require("../models/dailyLog.js");
const router = express.Router();

// POST /dailylogs
// Create a daily log
router.post("/", verifyToken, async (req, res) => {
    try {
        req.body.userId = req.user._id;
        const dailyLog = await DailyLog.create(req.body);
        // .doc is used to populate the userId
        dailyLog._doc.userId = req.user;
        res.status(201).json(dailyLog);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET /dailylogs
// Read all daily logs
router.get("/", verifyToken, async (req, res) => {
    try {
        const dailyLogs = await DailyLog.find({})
            .populate("userId")
            .sort({ createdAt: "desc" });
        res.status(200).json(dailyLogs);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET /dailylogs/:logId
// Read a daily log
router.get('/:logId', verifyToken, async (req, res) => {
    try {
        // populate userId of a daily log
        const dailyLog = await DailyLog.findById(req.params.logId).populate('userId');
        res.status(200).json(dailyLog);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// PUT /dailylogs/:logId
// Update a daily log
router.put("/:logId", verifyToken, async (req, res) => {
    try {
        // Find the daily log:
        const dailyLog = await DailyLog.findById(req.params.logId);

        // Check permissions:
        if (!dailyLog.userId.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        // Update daily log:
        const updatedDailyLog = await DailyLog.findByIdAndUpdate(
            req.params.logId,
            req.body,
            { new: true }
        );

        // Append req.user to the userId property:
        updatedDailyLog._doc.userId = req.user;

        // Issue JSON response:
        res.status(200).json(updatedDailyLog);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// DELETE /dailylogs/:logId
// Delete a daily log
router.delete("/:logId", verifyToken, async (req, res) => {
    try {
        const dailyLog = await DailyLog.findById(req.params.logId);

        if (!dailyLog.userId.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const deletedDailyLog = await DailyLog.findByIdAndDelete(req.params.logId);
        res.status(200).json(deletedDailyLog);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router;