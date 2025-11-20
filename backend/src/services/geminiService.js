const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('⚠️  Warning: Gemini API key not configured. Set GEMINI_API_KEY in .env file.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Gemini Service
 * Handles AI-powered lead scoring and analysis
 */

const geminiService = {
    /**
     * Score a lead based on their information
     * Returns a score from 0.0-1.0
     */
    async scoreLead(lead) {
        if (!genAI) {
            console.warn('Gemini not configured, returning default score');
            return 0.5; // Default neutral score
        }

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `Score lead based on profile traits. Analyze this real estate lead and provide a quality score from 0.0 to 1.0.

Lead Profile:
- Name: ${lead.getFullName ? lead.getFullName() : `${lead.first_name} ${lead.last_name}`}
- Email: ${lead.email ? 'Provided' : 'Not provided'}
- Phone: ${lead.phone ? 'Provided' : 'Not provided'}
- Property Type: ${lead.property_type || lead.propertyType || 'Not specified'}
- Budget: ${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
- Timeline: ${lead.timeline || 'Not specified'}
- Location: ${lead.address || 'Not specified'}
- GDPR Consent: ${lead.gdpr_consent ? 'Yes' : 'No'}
- Notes: ${lead.notes || 'None'}

Scoring Criteria (0.0 = lowest, 1.0 = highest):
- Contact completeness (email + phone): 0.3 weight
- Budget clarity and realism: 0.25 weight
- Timeline urgency (immediate > 3 months > 6+ months): 0.2 weight
- Property type specificity: 0.15 weight
- GDPR consent: 0.1 weight

Respond with ONLY a decimal number between 0.0 and 1.0 (e.g., 0.75), nothing else.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            // Extract decimal number from response
            const scoreMatch = text.match(/0?\.\d+|1\.0+|1|0/);
            const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0.5;

            // Clamp between 0.0-1.0
            return Math.min(1.0, Math.max(0.0, score));

        } catch (error) {
            console.error('Error scoring lead with Gemini:', error.message);
            return 0.5; // Default score on error
        }
    },

    /**
     * Analyze a conversation transcript
     * Returns insights and updated lead score
     */
    async analyzeConversation(lead, transcript) {
        if (!genAI) {
            throw new Error('Gemini API not configured');
        }

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `Analyze this conversation with a real estate lead and provide:
1. A new score (0-100)
2. Key insights
3. Recommended next steps

Lead: ${lead.getFullName()}
Current Score: ${lead.score}

Conversation Transcript:
${transcript}

Respond in JSON format:
{
  "score": <number>,
  "insights": "<string>",
  "nextSteps": "<string>",
  "sentiment": "positive|neutral|negative"
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            // Extract JSON from response (remove markdown code blocks if present)
            const jsonText = text.replace(/```json\n?|\n?```/g, '');
            return JSON.parse(jsonText);

        } catch (error) {
            console.error('Error analyzing conversation:', error.message);
            throw error;
        }
    }
};

module.exports = geminiService;
