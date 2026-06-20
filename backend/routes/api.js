const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const modController = require('../controllers/modController');
const { User, Policy, Submission, Appeal } = require('../models/Schemas');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * ==========================================
 * 1. AUTHENTICATION & IDENTITY (Instruction 5)
 * ==========================================
 */

// REGISTRATION: Blocks duplicate identities
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!process.env.JWT_SECRET) return res.status(500).json({ msg: 'Server configuration error' });

        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (existingUser) return res.status(400).json({ msg: 'This identity already exists. Choose another username.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role: role || 'user' });
        await user.save();

        res.json({ msg: "Registration successful. You may now sign in." });
    } catch (err) {
        res.status(500).json({ msg: 'Internal server error during account creation' });
    }
});

// LOGIN: Enforces role matching and functional 'Remember Me' logic
router.post('/login', async (req, res) => {
    try {
        const { username, password, role, remember } = req.body; 
        const user = await User.findOne({ username });
        
        if (!user) return res.status(400).json({ msg: 'Invalid credentials. User not found.' });

        if (user.role !== role) {
            const displayRole = role === 'admin' ? 'Administrator' : 'Standard User';
            return res.status(403).json({ msg: `Access Denied: This account is not registered as a ${displayRole}.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials. Password incorrect.' });

        const tokenExpiry = remember ? '30d' : '1d';
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
        
        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ msg: 'Server error during login process' });
    }
});

// FORGET PASSWORD: Quick Reset Logic
router.post('/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ msg: "Security error: Identity could not be verified." });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ msg: "Password successfully updated. Access restored." });
    } catch (err) {
        res.status(500).json({ msg: "Password reset failed." });
    }
});

/**
 * ==========================================
 * 2. SUBMISSIONS & HISTORY (Instruction 4.1 & 4.2)
 * ==========================================
 */

router.post('/submit', auth, modController.submitContent);

// HISTORY: Integrated role-based visibility and Advanced Filtering (Outcome/Category/Date)
router.get('/history', auth, async (req, res) => {
    try {
        const { outcome, category, date } = req.query;
        let query = req.user.role === 'admin' ? {} : { userId: req.user.id };
        
        if (outcome) query.outcome = outcome;
        if (category) query["results.category"] = category;
        if (date) query.createdAt = { $gte: new Date(date) };

        const history = await Submission.find(query).sort({ createdAt: -1 }).populate('userId', 'username');
        res.json(history);
    } catch (err) { 
        res.status(500).json({ msg: "Failed to fetch log history" }); 
    }
});

// PURGE: Admin-only deletion of records
router.delete('/submissions/:id', [auth, adminOnly], async (req, res) => {
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.json({ msg: "Entry successfully purged from system." });
    } catch (err) {
        res.status(500).json({ msg: "Delete operation failed." });
    }
});

/**
 * ==========================================
 * 3. APPEAL WORKFLOW (Instruction 4.3)
 * ==========================================
 */

// USER: File a new appeal against Flagged or Blocked outcome
router.post('/appeals', auth, async (req, res) => {
    try {
        const { submissionId, justification } = req.body;
        const sub = await Submission.findById(submissionId);
        
        if (!sub) return res.status(404).json({ msg: "Submission not found" });
        if (sub.outcome === 'Approved') return res.status(400).json({ msg: "Cannot appeal approved content" });

        const appeal = new Appeal({ submissionId, userId: req.user.id, justification });
        await appeal.save();

        sub.appealStatus = 'Pending';
        await sub.save();
        res.json({ msg: "Appeal filed successfully. Awaiting review." });
    } catch (err) { 
        res.status(500).json({ msg: "Failed to file appeal." }); 
    }
});

// ADMIN: View pending queue
router.get('/appeals/queue', [auth, adminOnly], async (req, res) => {
    try {
        const queue = await Appeal.find({ status: 'Pending' })
            .populate('submissionId')
            .populate('userId', 'username');
        res.json(queue);
    } catch (err) { res.status(500).json({ msg: "Failed to load queue." }); }
});

/**
 * INSTRUCTION 4.3: APPEAL RESOLUTION (FULL INTEGRATION)
 * Administrators review each appeal and either accept or reject it, 
 * with the option to attach a written response. 
 * Upon acceptance, the submission verdict is overridden to Approved.
 */
router.put('/appeals/:id', [auth, adminOnly], async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const appeal = await Appeal.findById(req.params.id);
        const submission = await Submission.findById(appeal.submissionId);

        if (!appeal || !submission) return res.status(404).json({ msg: "Log entry not found" });

        // 1. Update the Appeal Record with the Written Response (Instruction 4.3)
        appeal.status = status;
        appeal.adminResponse = adminResponse || "Automatic system resolution.";
        await appeal.save();

        // 2. Update the Submission Lifecycle State
        submission.appealStatus = status;

        /**
         * INSTRUCTION 4.3: VERDICT OVERRIDE Logic
         * Acceptance of an appeal overrides the original AI verdict to 'Approved'.
         */
        if (status === 'Accepted') {
            submission.outcome = 'Approved'; 
        }
        
        await submission.save();

        res.json({ msg: `VERDICT OVERRIDDEN: ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Override logic failed" });
    }
});

/**
 * ==========================================
 * 4. POLICIES & ENHANCED ANALYTICS (Instruction 4.4 & 4.5)
 * ==========================================
 */

router.get('/policies', auth, async (req, res) => {
    try {
        const policies = await Policy.find();
        res.json(policies);
    } catch (err) { res.status(500).json({ msg: 'Failed to fetch policies' }); }
});

router.put('/policies/:id', [auth, adminOnly], async (req, res) => {
    try {
        const updated = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ msg: 'Failed to update policy' }); }
});

// ENHANCED ANALYTICS ENGINE (Requirement 4.5)
router.get('/analytics', [auth, adminOnly], async (req, res) => {
    try {
        const total = await Submission.countDocuments();
        const blocked = await Submission.countDocuments({ outcome: 'Blocked' });
        const flagged = await Submission.countDocuments({ outcome: 'Flagged' });
        
        // 1. Appeal Stats Breakdown
        const totalAppeals = await Appeal.countDocuments();
        const acceptedAppeals = await Appeal.countDocuments({ status: 'Accepted' });
        const rejectedAppeals = await Appeal.countDocuments({ status: 'Rejected' });
        const resolutionRate = totalAppeals > 0 ? Math.round(((acceptedAppeals + rejectedAppeals) / totalAppeals) * 100) : 0;

        // 2. Ranked User Lists (Requirement 4.5 Point 4)
        const userStats = await Submission.aggregate([
            { $group: { 
                _id: "$userId", 
                totalSubmissions: { $sum: 1 },
                violations: { $sum: { $cond: [{ $eq: ["$outcome", "Blocked"] }, 1, 0] } }
            }},
            { $sort: { totalSubmissions: -1 } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" }
        ]);

        // 3. Submission Volume Over Time (Requirement 4.5 Point 1)
        const timeSeries = await Submission.aggregate([
            { $group: {
                _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } },
            { $limit: 7 }
        ]);

        res.json({ 
            total, blocked, flagged, 
            appeals: { 
                total: totalAppeals, 
                accepted: acceptedAppeals, 
                rejected: rejectedAppeals, 
                rate: resolutionRate 
            },
            rankedUsers: userStats,
            volumeOverTime: timeSeries
        });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ msg: 'Analytics node error' }); 
    }
});

module.exports = router;