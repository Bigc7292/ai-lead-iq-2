const { test, expect } = require('@playwright/test');

/**
 * End-to-End API Tests
 * Full workflow testing for AI Lead IQ backend
 */

let apiContext;
let authToken;
let testLeadId;

test.describe('E2E API Workflows', () => {
    test.beforeAll(async ({ request }) => {
        // Generate test authentication token
        // In a real scenario, you'd call /api/auth/login
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-12345678';

        authToken = jwt.sign(
            {
                id: 'e2e-test-user-123',
                email: 'e2e@example.com',
                role: 'admin',
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    test.describe('Health Check', () => {
        test('should return healthy status', async ({ request }) => {
            const response = await request.get('/api/health');
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body.status).toBe('healthy');
        });
    });

    test.describe('Complete Lead Lifecycle', () => {
        test('should create a new lead and auto-score with Gemini', async ({ request }) => {
            const newLead = {
                first_name: 'Emma',
                last_name: 'Wilson',
                email: 'emma.wilson@example.com',
                phone: '+15551234567',
                property_type: 'house',
                budget: 750000,
                timeline: '6 months',
                location: 'San Francisco, CA',
            };

            const response = await request.post('/api/leads', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                data: newLead,
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(201);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(body.data.id).toBeDefined();
            expect(body.data.first_name).toBe('Emma');
            expect(body.data.email).toBe('emma.wilson@example.com');

            // Check Gemini scoring
            expect(body.meta.ai_scored).toBe(true);
            expect(body.meta.score).toBeGreaterThanOrEqual(0);
            expect(body.meta.score).toBeLessThanOrEqual(1);

            // Store for subsequent tests
            testLeadId = body.data.id;
        });

        test('should retrieve the created lead', async ({ request }) => {
            test.skip(!testLeadId, 'Lead not created in previous test');

            const response = await request.get(`/api/leads/${testLeadId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body.data.id).toBe(testLeadId);
            expect(body.data.first_name).toBe('Emma');
            expect(body.meta.pii_visible).toBe(true); // Admin role
        });

        test('should update the lead', async ({ request }) => {
            test.skip(!testLeadId, 'Lead not created');

            const updates = {
                status: 'contacted',
                timeline: '3 months',
                notes: 'Follow up next week',
            };

            const response = await request.put(`/api/leads/${testLeadId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                data: updates,
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body.data.status).toBe('contacted');
            expect(body.data.timeline).toBe('3 months');
        });

        test('should list leads with filters', async ({ request }) => {
            const response = await request.get('/api/leads?status=contacted&limit=10&page=1', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(Array.isArray(body.data)).toBeTruthy();
            expect(body.meta.total).toBeGreaterThanOrEqual(0);
            expect(body.meta.page).toBe(1);
            expect(body.meta.limit).toBe(10);
        });

        test('should delete the lead (admin only)', async ({ request }) => {
            test.skip(!testLeadId, 'Lead not created');

            const response = await request.delete(`/api/leads/${testLeadId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body.success).toBe(true);
        });
    });

    test.describe('Authentication & Authorization', () => {
        test('should reject requests without token', async ({ request }) => {
            const response = await request.get('/api/leads');
            expect(response.status()).toBe(401);

            const body = await response.json();
            expect(body.error.code).toBe('NO_TOKEN');
        });

        test('should reject requests with invalid token', async ({ request }) => {
            const response = await request.get('/api/leads', {
                headers: {
                    'Authorization': 'Bearer invalid-token-12345',
                },
            });

            expect(response.status()).toBe(403);
            const body = await response.json();
            expect(body.error.code).toMatch(/INVALID_TOKEN|TOKEN_EXPIRED/);
        });

        test('should mask PII for unauthorized users', async ({ request }) => {
            // Create agent token (non-admin)
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-12345678';

            const agentToken = jwt.sign(
                {
                    id: 'different-agent-123',
                    email: 'agent@example.com',
                    role: 'agent',
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Create a lead first
            const createResponse = await request.post('/api/leads', {
                headers: { 'Authorization': `Bearer ${authToken}` },
                data: {
                    first_name: 'Test',
                    last_name: 'User',
                    email: 'test@example.com',
                    phone: '+15559876543',
                },
            });

            const leadId = (await createResponse.json()).data.id;

            // Try to access with different agent
            const response = await request.get(`/api/leads/${leadId}`, {
                headers: { 'Authorization': `Bearer ${agentToken}` },
            });

            expect(response.ok()).toBeTruthy();
            const body = await response.json();

            // PII should be masked
            expect(body.meta.pii_visible).toBe(false);
            expect(body.data.email).toContain('***');
            expect(body.data.phone).toContain('***');

            // Cleanup
            await request.delete(`/api/leads/${leadId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
        });
    });

    test.describe('Input Validation', () => {
        test('should reject malformed lead data', async ({ request }) => {
            const invalidLead = {
                first_name: 'A',
                // Missing required fields
            };

            const response = await request.post('/api/leads', {
                headers: { 'Authorization': `Bearer ${authToken}` },
                data: invalidLead,
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.error.code).toBe('VALIDATION_ERROR');
            expect(body.error.details).toBeDefined();
        });

        test('should validate email format', async ({ request }) => {
            const response = await request.post('/api/leads', {
                headers: { 'Authorization': `Bearer ${authToken}` },
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'not-a-valid-email',
                    phone: '+15551234567',
                },
            });

            expect(response.status()).toBe(400);
        });

        test('should validate phone format', async ({ request }) => {
            const response = await request.post('/api/leads', {
                headers: { 'Authorization': `Bearer ${authToken}` },
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    phone: 'abc123',
                },
            });

            expect(response.status()).toBe(400);
        });
    });

    test.describe('Batch Call Workflow', () => {
        let batchJobId;
        let leadIds = [];

        test.beforeAll(async ({ request }) => {
            // Create multiple leads for batch calling
            const leadsToCreate = [
                { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', phone: '+15551111111' },
                { first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', phone: '+15552222222' },
                { first_name: 'Carol', last_name: 'Davis', email: 'carol@example.com', phone: '+15553333333' },
            ];

            for (const leadData of leadsToCreate) {
                const response = await request.post('/api/leads', {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    data: leadData,
                });

                const body = await response.json();
                leadIds.push(body.data.id);
            }
        });

        test('should create batch call job', async ({ request }) => {
            const batchCallRequest = {
                lead_ids: leadIds,
                campaign_name: 'E2E Test Campaign',
                priority: 'high',
            };

            const response = await request.post('/api/batch-calls', {
                headers: { 'Authorization': `Bearer ${authToken}` },
                data: batchCallRequest,
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(201);

            const body = await response.json();
            expect(body.success).toBe(true);
            expect(body.data.id).toBeDefined();

            batchJobId = body.data.id;
        });

        test('should retrieve batch job status', async ({ request }) => {
            test.skip(!batchJobId, 'Batch job not created');

            const response = await request.get(`/api/batch-calls/${batchJobId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            expect(response.ok()).toBeTruthy();
            const body = await response.json();
            expect(body.data).toBeDefined();
        });

        test.afterAll(async ({ request }) => {
            // Cleanup: delete test leads
            for (const leadId of leadIds) {
                await request.delete(`/api/leads/${leadId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should return 404 for non-existent lead', async ({ request }) => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request.get(`/api/leads/${fakeId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            expect(response.status()).toBe(404);
            const body = await response.json();
            expect(body.error.code).toBe('LEAD_NOT_FOUND');
        });

        test('should return 404 for non-existent endpoint', async ({ request }) => {
            const response = await request.get('/api/non-existent-endpoint');
            expect(response.status()).toBe(404);

            const body = await response.json();
            expect(body.error.code).toBe('NOT_FOUND');
        });
    });

    test.describe('Security Headers', () => {
        test('should include security headers in responses', async ({ request }) => {
            const response = await request.get('/api/health');

            const headers = response.headers();
            expect(headers['x-content-type-options']).toBe('nosniff');
            expect(headers['x-frame-options']).toBeDefined();
            expect(headers['strict-transport-security']).toBeDefined();
        });
    });
});
