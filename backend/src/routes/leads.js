const express = require('express');
const router = express.Router();
const leadsService = require('../services/leadsService');
const geminiService = require('../services/geminiService');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const { strictLimiter } = require('../middleware/rateLimitMiddleware');
const { leadSchemas, validateBody, validateQuery, validateParams } = require('../middleware/security');

/**
 * Leads Routes
 * Enhanced with authentication, rate limiting, and pagination
 */

// GET all leads with pagination and filters
router.get('/', authenticateToken, validateQuery(leadSchemas.query), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const min_score = parseFloat(req.query.min_score);
        const max_score = parseFloat(req.query.max_score);

        const leads = await leadsService.getAllLeads();

        // Apply filters
        let filteredLeads = leads;
        if (status) {
            filteredLeads = filteredLeads.filter(l => l.status === status);
        }
        if (!isNaN(min_score)) {
            filteredLeads = filteredLeads.filter(l => l.score >= min_score);
        }
        if (!isNaN(max_score)) {
            filteredLeads = filteredLeads.filter(l => l.score <= max_score);
        }

        // Calculate pagination
        const total = filteredLeads.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

        // Calculate metadata
        const scores = filteredLeads.map(l => l.score || 0);
        const score_avg = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        res.json({
            data: paginatedLeads,
            meta: {
                total,
                page,
                limit,
                total_pages: totalPages,
                score_avg: parseFloat(score_avg.toFixed(2))
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get lead by ID with PII unhashing based on authorization
router.get('/:id', authenticateToken, validateParams(leadSchemas.id), async (req, res, next) => {
    try {
        const lead = await leadsService.getLeadById(req.params.id);
        if (!lead) {
            return res.status(404).json({
                error: {
                    message: 'Lead not found',
                    code: 'LEAD_NOT_FOUND'
                }
            });
        }

        // Check if user is authorized to see full PII
        const userId = req.user.id;
        const userRole = req.user.role;
        const isAuthorized =
            lead.assigned_to === userId ||
            ['admin', 'manager'].includes(userRole);

        // If not authorized, mask PII
        if (!isAuthorized) {
            if (lead.email) {
                lead.email = lead.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
            }
            if (lead.phone) {
                lead.phone = lead.phone.replace(/(\d{3})(\d+)(\d{3})/, '$1***$3');
            }
        }

        res.json({
            data: lead,
            meta: {
                pii_visible: isAuthorized
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create new lead with Gemini scoring
router.post('/', authenticateToken, strictLimiter, validateBody(leadSchemas.create), async (req, res, next) => {
    try {
        const leadData = req.body;

        // Assign to current user if not specified
        if (!leadData.assigned_to) {
            leadData.assigned_to = req.user.id;
        }

        const newLead = await leadsService.createLead(leadData);

        // Auto-score the lead with Gemini
        const score = await geminiService.scoreLead(newLead);
        const updatedLead = await leadsService.updateLeadScore(newLead.id, score);

        res.status(201).json({
            data: updatedLead,
            meta: {
                ai_scored: true,
                score
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update lead
router.put('/:id', authenticateToken, validateParams(leadSchemas.id), validateBody(leadSchemas.update), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check authorization
        const existingLead = await leadsService.getLeadById(req.params.id);
        if (!existingLead) {
            return res.status(404).json({
                error: {
                    message: 'Lead not found',
                    code: 'LEAD_NOT_FOUND'
                }
            });
        }

        const isAuthorized =
            existingLead.assigned_to === userId ||
            ['admin', 'manager'].includes(userRole);

        if (!isAuthorized) {
            return res.status(403).json({
                error: {
                    message: 'Not authorized to update this lead',
                    code: 'FORBIDDEN'
                }
            });
        }

        const updatedLead = await leadsService.updateLead(req.params.id, req.body);
        res.json({ data: updatedLead });
    } catch (error) {
        next(error);
    }
});

// Delete lead (admin only)
router.delete('/:id', authenticateToken, validateParams(leadSchemas.id), async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: {
                    message: 'Only admins can delete leads',
                    code: 'FORBIDDEN'
                }
            });
        }

        await leadsService.deleteLead(req.params.id);
        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Initiate outbound call for a lead
router.post('/:id/call', authenticateToken, validateParams(leadSchemas.id), async (req, res, next) => {
    try {
        // This will be implemented in Sprint 2
        res.status(501).json({
            success: false,
            error: {
                message: 'Voice calling will be implemented in Sprint 2',
                code: 'NOT_IMPLEMENTED'
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

