const express = require('express');
const router = express.Router();
const batchCallService = require('../services/batchCallService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { batchLimiter } = require('../middleware/rateLimitMiddleware');
const { batchCallSchemas, validateBody, validateParams } = require('../middleware/security');

/**
 * Batch Calls Routes
 * Endpoints for managing batch voice call operations
 */

// Apply authentication to all batch call routes
router.use(authenticateToken);

/**
 * POST /api/batch-calls
 * Create a new batch call job
 */
router.post('/', batchLimiter, validateBody(batchCallSchemas.create), async (req, res, next) => {
    try {
        const { lead_ids, options } = req.body;

        if (!lead_ids || !Array.isArray(lead_ids)) {
            return res.status(400).json({
                error: {
                    message: 'lead_ids array is required',
                    code: 'INVALID_INPUT'
                }
            });
        }

        const userId = req.user.id;
        const job = await batchCallService.createBatchCallJob(lead_ids, userId, options);

        res.status(201).json({
            success: true,
            data: job,
            meta: {
                message: 'Batch call job created successfully'
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/batch-calls/:jobId
 * Get status of a specific batch job
 */
router.get('/:jobId', validateParams(batchCallSchemas.jobId), async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        const jobStatus = await batchCallService.getBatchJobStatus(jobId);

        if (!jobStatus) {
            return res.status(404).json({
                error: {
                    message: 'Batch job not found',
                    code: 'JOB_NOT_FOUND'
                }
            });
        }

        res.json({
            success: true,
            data: jobStatus
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/batch-calls
 * Get all batch jobs for the authenticated user
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const jobs = await batchCallService.getUserBatchJobs(userId, limit);

        res.json({
            success: true,
            data: jobs,
            meta: {
                total: jobs.length,
                limit
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
