const { Submission, Policy } = require('../models/Schemas');
const axios = require('axios');

exports.submitContent = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        // 1. Get active policies
        const activePolicies = await Policy.find({ enabled: true });
        if (activePolicies.length === 0) {
            return res.status(400).json({ msg: "No active moderation policies. Admin must enable them." });
        }

        // 2. Optimized Prompt for Accuracy
        const categoriesList = activePolicies.map(p => p.category).join(", ");
        
        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: "pixtral-12b-2409",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: `CRITICAL: You are a strict Content Safety Officer. 
                                Analyze this image for these categories: ${categoriesList}.
                                
                                RULES:
                                1. If you see even a hint of a weapon, violence, or hate, provide a confidence score above 80.
                                2. Return ONLY a valid JSON object.
                                3. Use EXACT category names as keys.
                                
                                Format:
                                {
                                  "Graphic Violence": {"confidence": 0-100, "reasoning": "why"},
                                  "Hate Symbols": {"confidence": 0-100, "reasoning": "why"},
                                  "Self-Harm": {"confidence": 0-100, "reasoning": "why"},
                                  "Extremist Propaganda": {"confidence": 0-100, "reasoning": "why"},
                                  "Weapons & Contraband": {"confidence": 0-100, "reasoning": "why"},
                                  "Harassment & Humiliation": {"confidence": 0-100, "reasoning": "why"}
                                }` 
                            },
                            { type: "image_url", image_url: imageUrl }
                        ]
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0 // Keep it strict and consistent
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiAnalysis = JSON.parse(response.data.choices[0].message.content);
        
        // --- LOGGING FOR DEBUGGING ---
        console.log("AI RAW ANALYSIS:", aiAnalysis);

        // 3. Modera Enforcement Logic
        let finalOutcome = 'Approved';
        let categoryResults = [];

        activePolicies.forEach(p => {
            // Find the category in AI results (handling slight naming variations)
            const aiKey = Object.keys(aiAnalysis).find(k => 
                k.toLowerCase().includes(p.category.toLowerCase().split(' ')[0])
            );
            
            const detection = aiAnalysis[aiKey] || { confidence: 0, reasoning: "Not detected" };

            // Logic Check
            if (Number(detection.confidence) >= p.threshold) {
                if (p.behavior === 'Auto-Block') {
                    finalOutcome = 'Blocked';
                } else if (p.behavior === 'Flag for Review' && finalOutcome !== 'Blocked') {
                    finalOutcome = 'Flagged';
                }
            }
            categoryResults.push({ category: p.category, ...detection });
        });

        // 4. Save Submission
        const newSubmission = new Submission({
            userId: req.user.id,
            imageUrl,
            outcome: finalOutcome,
            results: categoryResults,
            policySnapshot: activePolicies
        });

        await newSubmission.save();
        res.json(newSubmission);

    } catch (err) {
        console.error("Mistral Controller Error:", err.message);
        res.status(500).json({ msg: "AI analysis engine error. Check backend terminal for logs." });
    }
};