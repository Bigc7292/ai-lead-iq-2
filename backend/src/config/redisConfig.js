const Redis = require('ioredis');
const { getSecret } = require('./secretManager');

let redisClient = null;

const getRedisClient = async () => {
    if (redisClient) return redisClient;

    const redisUrl = await getSecret('REDIS_URL');

    if (redisUrl) {
        console.log('Initializing Redis with URL from secrets...');
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
    } else {
        // Fallback to individual parameters if URL is not set
        const host = await getSecret('REDIS_HOST') || 'localhost';
        const port = await getSecret('REDIS_PORT') || 6379;
        const password = await getSecret('REDIS_PASSWORD');
        const db = await getSecret('REDIS_DB') || 0;

        console.log(`Initializing Redis with host: ${host}, port: ${port}...`);
        redisClient = new Redis({
            host,
            port,
            password,
            db,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
    }

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));
    redisClient.on('reconnecting', () => console.log('🔄 Reconnecting to Redis...'));

    return redisClient;
};

/**
 * Test Redis connection
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
const testRedisConnection = async () => {
    try {
        const redis = await getRedisClient();
        await redis.ping();
        console.log('✅ Redis ping successful');
        return true;
    } catch (error) {
        console.error('❌ Redis ping failed:', error.message);
        return false;
    }
};

module.exports = {
    getRedisClient,
    testRedisConnection
};
