const { Queue, Worker } = require('bullmq');
const { redisConfig } = require('../config/redisConfig');
const minimaxService = require('./minimaxService');
const leadsService = require('./leadsService');
const supabase = require('./supabaseClient');

/**
 * Batch Call Service
 * Manages batch voice call operations using BullMQ and MiniMax
 */

// Initialize BullMQ queue
const QUEUE_NAME = 'batch-calls';
let batchCallQueue;
let isQueueInitialized = false;

try {
    batchCallQueue = new Queue(QUEUE_NAME, {
        connection: redisConfig,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: {
                count: 100, // Keep last 100 completed jobs
                age: 24 * 3600, // Keep for 24 hours
            },
            removeOnFail: {
                count: 200, // Keep last 200 failed jobs
                age: 7 * 24 * 3600, // Keep for 7 days
            },
        },
    });
    isQueueInitialized = true;
    console.log('✅ Batch call queue initialized');
} catch (error) {
    console.error('❌ Failed to initialize batch call queue:', error.message);
    console.warn('⚠️  Batch call functionality will not be available without Redis');
}

const batchCallService = {
    /**
     * Create a new batch call job
     * @param {string[]} leadIds - Array of lead UUIDs
     * @param {string} userId - User ID initiating the batch
     * @param {object} options - Optional call configuration
     * @returns {Promise<object>} Job information
     */
    async createBatchCallJob(leadIds, userId, options = {}) {
        if (!isQueueInitialized) {
            throw new Error('Batch call service not available. Redis connection required.');
        }

        // Validate input
        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            throw new Error('Lead IDs array is required and must not be empty');
        }

        if (leadIds.length > 1000) {
            throw new Error('Maximum 1000 leads per batch');
        }

        // Validate that leads exist and user has access
        const leads = await this.validateLeadsForBatch(leadIds, userId);

        if (leads.length === 0) {
            throw new Error('No valid leads found or access denied');
        }

        // Create job
        const job = await batchCallQueue.add(
            'process-batch-calls',
            {
                leadIds: leads.map(l => l.id),
                userId,
                options: {
                    voiceId: options.voiceId || 'professional_female',
                    callScript: options.callScript || this.getDefaultCallScript(),
                    ...options,
                },
                createdAt: new Date().toISOString(),
            },
            {
                jobId: `batch-${Date.now()}-${userId.substring(0, 8)}`,
            }
        );

        return {
            jobId: job.id,
            status: 'queued',
            totalLeads: leads.length,
            createdAt: new Date().toISOString(),
            estimatedDuration: leads.length * 30, // ~30 seconds per call
        };
    },

    /**
     * Get batch job status
     * @param {string} jobId - Job ID
     * @returns {Promise<object>} Job status and progress
     */
    async getBatchJobStatus(jobId) {
        if (!isQueueInitialized) {
            throw new Error('Batch call service not available');
        }

        const job = await batchCallQueue.getJob(jobId);

        if (!job) {
            return null;
        }

        const state = await job.getState();
        const progress = job.progress || 0;
        const data = job.data;
        const returnValue = job.returnvalue;

        return {
            jobId: job.id,
            status: state,
            progress: {
                percent: progress,
                completed: returnValue?.completed || 0,
                failed: returnValue?.failed || 0,
                total: data.leadIds.length,
            },
            createdAt: data.createdAt,
            startedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
            completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
            results: returnValue?.results || [],
            error: job.failedReason || null,
        };
    },

    /**
     * Get all batch jobs for a user
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of jobs to return
     * @returns {Promise<object[]>} Array of job statuses
     */
    async getUserBatchJobs(userId, limit = 20) {
        if (!isQueueInitialized) {
            throw new Error('Batch call service not available');
        }

        const jobs = await batchCallQueue.getJobs(
            ['completed', 'failed', 'active', 'waiting', 'delayed'],
            0,
            limit
        );

        // Filter by userId
        const userJobs = jobs.filter(job => job.data.userId === userId);

        return await Promise.all(
            userJobs.map(async (job) => {
                const state = await job.getState();
                return {
                    jobId: job.id,
                    status: state,
                    totalLeads: job.data.leadIds.length,
                    createdAt: job.data.createdAt,
                    completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
                };
            })
        );
    },

    /**
     * Validate leads for batch processing
     * @param {string[]} leadIds - Lead IDs to validate
     * @param {string} userId - User requesting access
     * @returns {Promise<object[]>} Valid leads
     */
    async validateLeadsForBatch(leadIds, userId) {
        if (!supabase) {
            throw new Error('Database not configured');
        }

        // Fetch leads with authorization check
        const { data, error } = await supabase
            .from('leads')
            .select('id, first_name, last_name, phone, email, status')
            .in('id', leadIds)
            .or(`assigned_to.eq.${userId}`); // Basic auth - RLS will handle the rest

        if (error) {
            console.error('Error fetching leads:', error);
            throw new Error('Failed to validate leads');
        }

        // Filter out leads without phone numbers
        return data.filter(lead => lead.phone);
    },

    /**
     * Get default call script
     * @returns {string} Default script template
     */
    getDefaultCallScript() {
        return `Hello [FIRST_NAME], this is an automated call from AI Lead IQ. 
We're reaching out to discuss your interest in [PROPERTY_TYPE] properties.
I'd like to share some exciting opportunities that match your criteria.
Would you be interested in scheduling a brief conversation with one of our agents?`;
    },

    /**
     * Process a batch call job (used by worker)
     * @param {object} job - BullMQ job
     * @returns {Promise<object>} Results
     */
    async processBatchCallJob(job) {
        const { leadIds, options } = job.data;
        const results = {
            completed: 0,
            failed: 0,
            results: [],
        };

        for (let i = 0; i < leadIds.length; i++) {
            const leadId = leadIds[i];

            try {
                // Fetch lead details
                const lead = await leadsService.getLeadById(leadId);
                if (!lead) {
                    throw new Error('Lead not found');
                }

                // Generate personalized script
                const script = options.callScript
                    .replace('[FIRST_NAME]', lead.first_name || 'there')
                    .replace('[PROPERTY_TYPE]', lead.property_type || 'real estate');

                // Generate TTS audio using MiniMax
                const audioBuffer = await minimaxService.textToSpeech(script, {
                    voiceId: options.voiceId,
                });

                // In a full implementation, this would:
                // 1. Upload audio to cloud storage
                // 2. Initiate Twilio call with audio URL
                // 3. Track call status

                // For now, we'll create a call log entry
                if (supabase) {
                    await supabase.from('call_logs').insert({
                        lead_id: leadId,
                        direction: 'outbound',
                        outcome: 'successful',
                        summary: 'Batch call initiated',
                        created_at: new Date().toISOString(),
                    });
                }

                results.completed++;
                results.results.push({
                    leadId,
                    status: 'success',
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error(`Failed to process lead ${leadId}:`, error.message);
                results.failed++;
                results.results.push({
                    leadId,
                    status: 'failed',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                });
            }

            // Update progress
            const progress = Math.round(((i + 1) / leadIds.length) * 100);
            await job.updateProgress(progress);

            // Small delay to prevent API rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    },
};

module.exports = batchCallService;
