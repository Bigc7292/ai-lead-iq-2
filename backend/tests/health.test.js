const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('service', 'AI Lead IQ API');
    });
});

// Note: This is a placeholder test file
// Actual tests will be implemented with Jest in Sprint 1
// For now, install: npm install --save-dev jest supertest
