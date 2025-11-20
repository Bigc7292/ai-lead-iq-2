/**
 * Google Cloud Secret Manager Integration
 * Handles retrieval of secrets from GCP Secret Manager with local fallback
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
require('dotenv').config();

// Initialize the client
// Note: When running on Cloud Run, authentication is handled automatically via the service account
// For local development, it uses Application Default Credentials (ADC) if configured,
// otherwise it falls back to process.env
const client = new SecretManagerServiceClient();

// Cache for secrets to reduce API calls
const secretCache = {};

/**
 * Retrieves a secret from Google Cloud Secret Manager or falls back to process.env
 * @param {string} secretName - The name of the secret to retrieve (e.g., 'DB_PASSWORD')
 * @param {string} [projectId] - Optional project ID, defaults to process.env.GOOGLE_CLOUD_PROJECT
 * @returns {Promise<string>} - The secret value
 */
async function getSecret(secretName, projectId = process.env.GOOGLE_CLOUD_PROJECT) {
    // 1. Check if the secret is already in the environment variables (Local Development / CI override)
    // This allows .env files to take precedence locally if they exist
    if (process.env[secretName]) {
        return process.env[secretName];
    }

    // 2. If not in env and no project ID is available, we can't fetch from Secret Manager
    // This usually happens in local dev without .env and without GCP setup
    if (!projectId) {
        console.warn(`Warning: Secret '${secretName}' not found in environment and no GOOGLE_CLOUD_PROJECT defined.`);
        return undefined;
    }

    // 3. Check cache
    if (secretCache[secretName]) {
        return secretCache[secretName];
    }

    try {
        // 4. Fetch from Secret Manager
        // Construct the resource name of the secret version
        const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

        const [version] = await client.accessSecretVersion({
            name: name,
        });

        // Extract the payload as a string
        const payload = version.payload.data.toString();

        // Cache the result
        secretCache[secretName] = payload;

        return payload;
    } catch (error) {
        console.error(`Error fetching secret '${secretName}' from Secret Manager:`, error.message);
        // Return undefined so the caller can handle the missing configuration
        return undefined;
    }
}

module.exports = {
    getSecret
};
