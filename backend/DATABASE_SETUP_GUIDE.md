# 🗄️ DATABASE SETUP GUIDE

Complete guide to set up your Supabase database with the screenshot-based schema and 200 rows of test data.

---

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ `SUPABASE_URL` in `.env`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` in `.env` (for seeding)
- ✅ `SUPABASE_ANON_KEY` in `.env` (for frontend)

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Apply Database Schema**

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy the contents of `backend/src/database/schema_from_frontend.sql`
5. Paste into the SQL editor
6. Click **"Run"** or press `Ctrl+Enter`

✅ **Expected Result:** All 10 tables created with indexes, triggers, and views

### **Step 2: Generate 200 Rows of Test Data**

```bash
cd backend
node src/database/generateSeedData.js
```

✅ **Expected Output:**
```
════════════════════════════════════════════════
🌱 AI LEAD IQ - DATABASE SEEDER
════════════════════════════════════════════════

📊 Target: 200 leads + comprehensive test data
🤖 Voice Platform: VAPI

⚠️  WARNING: This will delete ALL existing data!

🗑️  Clearing existing data...
✅ Database cleared

👥 Seeding users...
✅ Created 4 users

📋 Seeding 200 leads...
   Inserted leads 1-50
   Inserted leads 51-100
   Inserted leads 101-150
   Inserted leads 151-200
✅ Created 200 leads

🎯 Seeding campaigns...
✅ Created 15 campaigns

🔗 Linking leads to campaigns...
✅ Created 250+ campaign-lead associations

📞 Seeding call logs...
   Inserted calls 1-50
   Inserted calls 51-100
   ...
✅ Created 350 call logs

📧 Seeding email logs...
✅ Created 1,500 email logs

💬 Seeding SMS logs...
✅ Created 800 SMS logs

🤖 Seeding AI workflows...
✅ Created 4 AI workflows

════════════════════════════════════════════════
✅ DATABASE SEEDING COMPLETE!
════════════════════════════════════════════════

📊 Summary:
   👥 Users: 4
   📋 Leads: 200
   🎯 Campaigns: 15
   🔗 Campaign-Lead Links: 250+
   📞 Call Logs: 350
   📧 Email Logs: 1,500
   💬 SMS Logs: 800
   🤖 AI Workflows: 4

🔐 Test Login:
   Email: colinloader061@gmail.com
   Password: password123
════════════════════════════════════════════════
```

### **Step 3: Verify Data in Supabase**

1. Go to **Table Editor** in Supabase
2. Click on **`leads`** table
3. You should see **200 rows**

Check other tables:
- `users` - 4 rows
- `campaigns` - 15 rows
- `call_logs` - 350 rows
- `email_logs` - 1,500 rows
- `sms_logs` - 800 rows

---

## 📊 Database Tables Created

### **Core Tables**

| Table | Rows | Purpose |
|-------|------|---------|
| `users` | 4 | User accounts, company info, subscription |
| `leads` | 200 | Lead records with ALL frontend fields |
| `campaigns` | 15 | Marketing campaigns |
| `campaign_leads` | 250+ | Junction table (campaigns ↔ leads) |
| `call_logs` | 350 | Call history with VAPI integration |
| `email_logs` | 1,500 | Email communication tracking |
| `sms_logs` | 800 | SMS communication tracking |
| `dashboard_analytics` | 0* | Will be populated by analytics service |
| `ai_workflows` | 4 | AI workflow templates |
| `workflow_executions` | 0* | Will be populated when workflows run |

*Tables populate from user activity or background jobs

---

## 🎯 Critical Validations

### **Verify Lead Statuses Match UI Filter Tabs**

Run this query in Supabase SQL Editor:

```sql
SELECT status, COUNT(*) as count
FROM leads
GROUP BY status
ORDER BY status;
```

Expected statuses (EXACT match to frontend):
- `All` (not used in data, but valid value)
- `Contacted`
- `Converted`
- `Interested`
- `Not Interested`
- `Qualified`

### **Verify Lead Scores Are 0.00-1.00**

```sql
SELECT MIN(score), MAX(score), AVG(score)
FROM leads;
```

Expected:
- Min: 0.00
- Max: 1.00
- Avg: ~0.50

### **Verify Call Outcomes Match UI Badges**

```sql
SELECT outcome, COUNT(*) as count
FROM call_logs
GROUP BY outcome
ORDER BY outcome;
```

Expected outcomes:
- `Callback Requested`
- `Follow-up Required`
- `Interested`
- `Meeting Booked`
- `No Answer`
- `Not Interested`
- `Voicemail`

### **Verify Campaign Metrics**

```sql
SELECT 
  campaign_name,
  status,
  industry,
  conversion_rate,
  cost_per_meeting,
  leads_processed
