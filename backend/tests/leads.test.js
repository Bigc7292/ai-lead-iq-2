const request = require('supertest');
const app = require('../src/app');
const { generateToken } = require('../src/middleware/authMiddleware');

/**
 * Leads API Tests
 * Tests for lead CRUD operations with authentication
 */

// Mock dependencies
jest.mock('../src/services/leadsService');
jest.mock('../src/services/geminiService');

const leadsService = require('../src/services/leadsService');
const geminiService = require('../src/services/geminiService');

describe('Leads API Endpoints', () => {
    let authToken;
    let mockLead;

    beforeAll(() => {
        // Generate test JWT token
        process.env.JWT_SECRET = 'test-secret-key-12345678';
        authToken = generateToken({
            id: 'test-user-id-123',
            email: '

test@example.com',
            role: 'agent'
        });

    mockLead = {
        id: 'lead-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        property_type: 'house',
        budget: 500000,
        timeline: '3 months',
        score: 0.85,
        status: 'new',
        assigned_to: 'test-user-id-123',
        created_at: new Date(),
        updated_at: new Date()
    };
});

describe('POST /api/leads', () => {
    it('should create a lead and return Gemini score with valid token', async () => {
        leadsService.createLead.mockResolvedValue(mockLead);
        geminiService.scoreLead.mockResolvedValue(0.85);
        leadsService.updateLeadScore.mockResolvedValue({ ...mockLead, score: 0.85 });

        const response = await request(app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                budget: 500000
            });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('score');
        expect(response.body.meta.ai_scored).toBe(true);
        expect(response.body.meta.score).toBe(0.85);
    });

    it('should return 401 without authentication token', async () => {
        const response = await request(app)
            .post('/api/leads')
            .send({
                first_name: 'John',
                last_name: 'Doe'
            });

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('NO_TOKEN');
    });
});

describe('GET /api/leads/:id', () => {
    it('should return lead with visible PII when authorized', async () => {
        leadsService.getLeadById.mockResolvedValue(mockLead);

        const response = await request(app)
            .get('/api/leads/lead-123')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.email).toBe('john.doe@example.com');
        expect(response.body.meta.pii_visible).toBe(true);
    });

    it('should mask PII when not authorized', async () => {
        const unauthorizedToken = generateToken({
            id: 'different-user-id',
            email: 'other@example.com',
            role: 'agent'
        });

        leadsService.getLeadById.mockResolvedValue(mockLead);

        const response = await request(app)
            .get('/api/leads/lead-123')
            .set('Authorization', `Bearer ${unauthorizedToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.email).toContain('***');
        expect(response.body.meta.pii_visible).toBe(false);
    });

    it('should return 404 for non-existent lead', async () => {
        leadsService.getLeadById.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/leads/non-existent-id')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('LEAD_NOT_FOUND');
    });
});

describe('GET /api/leads', () => {
    it('should return paginated leads with metadata', async () => {
        const mockLeads = [
            { ...mockLead, score: 0.8 },
            { ...mockLead, id: 'lead-456', score: 0.9 },
            { ...mockLead, id: 'lead-789', score: 0.7 }
        ];

        leadsService.getAllLeads.mockResolvedValue(mockLeads);

        const response = await request(app)
            .get('/api/leads?page=1&limit=2')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.meta.total).toBe(3);
        expect(response.body.meta.total_pages).toBe(2);
        expect(response.body.meta).toHaveProperty('score_avg');
    });

    it('should filter leads by status', async () => {
        const mockLeads = [
            { ...mockLead, status: 'new' },
            { ...mockLead, id: 'lead-456', status: 'contacted' }
        ];

        leadsService.getAllLeads.mockResolvedValue(mockLeads);

        const response = await request(app)
            .get('/api/leads?status=new')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].status).toBe('new');
    });
});

describe('PUT /api/leads/:id', () => {
    it('should update lead when authorized', async () => {
        leadsService.getLeadById.mockResolvedValue(mockLead);
        leadsService.updateLead.mockResolvedValue({ ...mockLead, timeline: '1 month' });

        const response = await request(app)
            .put('/api/leads/lead-123')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ timeline: '1 month' });

        expect(response.status).toBe(200);
        expect(response.body.data.timeline).toBe('1 month');
    });

    it('should return 403 when not authorized to update', async () => {
        const unauthorizedToken = generateToken({
            id: 'different-user-id',
            email: 'other@example.com',
            role: 'agent'
        });

        leadsService.getLeadById.mockResolvedValue(mockLead);

        const response = await request(app)
            .put('/api/leads/lead-123')
            .set('Authorization', `Bearer ${unauthorizedToken}`)
            .send({ timeline: '1 month' });

        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
    });
});

describe('DELETE /api/leads/:id', () => {
    it('should delete lead when user is admin', async () => {
        const adminToken = generateToken({
            id: 'admin-id',
            email: 'admin@example.com',
            role: 'admin'
        });

        leadsService.deleteLead.mockResolvedValue(true);

        const response = await request(app)
            .delete('/api/leads/lead-123')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should return 403 when non-admin tries to delete', async () => {
        const response = await request(app)
            .delete('/api/leads/lead-123')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error.message).toContain('admin');
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
});
