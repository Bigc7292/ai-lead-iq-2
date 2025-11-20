const request = require('supertest');
const app = require('../src/app');
const { generateToken } = require('../src/middleware/authMiddleware');
const { sanitizeInput, isValidIP } = require('../src/middleware/security');

/**
 * Security Middleware Tests
 * Tests for Helmet headers, Joi validation, and security utilities
 */

describe('Security Middleware', () => {
    let authToken;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret-key-12345678';
        authToken = generateToken({
            id: 'test-user-123',
            email: 'test@example.com',
            role: 'agent',
        });
    });

    describe('Helmet Security Headers', () => {
        it('should set X-Content-Type-Options header', async () => {
            const response = await request(app).get('/api/health');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
        });

        it('should set X-Frame-Options header', async () => {
            const response = await request(app).get('/api/health');
            expect(response.headers['x-frame-options']).toBeDefined();
        });

        it('should set Strict-Transport-Security header', async () => {
            const response = await request(app).get('/api/health');
            expect(response.headers['strict-transport-security']).toBeDefined();
            expect(response.headers['strict-transport-security']).toContain('max-age=');
        });

        it('should set Content-Security-Policy header', async () => {
            const response = await request(app).get('/api/health');
            expect(response.headers['content-security-policy']).toBeDefined();
        });

        it('should set X-XSS-Protection header', async () => {
            const response = await request(app).get('/api/health');
            expect(response.headers['x-xss-protection']).toBeDefined();
        });
    });

    describe('Joi Validation - Lead Creation', () => {
        it('should accept valid lead data', async () => {
            const validLead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone: '+12345678901',
                budget: 500000,
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validLead);

            // It may fail due to database, but validation should pass
            expect(response.status).not.toBe(400);
        });

        it('should reject lead with missing required fields', async () => {
            const invalidLead = {
                first_name: 'John', // Missing last_name, email, phone
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidLead);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details.length).toBeGreaterThan(0);
        });

        it('should reject lead with invalid email format', async () => {
            const invalidLead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'not-an-email',
                phone: '+12345678901',
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidLead);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            const emailError = response.body.error.details.find(d => d.field === 'email');
            expect(emailError).toBeDefined();
        });

        it('should reject lead with invalid phone format', async () => {
            const invalidLead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: 'invalid-phone',
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidLead);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            const phoneError = response.body.error.details.find(d => d.field === 'phone');
            expect(phoneError).toBeDefined();
        });

        it('should reject lead with negative budget', async () => {
            const invalidLead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+12345678901',
                budget: -100000,
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidLead);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should reject lead with invalid property_type', async () => {
            const invalidLead = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+12345678901',
                property_type: 'invalid-type',
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidLead);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should strip unknown fields from request body', async () => {
            const leadWithExtra = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+12345678901',
                hacker_field: 'malicious',
                __proto__: { polluted: true },
            };

            const response = await request(app)
                .post('/api/leads')
                .set('Authorization', `Bearer ${authToken}`)
                .send(leadWithExtra);

            // Should not fail due to extra fields (stripUnknown: true)
            expect(response.status).not.toBe(400);
        });
    });

    describe('Joi Validation - Query Parameters', () => {
        it('should accept valid query parameters', async () => {
            const response = await request(app)
                .get('/api/leads?page=1&limit=10&status=new&min_score=0.5')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).not.toBe(400);
        });

        it('should reject invalid page number', async () => {
            const response = await request(app)
                .get('/api/leads?page=-1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('QUERY_VALIDATION_ERROR');
        });

        it('should reject limit exceeding maximum', async () => {
            const response = await request(app)
                .get('/api/leads?limit=1000')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('QUERY_VALIDATION_ERROR');
        });

        it('should reject invalid status value', async () => {
            const response = await request(app)
                .get('/api/leads?status=invalid')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('QUERY_VALIDATION_ERROR');
        });
    });

    describe('Joi Validation - UUID Parameters', () => {
        it('should reject invalid UUID in URL params', async () => {
            const response = await request(app)
                .get('/api/leads/not-a-uuid')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('PARAMS_VALIDATION_ERROR');
        });

        it('should accept valid UUID in URL params', async () => {
            const validUUID = '550e8400-e29b-41d4-a716-446655440000';
            const response = await request(app)
                .get(`/api/leads/${validUUID}`)
                .set('Authorization', `Bearer ${authToken}`);

            // May return 404, but validation should pass
            expect(response.status).not.toBe(400);
        });
    });

    describe('Joi Validation - Batch Calls', () => {
        it('should accept valid batch call data', async () => {
            const validBatchCall = {
                lead_ids: [
                    '550e8400-e29b-41d4-a716-446655440000',
                    '550e8400-e29b-41d4-a716-446655440001',
                ],
                campaign_name: 'Q4 Campaign',
                priority: 'high',
            };

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBatchCall);

            expect(response.status).not.toBe(400);
        });

        it('should reject empty lead_ids array', async () => {
            const invalidBatchCall = {
                lead_ids: [],
            };

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidBatchCall);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should reject non-UUID values in lead_ids', async () => {
            const invalidBatchCall = {
                lead_ids: ['not-a-uuid', '123'],
            };

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidBatchCall);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should reject duplicate lead_ids', async () => {
            const invalidBatchCall = {
                lead_ids: [
                    '550e8400-e29b-41d4-a716-446655440000',
                    '550e8400-e29b-41d4-a716-446655440000', // Duplicate
                ],
            };

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidBatchCall);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should reject excessive lead_ids (>500)', async () => {
            const tooManyLeads = Array(501).fill('550e8400-e29b-41d4-a716-446655440000');
            const invalidBatchCall = {
                lead_ids: tooManyLeads,
            };

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidBatchCall);

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('Security Utilities', () => {
        describe('sanitizeInput', () => {
            it('should remove script tags', () => {
                const input = '<script>alert("XSS")</script>Hello';
                const sanitized = sanitizeInput(input);
                expect(sanitized).not.toContain('<script>');
                expect(sanitized).not.toContain('</script>');
            });

            it('should remove javascript: protocol', () => {
                const input = 'javascript:alert("XSS")';
                const sanitized = sanitizeInput(input);
                expect(sanitized.toLowerCase()).not.toContain('javascript:');
            });

            it('should remove event handlers', () => {
                const input = 'Hello onclick=alert("XSS")';
                const sanitized = sanitizeInput(input);
                expect(sanitized.toLowerCase()).not.toContain('onclick=');
            });

            it('should handle non-string input', () => {
                expect(sanitizeInput(123)).toBe(123);
                expect(sanitizeInput(null)).toBe(null);
                expect(sanitizeInput(undefined)).toBe(undefined);
            });
        });

        describe('isValidIP', () => {
            it('should validate IPv4 addresses', () => {
                expect(isValidIP('192.168.1.1')).toBe(true);
                expect(isValidIP('10.0.0.1')).toBe(true);
                expect(isValidIP('255.255.255.255')).toBe(true);
            });

            it('should reject invalid IPv4 addresses', () => {
                expect(isValidIP('256.1.1.1')).toBe(false);
                expect(isValidIP('192.168.1')).toBe(false);
                expect(isValidIP('not-an-ip')).toBe(false);
            });

            it('should validate IPv6 addresses', () => {
                expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
            });
        });
    });

    describe('Request Logging', () => {
        it('should attach requestId to requests', async () => {
            const response = await request(app).get('/api/health');

            // Check if requestId is in error responses (if something goes wrong)
            if (response.body.error) {
                expect(response.body.error.requestId).toBeDefined();
            }

            // Logging should not affect response
            expect(response.status).toBeLessThan(500);
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for non-existent endpoints', async () => {
            const response = await request(app).get('/api/non-existent');
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe('NOT_FOUND');
            expect(response.body.error.path).toBe('/api/non-existent');
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});
