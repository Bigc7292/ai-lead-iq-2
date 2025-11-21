/**
 * Quick verification script to check if seed data was inserted
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY // Using anon key for read-only check
);

async function checkData() {
    console.log('\n🔍 Checking database for seed data...\n');
    console.log('═'.repeat(50));

    const tables = [
        'users',
        'leads',
        'campaigns',
        'campaign_leads',
        'call_logs',
        'email_logs',
        'sms_logs',
        'ai_workflows'
    ];

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table.padEnd(20)} Error: ${error.message}`);
            } else {
                const emoji = count > 0 ? '✅' : '⚠️';
                console.log(`${emoji} ${table.padEnd(20)} ${count || 0} rows`);
            }
        } catch (err) {
            console.log(`❌ ${table.padEnd(20)} Error: ${err.message}`);
        }
    }

    console.log('═'.repeat(50));
    console.log('\n');
}

checkData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
