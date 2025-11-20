const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const client = new SecretManagerServiceClient();
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'monospace-13';

const SECRETS_TO_SYNC = [
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
    'MINIMAX_API_KEY',
    'MINIMAX_GROUP_ID',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'REDIS_URL',
    'ENCRYPTION_KEY'
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createOrUpdateSecret(secretId, payload) {
    const parent = `projects/${PROJECT_ID}`;

    try {
        // Try to create the secret first
        await client.createSecret({
            parent,
            secretId,
            secret: {
                replication: {
                    automatic: {},
                },
            },
        });
        console.log(`Created secret: ${secretId}`);
    } catch (error) {
        if (error.code === 6) { // ALREADY_EXISTS
            console.log(`Secret ${secretId} already exists, adding new version...`);
        } else if (error.message && error.message.includes('Could not load the default credentials')) {
            console.error('\n❌ Error: Google Cloud credentials not found.');
            console.error('To fix this, please install the Google Cloud SDK and run:');
            console.error('  gcloud auth application-default login');
            console.error('\nFor now, the application will use values from your .env file locally.\n');
            // We don't exit here to allow the script to continue if used as a library, 
            // but in this CLI context we should probably stop or just warn.
            // Let's throw to be caught by main
            throw new Error('Missing GCP Credentials');
        } else {
            console.error(`Failed to create secret ${secretId}:`, error.message);
            return;
        }
    }

    try {
        // Add the secret version
        await client.addSecretVersion({
            parent: `projects/${PROJECT_ID}/secrets/${secretId}`,
            payload: {
                data: Buffer.from(payload, 'utf8'),
            },
        });
        console.log(`Added new version for: ${secretId}`);
    } catch (error) {
        console.error(`Failed to add version for ${secretId}:`, error.message);
    }
}

async function main() {
    console.log(`Using Project ID: ${PROJECT_ID}`);
    console.log('Starting secret synchronization...');

    try {
        for (const secretName of SECRETS_TO_SYNC) {
            let value = process.env[secretName];

            if (!value) {
                const answer = await question(`Value for ${secretName} is missing in .env. Enter value (or skip): `);
                if (answer.trim()) {
                    value = answer.trim();
                } else {
                    console.log(`Skipping ${secretName}`);
                    continue;
                }
            }

            await createOrUpdateSecret(secretName, value);
        }
        console.log('Secret synchronization complete!');
    } catch (error) {
        if (error.message === 'Missing GCP Credentials') {
            console.log('Skipping secret upload due to missing credentials.');
        } else {
            console.error('Unexpected error:', error);
        }
    } finally {
        rl.close();
    }
}

main().catch(console.error);
