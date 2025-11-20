/**
 * Database Seeder Script
 * Populates the database with test data for development
 * 
 * Usage: node src/database/seedData.js
 */

const { supabase } = require('../config/supabaseClient');
const { processLeadForGDPR, recordLeadAudit } = require('../utils/gdprUtils');

// Sample test data
const SAMPLE_USERS = [
    {
        email: 'admin@aileadiq.com',
        role: 'admin',
        first_name: 'Sarah',
        last_name: 'Admin',
        phone: '+1-555-0100',
        is_active: true,
    },
    {
        email: 'manager@aileadiq.com',
        role: 'manager',
        first_name: 'Michael',
        last_name: 'Manager',
        phone: '+1-555-0101',
        is_active: true,
    },
    {
        email: 'agent1@aileadiq.com',
        role: 'agent',
        first_name: 'Jessica',
        last_name: 'Smith',
        phone: '+1-555-0102',
        is_active: true,
    },
    {
        email: 'agent2@aileadiq.com',
        role: 'agent',
        first_name: 'David',
        last_name: 'Johnson',
        phone: '+1-555-0103',
        is_active: true,
    },
];

const SAMPLE_LEADS = [
    {
        first_name: 'Emma',
        last_name: 'Wilson',
        email: 'emma.wilson@example.com',
        phone: '+1-555-0200',
        address: '123 Maple Street, Springfield, IL 62701',
        property_type: 'Single Family Home',
        budget: 450000,
        timeline: '3-6 months',
        status: 'new',
        source: 'website',
        notes: 'Interested in properties near good schools',
    },
    {
        first_name: 'Robert',
        last_name: 'Chen',
        email: 'robert.chen@example.com',
        phone: '+1-555-0201',
        address: '456 Oak Avenue, Chicago, IL 60601',
        property_type: 'Condo',
        budget: 350000,
        timeline: '1-3 months',
        status: 'contacted',
        source: 'referral',
        notes: 'Looking for downtown location with parking',
    },
    {
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@example.com',
        phone: '+1-555-0202',
        address: '789 Pine Road, Austin, TX 78701',
        property_type: 'Townhouse',
        budget: 525000,
        timeline: 'ASAP',
        status: 'qualified',
        source: 'social_media',
        notes: 'Pre-approved for mortgage, very motivated buyer',
    },
    {
        first_name: 'James',
        last_name: 'Thompson',
        email: 'james.t@example.com',
        phone: '+1-555-0203',
        address: '321 Elm Street, Seattle, WA 98101',
        property_type: 'Single Family Home',
        budget: 750000,
        timeline: '6-12 months',
        status: 'nurturing',
        source: 'cold_call',
        notes: 'Waiting for current home to sell before purchasing',
    },
    {
        first_name: 'Lisa',
        last_name: 'Anderson',
        email: 'lisa.anderson@example.com',
        phone: '+1-555-0204',
        address: '654 Cedar Lane, Portland, OR 97201',
        property_type: 'Condo',
        budget: 425000,
        timeline: '3-6 months',
        status: 'new',
        source: 'advertisement',
        notes: 'First-time home buyer',
    },
];

const SAMPLE_CALL_LOGS = [
    {
        // Will be linked to lead after creation
        duration: 180,
        direction: 'outbound',
        transcript: 'Agent: Hi Emma, this is Jessica from AI Lead IQ. I saw you were interested in properties near good schools...\nEmma: Yes! I have two kids and education is very important to us.',
        summary: 'Initial call with Emma Wilson. Discussed school district preferences and budget. She is very interested in viewing properties next week.',
        sentiment: 'positive',
        sentiment_score: 0.85,
        outcome: 'successful',
        follow_up_required: true,
        call_quality_score: 0.92,
    },
    {
        duration: 95,
        direction: 'outbound',
        transcript: 'Agent: Hi Robert, following up on your condo search...\nRobert: Thanks for calling. I actually found a place already.',
        summary: 'Follow-up call with Robert Chen. He has already found a property through another agent.',
        sentiment: 'neutral',
        sentiment_score: 0.0,
        outcome: 'successful',
        follow_up_required: false,
        call_quality_score: 0.75,
    },
    {
        duration: 0,
        direction: 'outbound',
        transcript: null,
        summary: 'No answer',
        sentiment: null,
        sentiment_score: null,
        outcome: 'no_answer',
        follow_up_required: true,
        call_quality_score: null,
    },
];

/**
 * Clear existing data (for development only)
 */
async function clearData() {
    console.log('🗑️  Clearing existing data...');

    try {
        // Delete in reverse order due to foreign key constraints
        await supabase.from('call_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('lead_scoring_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('✅ Data cleared');
    } catch (error) {
        console.error('❌ Error clearing data:', error.message);
    }
}

/**
 * Seed users
 */
async function seedUsers() {
    console.log('\n👥 Seeding users...');

    const { data, error } = await supabase
        .from('users')
        .insert(SAMPLE_USERS)
        .select();

    if (error) {
        console.error('❌ Error seeding users:', error.message);
        return [];
    }

    console.log(`✅ Created ${data.length} users`);
    return data;
}

/**
 * Seed leads with GDPR compliance
 */
async function seedLeads(users) {
    console.log('\n📋 Seeding leads with GDPR compliance...');

    // Randomly assign leads to agents
    const agents = users.filter(u => u.role === 'agent');

    const leadsWithGDPR = SAMPLE_LEADS.map((lead, index) => {
        // Process lead for GDPR compliance (adds hashes and consent)
        const processed = processLeadForGDPR(lead);

        // Assign to random agent
        if (agents.length > 0) {
            processed.assigned_to = agents[index % agents.length].id;
        }

        return processed;
    });

    const { data, error } = await supabase
        .from('leads')
        .insert(leadsWithGDPR)
        .select();

    if (error) {
 */
        async function seedCallLogs(leads, users) {

            if (error) {
                console.error('❌ Error seeding call logs:', error.message);
                return [];
            }

            console.log(`✅ Created ${data.length} call logs`);
            return data;
        }

        /**
         * Main seeder function
         */
        async function seed() {
            console.log('🌱 Starting database seeding...\n');
            console.log('⚠️  WARNING: This will clear all existing data!\n');

            try {
                // Clear existing data
                await clearData();

                // Seed in order (respecting foreign key constraints)
                const users = await seedUsers();
                const leads = await seedLeads(users);
                const callLogs = await seedCallLogs(leads, users);

                console.log('\n✅ Database seeding completed successfully!');
                console.log('\n📊 Summary:');
                console.log(`   - Users: ${users.length}`);
                console.log(`   - Leads: ${leads.length}`);
                console.log(`   - Call Logs: ${callLogs.length}`);
                console.log('\n💡 Sample queries to try:');
                console.log('   - SELECT * FROM high_value_leads;');
                console.log('   - SELECT * FROM lead_performance_summary;');
                console.log('   - SELECT * FROM leads WHERE score > 0.8;');

            } catch (error) {
                console.error('\n❌ Seeding failed:', error.message);
                process.exit(1);
            }
        }

        // Run seeder if executed directly
        if (require.main === module) {
            seed()
                .then(() => process.exit(0))
                .catch((error) => {
                    console.error('Fatal error:', error);
                    process.exit(1);
                });
        }

        module.exports = { seed, clearData, seedUsers, seedLeads, seedCallLogs };
