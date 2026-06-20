const axios = require('axios');

/**
 * Mistral AI Moderation Engine
 * Uses Pixtral 12B Vision model to analyze images against active policies.
 * 
 * @param {string} imageUrl - The public URL of the image to scan.
 * @param {Array} activePolicies - List of policy objects from the database.
 * @returns {Object} { aiResult, finalOutcome }
 */
exports.analyzeImage = async (imageUrl, activePolicies) => {
    try {
        // 1. Prepare the dynamic prompt based on current active categories
        const categoriesList = activePolicies.map(p => p.category).join(", ");
        
        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: "pixtral-12b-2409", // Mistral's flagship vision model
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: `Act as a strict Content Moderation AI. Analyze this image for the following categories: ${categoriesList}.
                                
                                Instructions:
                                - Provide a confidence score from 0 to 100 for each category.
                                - Provide a brief, professional reasoning for each score.
                                - Return ONLY a valid JSON object.
                                - Use the category names exactly as provided in the list.
                                
                                Output Format:
                                {
                                  "Category Name": {"confidence": 0-100, "reasoning": "string"}
                                }` 
                            },
                            { 
                                type: "image_url", 
                                image_url: imageUrl 
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0 // Ensure consistent, non-creative safety results
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 2. Parse Mistral response
        const rawContent = response.data.choices[0].message.content;
        const aiResult = JSON.parse(rawContent);
        
        // 3. Modera Enforcement Logic (Requirement 4.2)
        // Order of severity: Blocked > Flagged > Approved
        let finalOutcome = 'Approved';
        
        activePolicies.forEach(policy => {
            // Find the corresponding detection in AI results
            const detection = aiResult[policy.category] || { confidence: 0 };

            if (Number(detection.confidence) >= policy.threshold) {
                // If any category hits Auto-Block, the whole asset is Blocked
                if (policy.behavior === 'Auto-Block') {
                    finalOutcome = 'Blocked';
                } 
                // If it hits Flag for Review, and we aren't already Blocked, set to Flagged
                else if (policy.behavior === 'Flag for Review' && finalOutcome !== 'Blocked') {
                    finalOutcome = 'Flagged';
                }
            }
        });

        // Return formatted data for the controller to save
        return { aiResult, finalOutcome };

    } catch (err) {
        console.error("Mistral Moderation Service Error:", err.response?.data || err.message);
        // This error is caught by the Frontend, which then shows the Tailwind Alert
        throw new Error("AI Moderation Node failed to respond.");
    }
};