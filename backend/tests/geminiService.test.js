const geminiService = require('../src/services/geminiService');

/**
 * Gemini Service Tests
 * Tests for AI lead scoring functionality
 */

// Mock Google Generative AI
jest.mock('@google/generative-ai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

describe('Gemini Service', () => {
    const originalApiKey = process.env.GEMINI_API_KEY;

    beforeAll(() => {
        process.env.GEMINI_API_KEY = 'test-api-key';
    });

    afterAll(() => {
        process.env.GEMINI_API_KEY = originalApiKey;
    });

    describe('scoreLead', () => {
        it('should return score between 0.0 and 1.0', async () => {
            const mockGenerateContent = jest.fn().mockResolvedValue({
                response: {
                    text: () => '0.85'
                }
            });

            GoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: () => ({
                    generateContent: mockGenerateContent
                })
            }));

            const lead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                property_type: 'house',
                budget: 500000,
                timeline: '3 months',
                gdpr_consent: true
            };

            const score = await geminiService.scoreLead(lead);

            expect(score).toBeGreaterThanOrEqual(0.0);
            expect(score).toBeLessThanOrEqual(1.0);
            expect(typeof score).toBe('number');
        });

        it('should handle various lead profiles', async () => {
            const mockGenerateContent = jest.fn()
                .mockResolvedValueOnce({ response: { text: () => '0.95' } }) // Complete profile
                .mockResolvedValueOnce({ response: { text: () => '0.45' } }) // Incomplete profile
                .mockResolvedValueOnce({ response: { text: () => '0.65' } }); // Medium profile

            GoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: () => ({
                    generateContent: mockGenerateContent
                })
            }));

            const completeLead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                property_type: 'luxury condo',
                budget: 1000000,
                timeline: 'immediate',
                gdpr_consent: true
            };

            const incompleteLead = {
                first_name: 'Jane',
                last_name: 'Smith'
            };

            const mediumLead = {
                first_name: 'Bob',
                last_name: 'Johnson',
                email: 'bob@example.com',
                budget: 300000
            };

            const score1 = await geminiService.scoreLead(completeLead);
            const score2 = await geminiService.scoreLead(incompleteLead);
            const score3 = await geminiService.scoreLead(mediumLead);

            expect(score1).toBeGreaterThan(score2);
            expect(score3).toBeGreaterThan(score2);
            expect(score3).toBeLessThan(score1);
        });

        it('should return 0.5 fallback when Gemini is unavailable', async () => {
            // Temporarily remove API key
            const tempKey = process.env.GEMINI_API_KEY;
            delete process.env.GEMINI_API_KEY;

            // Reset module to pick up new env
            jest.resetModules();
            const geminiServiceNoKey = require('../src/services/geminiService');

            const lead = { first_name: 'John', last_name: 'Doe' };
            const score = await geminiServiceNoKey.scoreLead(lead);

            expect(score).toBe(0.5);

            // Restore
            process.env.GEMINI_API_KEY = tempKey;
        });

        it('should handle API errors gracefully', async () => {
            const mockGenerateContent = jest.fn().mockRejectedValue(
                new Error('API rate limit exceeded')
            );

            GoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: () => ({
                    generateContent: mockGenerateContent
                })
            }));

            const lead = {
                first_name: 'John',
                last_name: 'Doe'
            };

            const score = await geminiService.scoreLead(lead);

            expect(score).toBe(0.5); // Fallback score
        });

        it('should normalize score within 0.0-1.0 range', async () => {
            const mockGenerateContent = jest.fn()
                .mockResolvedValueOnce({ response: { text: () => '1.5' } }) // Above max
                .mockResolvedValueOnce({ response: { text: () => '-0.2' } }); // Below min

            GoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: () => ({
                    generateContent: mockGenerateContent
                })
            }));

            const lead = { first_name: 'John', last_name: 'Doe' };

            const score1 = await geminiService.scoreLead(lead);
            const score2 = await geminiService.scoreLead(lead);

            expect(score1).toBe(1.0); // Clamped to max
            expect(score2).toBe(0.0); // Clamped to min
        });
    });
});