FROM campaigns
LIMIT 5;
```

Expected:
- `conversion_rate`: 5.00 to 25.00 (displayed as %)
- `cost_per_meeting`: 80.00 to 200.00 (displayed as $)
- `status`: 'Active' or 'Paused'

---

## 🔐 Test User Accounts

### **Admin Account** (Full Access)

```
Email: colinloader061@gmail.com
Password: password123
Role: admin
```

### **Manager Account**

```
Email: sarah.manager@aileadiq.com
Password: password123
Role: manager
```

### **Agent Accounts**

```
Email: agent1@aileadiq.com
Password: password123
Role: agent

Email: agent2@aileadiq.com
Password: password123
Role: agent
```

**⚠️ Note:** You'll need to implement authentication hashing. The seed data uses mock hashes.

---

## 🤖 VAPI Integration Fields

The schema includes VAPI-specific fields in `call_logs`:

| Column | Purpose | Example Value |
|--------|---------|---------------|
| `vapi_call_id` | VAPI call identifier | `vapi_call_1732187234567_123` |
| `vapi_session_id` | VAPI session ID | `vapi_session_1732187234567_123` |
| `vapi_assistant_id` | VAPI assistant used | `asst_lead_qualification_v1` |

These will be populated by your VAPI webhook integration.

---

## 📈 Dashboard KPI Queries

To populate the dashboard (matching screenshot KPIs):

### **Total Calls Attempted**

```sql
SELECT COUNT(*) FROM call_logs;
```

### **Meetings Booked**

```sql
SELECT COUNT(*) FROM call_logs 
WHERE outcome = 'Meeting Booked';
```

### **Total Talk Time (minutes)**

```sql
SELECT SUM(duration) / 60 AS total_minutes FROM call_logs;
```

### **Avg Cost / Meeting**

```sql
SELECT AVG(cost) FROM call_logs 
WHERE outcome = 'Meeting Booked';
```

### **Total Emails Sent**

```sql
SELECT COUNT(*) FROM email_logs 
WHERE status IN ('sent', 'delivered', 'opened', 'clicked');
```

### **Total SMS Sent**

```sql
SELECT COUNT(*) FROM sms_logs 
WHERE status IN ('sent', 'delivered');
```

---

## 🔍 Useful Queries for Testing

### **Get All Leads with Latest Call Info**

```sql
SELECT * FROM leads_with_latest_call
LIMIT 10;
```

### **Campaign Performance**

```sql
SELECT * FROM campaign_performance;
```

### **Lead Status Distribution**

```sql
SELECT * FROM lead_status_counts;
```

### **High-Value Leads**

```sql
SELECT * FROM leads
WHERE score > 0.80 AND status != 'Converted'
ORDER BY score DESC
LIMIT 20;
```

### **Recent Call Activity**

```sql
SELECT 
  l.first_name || ' ' || l.last_name AS lead_name,
  l.company,
  cl.call_type,
  cl.outcome,
  cl.duration,
  cl.created_at
FROM call_logs cl
JOIN leads l ON cl.lead_id = l.id
ORDER BY cl.created_at DESC
LIMIT 20;
```

---

## 🛠️ Troubleshooting

### **Error: "permission denied for table X"**

**Solution:** Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` in your `.env`, not the anon key.

### **Error: "relation does not exist"**

**Solution:** The schema wasn't applied. Run `schema_from_frontend.sql` in Supabase SQL Editor first.

### **Seed data not showing up**

**Solution:** 
1. Check Supabase logs in dashboard
2. Verify your `.env` has correct URLs and keys
3. Try running the seeder again (it clears data first)

### **Data counts don't match expected values**

**Solution:** The seeder uses randomization. Exact counts may vary slightly, but should be close to:
- Leads: exactly 200
- Calls: ~350
- Emails: exactly 1,500
- SMS: exactly 800

---

## ✅ Verification Checklist

Before moving to frontend integration:

- [ ] All 10 tables exist in Supabase
- [ ] 200 leads are visible in Table Editor
- [ ] Lead statuses match filter tabs (Interested, Contacted, etc.)
- [ ] Call outcomes match UI badges (Meeting Booked, etc.)
- [ ] Campaign metrics have values (conversion_rate, cost_per_meeting)
- [ ] Test login works in frontend
- [ ] All foreign key relationships are intact
- [ ] Indexes are created (check Supabase performance tab)
- [ ] Views are queryable (leads_with_latest_call, etc.)

---

## 🎯 Next Steps

1. ✅ **Schema Applied** → Move to API endpoint creation
2. ✅ **Data Seeded** → Connect frontend to Supabase
3. ⏳ **VAPI Integration** → Configure VAPI webhooks to populate call_logs
4. ⏳ **Authentication** → Implement proper password hashing
5. ⏳ **Dashboard Analytics** → Create background job to populate dashboard_analytics

---

## 📚 Related Documentation

- **Schema File:** `backend/src/database/schema_from_frontend.sql`
- **Field Mapping:** `backend/FRONTEND_TO_DATABASE_MAPPING.md`
- **Screenshot Collection:** `SCREENSHOT_FINAL_REPORT.md`
- **Seed Generator:** `backend/src/database/generateSeedData.js`

---

**Last Updated:** 2025-11-21  
**Schema Version:** 1.0 (from frontend screenshots)  
**Voice Platform:** VAPI
