/**
 * 🔑 GET YOUR SUPABASE SERVICE ROLE KEY
 * 
 * This key is needed to populate the database with test data.
 * The anon key doesn't have enough permissions to insert data.
 * 
 * HOW TO GET IT:
 * ==============
 * 1. Go to: https://supabase.com/dashboard/project/zhcnletorwzgzfzfoqtp/settings/api
 * 2. Scroll down to "Project API keys"
 * 3. Find "service_role" key (NOT the anon key)
 * 4. Click the eye icon to reveal it
 * 5. Copy the ENTIRE key
 * 6. Open backend/.env file
 * 7. Replace the value for SUPABASE_SERVICE_ROLE_KEY
 * 
 * Example .env entry:
 * SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
 * 
 * ⚠️  IMPORTANT: 
 * - This key should be VERY LONG (500+ characters)
 * - It should start with: eyJhbGciOiJIUzI1NiI
 * - Keep this key SECRET - never commit to Git!
 * - This key has FULL DATABASE ACCESS
 */

require('dotenv').config();

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔐 SUPABASE SERVICE ROLE KEY CHECK\n');
console.log('═'.repeat(50));

if (!serviceRoleKey) {
    console.log('\n❌ SUPABASE_SERVICE_ROLE_KEY is not set!\n');
} else if (serviceRoleKey.startsWith('your_')) {
    console.log('\n❌ SUPABASE_SERVICE_ROLE_KEY is still the placeholder!\n');
    console.log('Current value:', serviceRoleKey);
} else if (serviceRoleKey.length < 100) {
    console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY looks too short!\n');
    console.log('Length:', serviceRoleKey.length, 'characters');
    console.log('Expected: 500+ characters');
} else if (!serviceRoleKey.startsWith('eyJ')) {
    console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY has unexpected format!\n');
    console.log('It should start with: eyJ');
    console.log('It starts with:', serviceRoleKey.substring(0, 10));
} else {
    console.log('\n✅ SUPABASE_SERVICE_ROLE_KEY looks valid!\n');
    console.log('Length:', serviceRoleKey.length, 'characters');
    console.log('Starts with:', serviceRoleKey.substring(0, 20) + '...');
    console.log('\n✅ Ready to run the seed data generator!\n');
    console.log('Run: node src/database/generateSeedData.js\n');
    process.exit(0);
}

console.log('\n📝 NEXT STEPS:\n');
console.log('1. Open: https://supabase.com/dashboard/project/zhcnletorwzgzfzfoqtp/settings/api');
console.log('2. Find "service_role" key (scroll down)');
console.log('3. Click eye icon to reveal');
console.log('4. Copy the entire key');
console.log('5. Open: backend/.env');
console.log('6. Update: SUPABASE_SERVICE_ROLE_KEY=<paste_key_here>');
console.log('7. Save the file');
console.log('8. Run this check again: node src/database/checkConfig.js\n');

process.exit(1);
