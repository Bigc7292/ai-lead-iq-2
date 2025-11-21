/**
 * 🌱 DATABASE SEED DATA GENERATOR
 * Creates 200 rows of realistic test data based on frontend screenshots
 * Voice Platform: VAPI
 * 
 * Usage: node backend/src/database/generateSeedData.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS
);

// ============================================
// DATA GENERATORS
// ============================================

const FIRST_NAMES = [
    'Emily', 'John', 'Sarah', 'Michael', 'Jessica', 'David', 'Jennifer', 'Robert',
    'Maria', 'James', 'Lisa', 'William', 'Amanda', 'Richard', 'Michelle', 'Christopher',
    'Ashley', 'Daniel', 'Stephanie', 'Matthew', 'Nicole', 'Anthony', 'Rebecca', 'Mark',
    'Laura', 'Steven', 'Rachel', 'Andrew', 'Melissa', 'Brian', 'Kimberly', 'Kevin',
    'Elizabeth', 'Kenneth', 'Lauren', 'Joshua', 'Angela', 'Ryan', 'Amy', 'Jacob'
];

const LAST_NAMES = [
    'Chen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson',
    'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Green'
];

const COMPANIES = [
    'TechCorp Inc.', 'Global Solutions LLC', 'Innovation Labs', 'DataDrive Systems',
    'CloudFirst Technologies', 'NextGen Enterprises', 'Digital Dynamics', 'Smart Industries',
    'Future Works Co.', 'Prime Ventures', 'Elite Group', 'Apex Solutions', 'Vertex Inc.',
    'Summit Partners', 'Horizon Technologies', 'Pinnacle Corp', 'Quantum Systems',
    'Catalyst Innovations', 'Momentum Group', 'Vanguard Solutions', 'Nexus Enterprises',
    'Synergy Tech', 'Insight Partners', 'Spark Innovations', 'Zenith Corp', 'Atlas Group',
    'Omni Solutions', 'Unity Technologies', 'Fusion Enterprises', 'Core Systems',
    'Bright Future Inc.', 'Swift Innovations', 'Anchor Group', 'Beacon Technologies',
    'Crown Enterprises', 'Diamond Solutions', 'Eclipse Systems', 'Forge Group',
    'Gateway Technologies', 'Harbor Solutions'
];

const TITLES = [
    'CEO', 'CTO', 'CFO', 'VP Sales', 'VP Marketing', 'VP Operations', 'Director of Sales',
    'Sales Manager', 'Marketing Manager', 'Operations Manager', 'Business Development Manager',
    'Account Executive', 'Sales Director', 'Marketing Director', 'General Manager',
    'Regional Manager', 'Branch Manager', 'Product Manager', 'Project Manager',
    'Customer Success Manager', 'Head of Growth', 'Chief Revenue Officer', 'Founder',
    'Co-Founder', 'Managing Director', 'Executive Director', 'Senior Vice President',
    'Vice President', 'President', 'Owner'
];

// Exact values from Add Lead Form screenshot
const SOURCES = [
    'LinkedIn', 'Webinar', 'Referral', 'Cold Outreach', 'Website',
    'Advertisement', 'Social Media'
];

// Exact values from filter tabs
const STATUSES = [
    'Interested', 'Contacted', 'Qualified', 'Not Interested', 'Converted'
];

const PRIORITIES = ['High', 'Medium', 'Low'];

// Exact values from call logs
const CALL_TYPES = ['Outbound', 'Inbound'];

const OUTCOMES = [
    'Meeting Booked', 'Callback Requested', 'Not Interested',
    'Voicemail', 'No Answer', 'Interested', 'Follow-up Required'
];

const SENTIMENTS = ['positive', 'neutral', 'negative', 'mixed'];

const INDUSTRIES = [
    'Technology', 'Healthcare', 'Real Estate', 'Finance',
    'Retail', 'Manufacturing', 'Mixed'
];

const CAMPAIGN_NAMES = [
    'Mixed Industry Pilot', 'Tech Startup Outreach', 'Healthcare Q4 Campaign',
    'Real Estate Leads Drive', 'Finance Sector Push', 'Retail Holiday Campaign',
    'B2B Prospecting Q1', 'Enterprise Outreach', 'SMB Growth Initiative',
    'Referral Partner Program', 'LinkedIn Lead Gen', 'Webinar Follow-up Campaign',
    'Cold Call Blitz', 'Email Nurture Sequence', 'Re-engagement Campaign'
];

const CALL_TRANSCRIPTS = [
    'Agent: Hi, this is calling from AI Lead IQ. I wanted to reach out about our sales automation platform...\nLead: Oh yes, I saw your email. Tell me more...',
    'Agent: Good morning! I\'m following up on your interest in our AI calling solution...\nLead: Great timing, I was just looking into this!',
    'Agent: Hello, this is AI Lead IQ. We help companies book more meetings through AI...\nLead: I\'m actually not interested right now, but thanks.',
    'Agent: Hi, wanted to see if you\'d be interested in a quick demo of our platform...\nLead: Sure, I have time next week. Let\'s schedule something.',
    'Agent: Good afternoon! Calling about automating your sales outreach...\nLead: We already have a solution in place, so we\'re all set.',
    '[No response - Voicemail left with callback number and brief message]',
    'Agent: Hi there, following up from our webinar last week...\nLead: Yes! I have some questions about pricing and features.',
    'Agent: Hello, this is AI Lead IQ. Can I speak with the VP of Sales?\nLead: This is she. How can I help you?',
    'Agent: Reaching out to discuss how we can help with your cold calling...\nLead: Not right now, maybe check back in 3 months.',
    'Agent: Good morning! I saw you downloaded our whitepaper...\nLead: Yes, very interested. Let\'s schedule a call.'
];

// Helper functions
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName, lastName, company) {
    const cleanFirst = firstName.toLowerCase();
    const cleanLast = lastName.toLowerCase();
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const formats = [
        `${cleanFirst}.${cleanLast}@${cleanCompany}.com`,
        `${cleanFirst}${cleanLast}@${cleanCompany}.com`,
        `${cleanFirst[0]}${cleanLast}@${cleanCompany}.com`,
        `${cleanFirst}_${cleanLast}@${cleanCompany}.com`
    ];
    return randomElement(formats);
}

function generatePhone() {
    return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

// ============================================
// CLEAR EXISTING DATA
// ============================================

async function clearDatabase() {
    console.log('\n🗑️  Clearing existing data...\n');

    try {
        // Delete in reverse order (foreign key constraints)
        await supabase.from('workflow_executions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ai_workflows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sms_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('email_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('dashboard_analytics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('call_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('campaign_leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('✅ Database cleared\n');
    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
        throw error;
    }
}

// ============================================
// SEED USERS
// ============================================

async function seedUsers() {
    console.log('👥 Seeding users...\n');

    const users = [
        {
            email: 'colinloader061@gmail.com',
            password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456', // Mock hash
            first_name: 'Colin',
            last_name: 'Loader',
            company_name: 'AI Lead IQ',
            company_email: 'contact@aileadiq.com',
            industry: 'Technology',
            team_size: '1-10',
            role: 'admin',
            subscription_plan: 'Pro',
            subscription_status: 'active',
            is_active: true
        },
        {
            email: 'sarah.manager@aileadiq.com',
            password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
            first_name: 'Sarah',
            last_name: 'Johnson',
            company_name: 'AI Lead IQ',
            role: 'manager',
            is_active: true
        },
        {
            email: 'agent1@aileadiq.com',
            password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
            first_name: 'Mike',
            last_name: 'Smith',
            company_name: 'AI Lead IQ',
            role: 'agent',
            is_active: true
        },
        {
            email: 'agent2@aileadiq.com',
            password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
            first_name: 'Jessica',
            last_name: 'Williams',
            company_name: 'AI Lead IQ',
            role: 'agent',
            is_active: true
        }
    ];

    const { data, error } = await supabase
        .from('users')
        .insert(users)
        .select();

    if (error) {
        console.error('❌ Error seeding users:', error.message);
        throw error;
    }

    console.log(`✅ Created ${data.length} users\n`);
    return data;
}

// ============================================
// SEED LEADS (200 rows)
// ============================================

async function seedLeads(users) {
    console.log('📋 Seeding 200 leads...\n');

    const agents = users.filter(u => u.role === 'agent');
    const leads = [];

    for (let i = 0; i < 200; i++) {
        const firstName = randomElement(FIRST_NAMES);
        const lastName = randomElement(LAST_NAMES);
        const company = randomElement(COMPANIES);

        leads.push({
            first_name: firstName,
            last_name: lastName,
            company: company,
            title: randomElement(TITLES),
            email: generateEmail(firstName, lastName, company),
            phone: generatePhone(),
            source: randomElement(SOURCES),
            status: randomElement(STATUSES),
            priority: randomElement(PRIORITIES),
            score: randomDecimal(0, 1, 2),
            assigned_to: agents.length > 0 ? randomElement(agents).id : null,
            notes: i % 5 === 0 ? 'High priority follow-up required' : null,
            created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString()
        });
    }

    // Insert in batches of 50 to avoid payload limits
    const batchSize = 50;
    let insertedLeads = [];

    for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const { data, error } = await supabase
            .from('leads')
            .insert(batch)
            .select();

        if (error) {
            console.error(`❌ Error seeding leads batch ${i / batchSize + 1}:`, error.message);
            throw error;
        }

        insertedLeads = insertedLeads.concat(data);
        console.log(`   Inserted leads ${i + 1}-${Math.min(i + batchSize, leads.length)}`);
    }

    console.log(`\n✅ Created ${insertedLeads.length} leads\n`);
    return insertedLeads;
}

// ============================================
// SEED CAMPAIGNS
// ============================================

async function seedCampaigns(users) {
    console.log('🎯 Seeding campaigns...\n');

    const campaigns = CAMPAIGN_NAMES.map(name => ({
        campaign_name: name,
        industry: randomElement(INDUSTRIES),
        status: randomElement(['Active', 'Active', 'Paused']), // More active campaigns
        conversion_rate: randomDecimal(5, 25, 2),
        cost_per_meeting: randomDecimal(80, 200, 2),
        leads_processed: randomInt(20, 100),
        target_leads: randomInt(100, 500),
        created_by: users[0].id,
        created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString()
    }));

    const { data, error } = await supabase
        .from('campaigns')
        .insert(campaigns)
        .select();

    if (error) {
        console.error('❌ Error seeding campaigns:', error.message);
        throw error;
    }

    console.log(`✅ Created ${data.length} campaigns\n`);
    return data;
}

// ============================================
// SEED CAMPAIGN LEADS
// ============================================

async function seedCampaignLeads(campaigns, leads) {
    console.log('🔗 Linking leads to campaigns...\n');

    const campaignLeads = [];

    // Assign random leads to each campaign
    campaigns.forEach(campaign => {
        const numLeads = randomInt(10, 30);
        const selectedLeads = [];

        for (let i = 0; i < numLeads; i++) {
            const lead = randomElement(leads);
            if (!selectedLeads.includes(lead.id)) {
                selectedLeads.push(lead.id);
                campaignLeads.push({
                    campaign_id: campaign.id,
                    lead_id: lead.id,
                    campaign_status: randomElement(['queued', 'in_progress', 'contacted', 'completed']),
                    added_at: randomDate(new Date(campaign.created_at), new Date()).toISOString()
                });
            }
        }
    });

    const { data, error } = await supabase
        .from('campaign_leads')
        .insert(campaignLeads)
        .select();

    if (error) {
        console.error('❌ Error seeding campaign leads:', error.message);
        throw error;
    }

    console.log(`✅ Created ${data.length} campaign-lead associations\n`);
    return data;
}

// ============================================
// SEED CALL LOGS
// ============================================

async function seedCallLogs(leads, users, campaigns) {
    console.log('📞 Seeding call logs...\n');

    const agents = users.filter(u => u.role === 'agent');
    const callLogs = [];

    // Create 300+ calls (more than leads, some leads have multiple calls)
    for (let i = 0; i < 350; i++) {
        const lead = randomElement(leads);
        const outcome = randomElement(OUTCOMES);
        const callType = randomElement(CALL_TYPES);
        const duration = outcome === 'No Answer' || outcome === 'Voicemail'
            ? randomInt(0, 30)
            : randomInt(60, 600);

        callLogs.push({
            lead_id: lead.id,
            agent_id: randomElement(agents).id,
            campaign_id: Math.random() > 0.3 ? randomElement(campaigns).id : null,
            call_type: callType,
            outcome: outcome,
            duration: duration,
            transcript: duration > 30 ? randomElement(CALL_TRANSCRIPTS) : null,
            notes: Math.random() > 0.5 ? 'Follow-up scheduled' : null,
            vapi_call_id: `vapi_call_${Date.now()}_${i}`,
            vapi_session_id: `vapi_session_${Date.now()}_${i}`,
            vapi_assistant_id: 'asst_lead_qualification_v1',
            sentiment: randomElement(SENTIMENTS),
            sentiment_score: randomDecimal(-1, 1, 2),
            call_quality_score: randomDecimal(0.5, 1, 2),
            cost: randomDecimal(0.50, 3.00, 4),
            follow_up_required: outcome === 'Callback Requested' || outcome === 'Follow-up Required',
            created_at: randomDate(new Date('2024-10-01'), new Date()).toISOString()
        });
    }

    // Insert in batches
    const batchSize = 50;
    let insertedCalls = [];

    for (let i = 0; i < callLogs.length; i += batchSize) {
        const batch = callLogs.slice(i, i + batchSize);
        const { data, error } = await supabase
            .from('call_logs')
            .insert(batch)
            .select();

        if (error) {
            console.error(`❌ Error seeding call logs batch ${i / batchSize + 1}:`, error.message);
            throw error;
        }

        insertedCalls = insertedCalls.concat(data);
        console.log(`   Inserted calls ${i + 1}-${Math.min(i + batchSize, callLogs.length)}`);
    }

    console.log(`\n✅ Created ${insertedCalls.length} call logs\n`);
    return insertedCalls;
}

// ============================================
// SEED EMAIL & SMS LOGS
// ============================================

async function seedEmailLogs(leads) {
    console.log('📧 Seeding email logs...\n');

    const emails = [];
    for (let i = 0; i < 1500; i++) {
        emails.push({
            lead_id: randomElement(leads).id,
            subject: 'Quick question about your sales process',
            email_type: randomElement(['outreach', 'follow_up', 'nurture']),
            status: randomElement(['sent', 'delivered', 'opened', 'clicked']),
            sent_at: randomDate(new Date('2024-10-01'), new Date()).toISOString()
        });
    }

    // Insert in batches
    const batchSize = 100;
    let total = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const { data, error } = await supabase.from('email_logs').insert(batch).select();
        if (error) throw error;
        total += data.length;
    }

    console.log(`✅ Created ${total} email logs\n`);
}

async function seedSMSLogs(leads) {
    console.log('💬 Seeding SMS logs...\n');

    const smsLogs = [];
    for (let i = 0; i < 800; i++) {
        smsLogs.push({
            lead_id: randomElement(leads).id,
            message: 'Hi! Quick question about scheduling a demo. Let me know!',
            to_phone: generatePhone(),
            sms_type: randomElement(['outreach', 'follow_up', 'reminder']),
            status: randomElement(['sent', 'delivered']),
            cost: randomDecimal(0.01, 0.05, 4),
            sent_at: randomDate(new Date('2024-10-01'), new Date()).toISOString()
        });
    }

    const batchSize = 100;
    let total = 0;

    for (let i = 0; i < smsLogs.length; i += batchSize) {
        const batch = smsLogs.slice(i, i + batchSize);
        const { data, error } = await supabase.from('sms_logs').insert(batch).select();
        if (error) throw error;
        total += data.length;
    }

    console.log(`✅ Created ${total} SMS logs\n`);
}

// ============================================
// SEED AI WORKFLOWS
// ============================================

async function seedAIWorkflows(users) {
    console.log('🤖 Seeding AI workflows...\n');

    const workflows = [
        {
            workflow_name: 'New Lead Qualification',
            workflow_type: 'lead_qualification',
            description: 'Automatically qualify new leads based on profile and engagement',
            is_template: true,
            is_active: true,
            created_by: users[0].id
        },
        {
            workflow_name: 'Long-term Follow-up',
            workflow_type: 'follow_up',
            description: 'Re-engage leads that haven\'t responded in 30+ days',
            is_template: true,
            is_active: true,
            created_by: users[0].id
        },
        {
            workflow_name: 'Re-engagement Campaign',
            workflow_type: 're_engagement',
            description: 'Win back leads marked as "Not Interested"',
            is_template: true,
            is_active: true,
            created_by: users[0].id
        },
        {
            workflow_name: 'Meeting Confirmation',
            workflow_type: 'meeting_confirmation',
            description: 'Automated meeting confirmations and reminders',
            is_template: true,
            is_active: true,
            created_by: users[0].id
        }
    ];

    const { data, error } = await supabase
        .from('ai_workflows')
        .insert(workflows)
        .select();

    if (error) {
        console.error('❌ Error seeding workflows:', error.message);
        throw error;
    }

    console.log(`✅ Created ${data.length} AI workflows\n`);
    return data;
}

// ============================================
// MAIN SEEDER
// ============================================

async function seed() {
    console.log('\n════════════════════════════════════════════════');
    console.log('🌱 AI LEAD IQ - DATABASE SEEDER');
    console.log('════════════════════════════════════════════════\n');
    console.log('📊 Target: 200 leads + comprehensive test data');
    console.log('🤖 Voice Platform: VAPI\n');
    console.log('⚠️  WARNING: This will delete ALL existing data!\n');

    try {
        // Clear database
        await clearDatabase();

        // Seed in order (respecting foreign keys)
        const users = await seedUsers();
        const leads = await seedLeads(users);
        const campaigns = await seedCampaigns(users);
        const campaignLeads = await seedCampaignLeads(campaigns, leads);
        const callLogs = await seedCallLogs(leads, users, campaigns);
        await seedEmailLogs(leads);
        await seedSMSLogs(leads);
        const workflows = await seedAIWorkflows(users);

        console.log('\n════════════════════════════════════════════════');
        console.log('✅ DATABASE SEEDING COMPLETE!');
        console.log('════════════════════════════════════════════════\n');
        console.log('📊 Summary:\n');
        console.log(`   👥 Users: ${users.length}`);
        console.log(`   📋 Leads: ${leads.length}`);
        console.log(`   🎯 Campaigns: ${campaigns.length}`);
        console.log(`   🔗 Campaign-Lead Links: ${campaignLeads.length}`);
        console.log(`   📞 Call Logs: ${callLogs.length}`);
        console.log(`   📧 Email Logs: 1,500`);
        console.log(`   💬 SMS Logs: 800`);
        console.log(`   🤖 AI Workflows: ${workflows.length}\n`);
        console.log('🔐 Test Login:\n');
        console.log('   Email: colinloader061@gmail.com');
        console.log('   Password: password123\n');
        console.log('════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ SEEDING FAILED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run seeder
if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { seed };
