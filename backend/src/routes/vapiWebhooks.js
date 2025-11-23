const express = require('express');
const router = express.Router();
const vapiService = require('../services/vapiService');

/**
 * Vapi Webhook Routes
 * Handle incoming webhook events from Vapi AI platform
 * Documentation: https://docs.vapi.ai/server_url
 */

/**
 * Call started webhook
 * Triggered when a call begins
 */
router.post('/call-started', async (req, res) => {
    try {
        const { message } = req.body;

        if (message?.type === 'status-update' && message?.status === 'in-progress') {
            await vapiService.handleCallStarted(message.call);
            return res.status(200).json({ success: true });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling call-started webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Call ended webhook
 * Triggered when a call completes
 * Saves transcript and structured data to database
 */
router.post('/call-ended', async (req, res) => {
    try {
        const { message } = req.body;

        if (message?.type === 'end-of-call-report') {
            await vapiService.handleCallEnded(message);
            return res.status(200).json({ success: true });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling call-ended webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Transcript update webhook
 * Receives real-time transcript updates during call
 */
router.post('/transcript', async (req, res) => {
    try {
        const { message } = req.body;

        if (message?.type === 'transcript') {
            await vapiService.handleTranscriptUpdate(message);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling transcript webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Function call webhook
 * Triggered when assistant wants to execute a custom function/tool
 */
router.post('/function-call', async (req, res) => {
    try {
        const { message } = req.body;

        if (message?.type === 'function-call') {
            const result = await vapiService.handleFunctionCall(message);
            return res.status(200).json({ result });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling function-call webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Assistant request webhook
 * For dynamic assistant configuration per call
 */
router.post('/assistant-request', async (req, res) => {
    try {
        const { message } = req.body;

        if (message?.type === 'assistant-request') {
            const assistantConfig = await vapiService.getAssistantConfig(message);
            return res.status(200).json(assistantConfig);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling assistant-request webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Catch-all webhook endpoint
 * Handles all Vapi events at single URL
 */
router.post('/webhook', async (req, res) => {
    try {
        const { message } = req.body;

        console.log('Vapi webhook received:', message?.type);

        switch (message?.type) {
            case 'status-update':
                if (message.status === 'in-progress') {
                    await vapiService.handleCallStarted(message.call);
                }
                break;

            case 'end-of-call-report':
                await vapiService.handleCallEnded(message);
                break;

            case 'transcript':
                await vapiService.handleTranscriptUpdate(message);
                break;

            case 'function-call':
                const result = await vapiService.handleFunctionCall(message);
                return res.status(200).json({ result });

            case 'assistant-request':
                const config = await vapiService.getAssistantConfig(message);
                return res.status(200).json(config);

            default:
                console.log('Unhandled webhook type:', message?.type);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling Vapi webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create outbound call endpoint
 * Triggers outbound call via Vapi SDK
 */
router.post('/outbound-call', async (req, res) => {
    try {
        const { leadId, phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        const call = await vapiService.createOutboundCall(leadId, phoneNumber);
        res.status(200).json({ success: true, call });
    } catch (error) {
        console.error('Error creating outbound call:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
