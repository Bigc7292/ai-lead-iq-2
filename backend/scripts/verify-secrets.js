const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
require('dotenv').config();

const client = new SecretManagerServiceClient();
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'monospace-13';

const REQUIRED_SECRETS = [
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
    'MINIMAX_API_KEY',
    'MINIMAX_GROUP_ID',
    'REDIS_URL',
    'ENCRYPTION_KEY'
];

async function verifySecret(secretName) {
    try {
        const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
        await client.accessSecretVersion({ name });
        console.log(`✅ ${secretName}: Found`);
        return true;
    } catch (error) {
        console.error(`❌ ${secretName}: Missing or Inaccessible (${error.message})`);
        return false;
    }
}

async function main() {
    console.log(`Verifying secrets for Project ID: ${PROJECT_ID}`);

    let allFound = true;
    for (const secret of REQUIRED_SECRETS) {
        const found = await verifySecret(secret);
        if (!found) allFound = false;
    }

    if (allFound) {
        console.log('\nAll required secrets are present in Secret Manager!');
        process.exit(0);
    } else {
        console.error('\nSome secrets are missing. Please run npm run secrets:setup');
        process.exit(1);
    }
}

main().catch(console.error);
