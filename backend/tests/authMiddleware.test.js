const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole, generateToken } = require('../src/middleware/authMiddleware');

/**
 * Authentication Middleware Tests
 * Tests for JWT validation and role-based access control
 */

describe('Authentication Middleware', () => {
    let req, res, next;
    const originalJwtSecret = process.env.JWT_SECRET;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret-key-12345678';
    });

    beforeEach(() => {
        req = {
            headers: {},
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    describe('authenticateToken', () => {
        it('should authenticate valid JWT token', () => {
            const token = generateToken({
                id: 'user-123',
                email: 'test@example.com',
                role: 'agent'
            });

            req.headers['authorization'] = `Bearer ${token}`;

            authenticateToken(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe('user-123');
        });

        it('should return 401 for missing token', () => {
            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: {
                    message: 'Authentication token required',
                    code: 'NO_TOKEN'
                }
            });
        });

        it('should return 403 for invalid token', () => {
            req.headers['authorization'] = 'Bearer invalid-token';

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'INVALID_TOKEN'
                    })
                })
            );
        });

        it('should return 403 for expired token', () => {
            const expiredToken = jwt.sign(
                { id: 'user-123', email: 'test@example.com' },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' } // Expired 1 hour ago
            );

            req.headers['authorization'] = `Bearer ${expiredToken}`;

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'TOKEN_EXPIRED'
                    })
                })
            );
        });
    });

    describe('requireRole', () => {
        it('should allow access for authorized role', () => {
            req.user = {
                id: 'admin-123',
                role: 'admin'
            };

            const middleware = requireRole(['admin', 'manager']);
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should deny access for unauthorized role', () => {
            req.user = {
                id: 'agent-123',
                role: 'agent'
            };

            const middleware = requireRole(['admin', 'manager']);
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: {
                    message: 'Insufficient permissions',
                    code: 'FORBIDDEN',
                    required_roles: ['admin', 'manager']
                }
            });
        });

        it('should return 401 if user not authenticated', () => {
            req.user = null;

            const middleware = requireRole(['admin']);
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: {
                    message: 'Authentication required',
                    code: 'NO_AUTH'
                }
            });
        });
    });

    describe('generateToken', () => {
        it('should generate valid JWT token', () => {
            const payload = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'agent'
            };

            const token = generateToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).toBe(payload.id);
            expect(decoded.email).toBe(payload.email);
            expect(decoded.role).toBe(payload.role);
        });

        it('should respect custom expiration time', () => {
            const payload = { id: 'user-123' };
            const token = generateToken(payload, '1h');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.exp).toBeDefined();
        });
    });
});
