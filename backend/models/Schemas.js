const mongoose = require('mongoose');

/**
 * 1. USER SCHEMA
 * Manages identity and role-based access (Instruction 5).
 */
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

/**
 * 2. POLICY SCHEMA
 * Allows administrators to fine-tune AI sensitivity (Instruction 4.4).
 */
const PolicySchema = new mongoose.Schema({
    category: { type: String, required: true }, // e.g., "Graphic Violence"
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 70 }, // Default sensitivity
    behavior: { type: String, enum: ['Auto-Block', 'Flag for Review'], default: 'Auto-Block' }
});

/**
 * 3. SUBMISSION SCHEMA
 * Records individual image screenings and their outcomes (Instruction 4.1 & 4.2).
 */
const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String, required: true },
    outcome: { type: String, enum: ['Approved', 'Flagged', 'Blocked'], required: true },
    results: [{
        category: String,
        confidence: Number,
        reasoning: String
    }], // Per-category breakdown (Instruction 3)
    policySnapshot: Array, // Stores the exact policy active during this submission
    appealStatus: { 
        type: String, 
        enum: ['None', 'Pending', 'Accepted', 'Rejected'], 
        default: 'None' 
    }, // Tracks the workflow for disputed verdicts (Instruction 4.3)
    createdAt: { type: Date, default: Date.now }
});

/**
 * 4. APPEAL SCHEMA
 * Manages the structured appeal process for flagged/blocked content (Instruction 4.3).
 */
const AppealSchema = new mongoose.Schema({
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    justification: { type: String, required: true }, // User's explanation for the dispute
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'], 
        default: 'Pending' 
    },
    adminResponse: { type: String, default: "" }, // Admin's feedback upon review
    createdAt: { type: Date, default: Date.now }
});

// Exporting all models for use in controllers and routes
module.exports = {
    User: mongoose.model('User', UserSchema),
    Policy: mongoose.model('Policy', PolicySchema),
    Submission: mongoose.model('Submission', SubmissionSchema),
    Appeal: mongoose.model('Appeal', AppealSchema)
};