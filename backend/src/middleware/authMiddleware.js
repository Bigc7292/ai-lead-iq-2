const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn('⚠️  Warning: JWT_SECRET not configured. Authentication will not work properly.');
}

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and attaches user info to request
 */

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: {
                message: 'Authentication token required',
                code: 'NO_TOKEN'
            }
        });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({
            error: {
                message: 'Server authentication not configured',
                code: 'AUTH_CONFIG_ERROR'
            }
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            const errorCode = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
            return res.status(403).json({
                error: {
                    message: err.message,
                    code: errorCode
                }
            });
        }

        req.user = user; // Attach user info to request
        next();
    });
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that have different behavior for authenticated users
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !JWT_SECRET) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        req.user = err ? null : user;
        next();
    });
};

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['admin', 'manager'])
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: {
                    message: 'Authentication required',
                    code: 'NO_AUTH'
                }
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: {
                    message: 'Insufficient permissions',
                    code: 'FORBIDDEN',
                    required_roles: allowedRoles
                }
            });
        }

        next();
    };
};

/**
 * Generate JWT token for a user
 * @param {object} payload - User data to encode (id, email, role)
 * @param {string} expiresIn - Token expiration time (default: 24h)
 */
const generateToken = (payload, expiresIn = '24h') => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole,
    generateToken
};
