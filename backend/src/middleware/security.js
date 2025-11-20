const helmet = require('helmet');
const Joi = require('joi');

/**
 * Security Middleware Module
 * Provides Helmet security headers, Joi validation schemas, and security utilities
 */

// =======================
// Helmet Configuration
// =======================

/**
 * Configure Helmet for secure HTTP headers
 * @returns {Function} Express middleware
 */
const configureHelmet = () => {
    return helmet({
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        // HTTP Strict Transport Security
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
        // Other security headers
        frameguard: { action: 'deny' }, // X-Frame-Options: DENY
        noSniff: true, // X-Content-Type-Options: nosniff
        xssFilter: true, // X-XSS-Protection: 1; mode=block
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });
};

// =======================
// Joi Validation Schemas
// =======================

/**
 * Lead validation schemas
 */
const leadSchemas = {
    // Create lead
    create: Joi.object({
        first_name: Joi.string().min(1).max(100).required().trim(),
        last_name: Joi.string().min(1).max(100).required().trim(),
        email: Joi.string().email().max(255).required().trim().lowercase(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().trim(), // E.164 format
        property_type: Joi.string().valid('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'other').optional(),
        budget: Joi.number().min(0).max(100000000).optional(),
        timeline: Joi.string().max(100).optional().trim(),
        location: Joi.string().max(255).optional().trim(),
        notes: Joi.string().max(1000).optional().trim(),
        status: Joi.string().valid('new', 'contacted', 'qualified', 'converted', 'dead').optional().default('new'),
    }),

    // Update lead (all fields optional)
    update: Joi.object({
        first_name: Joi.string().min(1).max(100).optional().trim(),
        last_name: Joi.string().min(1).max(100).optional().trim(),
        email: Joi.string().email().max(255).optional().trim().lowercase(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().trim(),
        property_type: Joi.string().valid('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'other').optional(),
        budget: Joi.number().min(0).max(100000000).optional(),
        timeline: Joi.string().max(100).optional().trim(),
        location: Joi.string().max(255).optional().trim(),
        notes: Joi.string().max(1000).optional().trim(),
        status: Joi.string().valid('new', 'contacted', 'qualified', 'converted', 'dead').optional(),
        score: Joi.number().min(0).max(1).optional(),
    }).min(1), // At least one field required

    // Query parameters for listing leads
    query: Joi.object({
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).max(100).optional().default(10),
        status: Joi.string().valid('new', 'contacted', 'qualified', 'converted', 'dead').optional(),
        min_score: Joi.number().min(0).max(1).optional(),
        max_score: Joi.number().min(0).max(1).optional(),
        assigned_to: Joi.string().uuid().optional(),
        search: Joi.string().max(100).optional().trim(),
    }),

    // UUID parameter validation
    id: Joi.object({
        id: Joi.string().uuid().required(),
    }),
};

/**
 * Batch call validation schemas
 */
const batchCallSchemas = {
    // Create batch call job
    create: Joi.object({
        lead_ids: Joi.array()
            .items(Joi.string().uuid())
            .min(1)
            .max(500)
            .required()
            .unique(),
        campaign_name: Joi.string().min(1).max(200).optional().trim(),
        script_template: Joi.string().max(5000).optional().trim(),
        voice_config: Joi.object({
            voice_id: Joi.string().max(100).optional(),
            speed: Joi.number().min(0.5).max(2.0).optional().default(1.0),
            pitch: Joi.number().min(0.5).max(2.0).optional().default(1.0),
        }).optional(),
        schedule_time: Joi.date().iso().greater('now').optional(),
        priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional().default('normal'),
    }),

    // Job ID parameter validation
    jobId: Joi.object({
        jobId: Joi.string().required(),
    }),
};

/**
 * Authentication validation schemas
 */
const authSchemas = {
    // Login credentials
    login: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
        password: Joi.string().min(8).max(128).required(),
    }),

    // Registration
    register: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            }),
        first_name: Joi.string().min(1).max(100).required().trim(),
        last_name: Joi.string().min(1).max(100).required().trim(),
        role: Joi.string().valid('agent', 'manager', 'admin').optional().default('agent'),
    }),
};

// =======================
// Validation Middleware
// =======================

/**
 * Create validation middleware for request body
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        type: detail.type,
                    })),
                },
            });
        }

        // Replace body with validated and sanitized value
        req.body = value;
        next();
    };
};

/**
 * Create validation middleware for query parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                error: {
                    message: 'Invalid query parameters',
                    code: 'QUERY_VALIDATION_ERROR',
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        type: detail.type,
                    })),
                },
            });
        }

        req.query = value;
        next();
    };
};

/**
 * Create validation middleware for URL parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                error: {
                    message: 'Invalid URL parameters',
                    code: 'PARAMS_VALIDATION_ERROR',
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        type: detail.type,
                    })),
                },
            });
        }

        req.params = value;
        next();
    };
};

// =======================
// Security Utilities
// =======================

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IP
 */
const isValidIP = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Request logging middleware for audit trail
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Attach request ID
    req.requestId = requestId;

    // Log request
    const logData = {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
    };

    console.log('[REQUEST]', JSON.stringify(logData));

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log('[RESPONSE]', JSON.stringify({
            requestId,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        }));
    });

    next();
};

module.exports = {
    // Helmet
    configureHelmet,

    // Validation schemas
    leadSchemas,
    batchCallSchemas,
    authSchemas,

    // Validation middleware
    validateBody,
    validateQuery,
    validateParams,

    // Security utilities
    sanitizeInput,
    isValidIP,
    requestLogger,
};
