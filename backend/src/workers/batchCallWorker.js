const { Worker } = require('bullmq');
const { redisConfig } = require('../config/redisConfig');
const batchCallService = require('../services/batchCallService');

/**
 * BullMQ Worker for Batch Call Processing
 * Processes batch call jobs in the background
 */

const QUEUE_NAME = 'batch-calls';
const CONCURRENCY = 5; // Process up to 5 leads concurrently

let worker;

try {
    worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            console.log(`Processing batch call job: ${job.id}`);
            console.log(`Total leads: ${job.data.leadIds.length}`);

            const results = await batchCallService.processBatchCallJob(job);

            console.log(`Batch job ${job.id} completed:`);
            console.log(`  ✅ Successful: ${results.completed}`);
            console.log(`  ❌ Failed: ${results.failed}`);

            return results;
        },
        {
            connection: redisConfig,
            concurrency: CONCURRENCY,
            limiter: {
                max: 10, // Max 10 jobs
                duration: 1000, // per second
            },
        }
    );

    worker.on('completed', (job, returnvalue) => {
        console.log(`✅ Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
        console.error('❌ Worker error:', err.message);
    });

    console.log('✅ Batch call worker started');
    console.log(`   Concurrency: ${CONCURRENCY}`);
    console.log(`   Queue: ${QUEUE_NAME}`);
} catch (error) {
    console.error('❌ Failed to start batch call worker:', error.message);
    console.warn('⚠️  Batch calls will not be processed without Redis');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing worker...');
    if (worker) {
        await worker.close();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing worker...');
    if (worker) {
        await worker.close();
    }
    process.exit(0);
});

module.exports = worker;
