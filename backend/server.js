require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { Policy } = require('./models/Schemas');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        seedPolicies(); 
    })
    .catch(err => console.error("MongoDB Connection Error:", err));

// Initial Policy Seeding (Instruction 3 & 4.4)
async function seedPolicies() {
    try {
        const count = await Policy.countDocuments();
        if (count === 0) {
            const categories = [
                "Graphic Violence", 
                "Hate Symbols", 
                "Self-Harm", 
                "Extremist Propaganda", 
                "Weapons & Contraband", 
                "Harassment & Humiliation"
            ];
            const seeds = categories.map(c => ({ 
                category: c, 
                threshold: 80, 
                behavior: 'Auto-Block',
                enabled: true 
            }));
            await Policy.insertMany(seeds);
            console.log("Default Policies Seeded.");
        }
    } catch (err) {
        console.error("Policy Seeding Failed:", err);
    }
}

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Check for Secret on startup
    if(!process.env.JWT_SECRET) console.log("WARNING: JWT_SECRET IS NULL");
});