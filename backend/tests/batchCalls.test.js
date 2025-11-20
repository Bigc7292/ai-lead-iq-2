const request = require('supertest');
const app = require('../src/app');
const { generateToken } = require('../src/middleware/authMiddleware');

/**
 * Batch Calls API Tests
 * Tests for batch call job creation and management
 */

// Mock dependencies
jest.mock('../src/services/batchCallService');
jest.mock('../src/services/minimaxService');

const batchCallService = require('../src/services/batchCallService');

describe('Batch Calls API Endpoints', () => {
    let authToken;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret-key-12345678';
        authToken = generateToken({
            id: 'test-user-id-123',
            email: 'test@example.com',
            role: 'agent'
        });
    });

    describe('POST /api/batch-calls', () => {
        it('should create batch job with 100+ lead IDs', async () => {
            const leadIds = Array.from({ length: 100 }, (_, i) => `lead-${i}`);

            batchCallService.createBatchCallJob.mockResolvedValue({
                jobId: 'batch-job-123',
                status: 'queued',
                totalLeads: 100,
                createdAt: new Date().toISOString(),
                estimatedDuration: 3000
            });

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ lead_ids: leadIds });

            expect(response.status).toBe(201);
            expect(response.body.data.jobId).toBe('batch-job-123');
            expect(response.body.data.status).toBe('queued');
            expect(response.body.data.totalLeads).toBe(100);
        });

        it('should return 400 if lead_ids is not an array', async () => {
            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ lead_ids: 'not-an-array' });

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('INVALID_INPUT');
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/batch-calls')
                .send({ lead_ids: ['lead-1', 'lead-2'] });

            expect(response.status).toBe(401);
        });

        it('should handle service errors gracefully', async () => {
            batchCallService.createBatchCallJob.mockRejectedValue(
                new Error('Redis connection failed')
            );

            const response = await request(app)
                .post('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ lead_ids: ['lead-1', 'lead-2'] });

            expect(response.status).toBe(500);
        });
    });

    describe('GET /api/batch-calls/:jobId', () => {
        it('should return job status', async () => {
            batchCallService.getBatchJobStatus.mockResolvedValue({
                jobId: 'batch-job-123',
                status: 'active',
                progress: {
                    percent: 50,
                    completed: 50,
                    failed: 0,
                    total: 100
                },
                createdAt: new Date().toISOString(),
                startedAt: new Date().toISOString(),
                completedAt: null,
                results: [],
                error: null
            });

            const response = await request(app)
                .get('/api/batch-calls/batch-job-123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('active');
            expect(response.body.data.progress.percent).toBe(50);
        });

        it('should return 404 for non-existent job', async () => {
            batchCallService.getBatchJobStatus.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/batch-calls/non-existent-job')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe('JOB_NOT_FOUND');
        });
    });

    describe('GET /api/batch-calls', () => {
        it('should return all user batch jobs', async () => {
            const mockJobs = [
                {
                    jobId: 'batch-job-1',
                    status: 'completed',
                    totalLeads: 50,
                    createdAt: new Date().toISOString(),
                    completedAt: new Date().toISOString()
                },
                {
                    jobId: 'batch-job-2',
                    status: 'active',
                    totalLeads: 100,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                }
            ];

            batchCallService.getUserBatchJobs.mockResolvedValue(mockJobs);

            const response = await request(app)
                .get('/api/batch-calls')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.meta.total).toBe(2);
        });

        it('should respect limit parameter', async () => {
            batchCallService.getUserBatchJobs.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/batch-calls?limit=10')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(batchCallService.getUserBatchJobs).toHaveBeenCalledWith(
                'test-user-id-123',
                10
            );
        });
    });

    describe('Rate Limiting', () => {
        it('should enforce rate limit on batch endpoint', async () => {
            batchCallService.createBatchCallJob.mockResolvedValue({
                jobId: 'batch-job-123',
                status: 'queued',
                totalLeads: 10
            });

            // Make multiple requests to trigger rate limit
            const requests = Array.from({ length: 12 }, () =>
                request(app)
                    .post('/api/batch-calls')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ lead_ids: ['lead-1'] })
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponses = responses.filter(r => r.status === 429);

            // At least one request should be rate-limited (batch limit is 10/hour)
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        }, 30000); // Increase timeout for this test
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});
