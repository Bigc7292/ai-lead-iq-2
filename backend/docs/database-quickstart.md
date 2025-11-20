# Database Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### Step 2: Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run Database Migration
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `src/database/schema.sql`
5. Paste and click **Run**
6. Verify tables were created in the **Table Editor**

### Step 4: Seed Test Data (Optional)
```bash
# Make sure your .env is configured
node src/database/seedData.js
```

✅ **Done!** Your database is ready.

---

## 📋 Common Queries

### Get High-Value Leads
```sql
SELECT * FROM high_value_leads;
```

### Get All Leads with Call Count
```sql
SELECT * FROM lead_performance_summary;
```

### Find Leads Needing Follow-Up
```sql
SELECT l.first_name, l.last_name, l.phone, cl.follow_up_date
FROM leads l
INNER JOIN call_logs cl ON cl.lead_id = l.id
WHERE cl.follow_up_required = true
  AND cl.follow_up_date <= NOW()
ORDER BY cl.follow_up_date ASC;
```

---

## 🔑 Key Features

### Auto-Scoring
Leads are automatically scored on creation based on:
- Has email: +15%
- Has phone: +15%
- Has budget: +20%
- Has timeline: +10%
- Has property type: +10%

### GDPR Compliance
- Email and phone automatically hashed
- Blockchain transaction hash generated (stub)
- Consent tracking built-in
- PII sanitization utilities available

### Row-Level Security
- Agents only see their assigned leads
- Managers/Admins see all leads
- Automatic filtering by user role

---

## 🛠 Using the Database in Code

### Query Leads
```javascript
const { supabase } = require('./config/supabaseClient');

// Get all leads with score > 0.8
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .gt('score', 0.8)
  .order('score', { ascending: false });
```

### Create Lead with GDPR Compliance
```javascript
const { processLeadForGDPR } = require('./utils/gdprUtils');

const leadData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-1234',
  budget: 500000,
};

// Add GDPR hashes automatically
const processed = processLeadForGDPR(leadData);

const { data, error } = await supabase
  .from('leads')
  .insert([processed])
  .select();
```

### Log a Call
```javascript
const callLog = {
  lead_id: 'uuid-here',
  agent_id: 'uuid-here',
  duration: 180,
  direction: 'outbound',
  transcript: 'Call transcript here...',
  sentiment: 'positive',
  sentiment_score: 0.85,
  outcome: 'successful',
  follow_up_required: true,
};

const { data, error } = await supabase
  .from('call_logs')
  .insert([callLog])
  .select();
```

---

## 🔒 Security Reminders

- ✅ **DO** use the anon key in your backend
- ✅ **DO** validate GDPR consent before processing PII
- ✅ **DO** use `sanitizePII()` when logging sensitive data
- ❌ **DON'T** expose service role key in client code
- ❌ **DON'T** store plaintext PII in logs

---

## 📊 Database Schema Overview

```
users (authentication & profiles)
  ↓
leads (lead management with AI scoring)
  ↓
call_logs (voice interactions via Retell/Twilio)
  ↓
lead_scoring_history (audit trail)
```

---

## 🧪 Testing

### Health Check
```javascript
const { healthCheck } = require('./config/supabaseClient');

const status = await healthCheck();
console.log(status);
// { status: 'healthy', service: 'supabase', ... }
```

### Test Connection
```javascript
const { testConnection } = require('./config/supabaseClient');

const isConnected = await testConnection();
// true or false
```

---

## 🎯 Next Steps

1. **Review RLS Policies:** Ensure they match your security requirements
2. **Customize Auto-Scoring:** Modify `auto_score_lead()` function for your criteria
3. **Set Up Edge Functions:** Implement Supabase edge functions for:
   - Real-time lead scoring with Gemini AI
   - Automatic follow-up scheduling
   - Webhook integrations
4. **Production Blockchain:** Replace stubs with real Ethereum integration
5. **Data Retention:** Set up automated cleanup jobs for expired data

---

## 📚 Additional Resources

- [Full Schema Documentation](./database-schema.md)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Models](../src/models/)
- [GDPR Utilities](../src/utils/gdprUtils.js)
