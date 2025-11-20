const express = require('express');
const { configureHelmet, requestLogger } = require('./middleware/security');
const leadsRouter = require('./routes/leads');
const healthRouter = require('./routes/health');
const batchCallsRouter = require('./routes/batchCalls');

const app = express();

// Security: Helmet middleware for secure HTTP headers
app.use(configureHelmet());

// Request logging for audit trail
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Allow requests from allowed origins or if no origin (same-origin, Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/batch-calls', batchCallsRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint not found',
            code: 'NOT_FOUND',
            path: req.path,
        },
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR',
            status: err.status || 500,
            ...(isDevelopment && { details: err.details, stack: err.stack }),
            requestId: req.requestId,
        },
    });
});

module.exports = app;
