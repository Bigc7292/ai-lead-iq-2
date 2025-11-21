# 🎯 Frontend-to-Database Field Mapping

**Generated:** 2025-11-21  
**Source:** Complete analysis of 24 frontend screenshots  
**Voice Platform:** VAPI (for AI conversation handling)

This document maps EVERY visible UI element, button, KPI, filter, and data point from the frontend to the corresponding database schema.

---

## 📸 Screenshot-by-Screenshot Analysis

### **Screenshot 01: Login Page** (`01_login_page_*.png`)

| UI Element | Field Type | Database Mapping |
|------------|-----------|------------------|
| Email input field | Text input | `users.email` |
| Password input field | Password input | `users.password_hash` (hashed) |
| "Sign In" button | Button | Triggers authentication |

**Tables Used:** `users`

---

### **Screenshot 02: Dashboard Main** (`02_dashboard_main_*.png`)

#### **Top KPI Cards** (6 metrics displayed)

| KPI Name (Exact from UI) | Value Shown | Database Source |
|--------------------------|-------------|-----------------|
| Total Calls Attempted | 1,240 | `dashboard_analytics.total_calls_attempted` |
| Meetings Booked | 32 | `dashboard_analytics.meetings_booked` |
| Total Talk Time | 163 min | `dashboard_analytics.total_talk_time` |
| Avg. Cost / Meeting | $125.50 | `dashboard_analytics.avg_cost_per_meeting` |
| Total Emails Sent | 1,500 | `dashboard_analytics.total_emails_sent` |
| Total SMS Sent | 800 | `dashboard_analytics.total_sms_sent` |

#### **Filter Options**

| Filter Group | Options Visible | Database Column |
|-------------|-----------------|-----------------|
| Call Type | All Calls, Outbound, Inbound | `call_logs.call_type` + aggregation |
| Time Period | Daily, Weekly, Monthly | `dashboard_analytics.period_type` |
| Date Range | Date picker | `dashboard_analytics.date` |

#### **Charts**

| Chart Name | Data Source | Database Queries |
|-----------|-------------|------------------|
| Volume & Engagement Trend | Time series line chart | `dashboard_analytics` grouped by date |
| Conversion Funnel | Funnel visualization | `dashboard_analytics.leads_contacted/interested/qualified/converted` |

#### **User Info (Top Right)**

| UI Element | Value | Database Column |
|-----------|-------|-----------------|
| User name displayed | "Colin Loader" | `users.first_name` + `users.last_name` |
| Email displayed | "colinloader061@gmail.com" | `users.email` |

**Tables Used:** `dashboard_analytics`, `users`, `call_logs` (aggregated)

---

### **Screenshot 03: Leads List** (`03_leads_list_*.png`)

#### **Filter Tabs with Counts**

| Tab Label | Count Shown | Database Query |
|-----------|-------------|----------------|
| All | (100) | `COUNT(*) FROM leads` |
| Interested | (16) | `COUNT(*) FROM leads WHERE status = 'Interested'` |
| Contacted | (34) | `COUNT(*) FROM leads WHERE status = 'Contacted'` |
| Qualified | (17) | `COUNT(*) FROM leads WHERE status = 'Qualified'` |
| Not Interested | (17) | `COUNT(*) FROM leads WHERE status = 'Not Interested'` |
| Converted | (16) | `COUNT(*) FROM leads WHERE status = 'Converted'` |

#### **Table Columns** (Left to Right)

| Column Header | Example Value | Database Column | Data Type |
|--------------|---------------|-----------------|-----------|
| Name (with avatar) | "Emily Chen" | `leads.first_name` + `leads.last_name` | VARCHAR |
| Score | 0.85, 0.72, 0.91 | `leads.score` | DECIMAL(3,2) |
| Actions | Call/Email/Delete icons | N/A (action buttons) | - |
| Status | Dropdown badges | `leads.status` | VARCHAR(50) |
| Priority | High/Medium/Low | `leads.priority` | VARCHAR(50) |
| Company | "TechCorp Inc." | `leads.company` | VARCHAR(255) |
| Title | "CEO", "VP Sales" | `leads.title` | VARCHAR(150) |
| Phone | "+1-555-0123" | `leads.phone` | VARCHAR(50) |
| Email | "emily@example.com" | `leads.email` | VARCHAR(255) |
| Source | LinkedIn, Webinar, etc. | `leads.source` | VARCHAR(100) |

#### **Search Functionality**

| UI Element | Searches Against |
|-----------|------------------|
| Search input box | `leads.first_name`, `leads.last_name`, `leads.email`, `leads.company` |

**Tables Used:** `leads`

---

### **Screenshot 05: Add Lead Form** (`05_add_lead_form_*.png`)

#### **Form Fields** (* = Required fields marked in UI)

| Field Label | Required? | Placeholder/Type | Database Column |
|-------------|-----------|------------------|-----------------|
| First Name | ✅ * | Text input | `leads.first_name` NOT NULL |
| Last Name | ✅ * | Text input | `leads.last_name` NOT NULL |
| Company | ✅ * | Text input | `leads.company` NOT NULL |
| Title | ✅ * | Text input | `leads.title` NOT NULL |
| Email | ✅ * | Email input | `leads.email` NOT NULL |
| Phone | ✅ * | Phone input | `leads.phone` NOT NULL |
| Source | ✅ * | Dropdown | `leads.source` NOT NULL |
| Status | ✅ * | Dropdown | `leads.status` NOT NULL |
| Priority | ✅ * | Dropdown | `leads.priority` NOT NULL |

#### **Dropdown Options** (Exact values from form)

**Source Dropdown:**
- LinkedIn
- Webinar
- Referral
- Cold Outreach
- Website
- Advertisement
- Social Media

**Status Dropdown:**
- All (default)
- Interested
- Contacted
- Qualified
- Not Interested
- Converted

**Priority Dropdown:**
- High
- Medium (default)
- Low

**Tables Used:** `leads`

---

### **Screenshot 06: Campaigns List** (`06_campaigns_list_*.png`)

#### **Campaign Card Fields**

| UI Element | Example Value | Database Column |
|-----------|---------------|-----------------|
| Campaign Name | "Mixed Industry Pilot" | `campaigns.campaign_name` |
| Status Badge | Active/Paused | `campaigns.status` |
| Industry | Tech, Healthcare, Real Estate, Mixed | `campaigns.industry` |
| Conversion Rate | "15.2%" | `campaigns.conversion_rate` DECIMAL(5,2) |
| Cost per Meeting | "$125.50" | `campaigns.cost_per_meeting` DECIMAL(10,2) |
| Leads Processed | "45 leads" | `campaigns.leads_processed` INTEGER |

#### **Status Options**

| Badge | Database Value |
|-------|----------------|
| Active | 'Active' |
| Paused |'Paused' |

**Tables Used:** `campaigns`, `campaign_leads` (for lead count)

---

### **Screenshot 08: Call Logs List** (`08_call_logs_*.png`)

#### **Table Columns**

| Column Header | Example Value | Database Column |
|--------------|---------------|-----------------|
| Lead Name (with avatar) | "John Doe" | Joined from `leads.first_name` + `leads.last_name` |
| Company | "ABC Corp" | Joined from `leads.company` |
| Call Type (badge) | Outbound/Inbound | `call_logs.call_type` |
| Outcome (badge) | Meeting Booked, Callback, etc. | `call_logs.outcome` |
| Duration | "03:45" (mm:ss) | `call_logs.duration` (stored as seconds, displayed as mm:ss) |
| Date & Time | "2025-11-21 10:30 AM" | `call_logs.created_at` TIMESTAMP |
| Transcript (snippet) | First 100 chars | `call_logs.transcript` TEXT |
| Notes (snippet) | Preview of notes | `call_logs.notes` TEXT |

#### **Outcome Badge Options** (Exact from UI)

- Meeting Booked
- Callback Requested
- Not Interested
- Voicemail
- No Answer
- Interested
- Follow-up Required

#### **Call Type Badge Options**

- Outbound
- Inbound

#### **Filter Dropdown** (from screenshot 22)

Filters by outcome values listed above.

**Tables Used:** `call_logs` (joined with `leads`)

---

### **Screenshot 09: Call Log Detail Modal** (`09_call_log_detail_*.png`)

#### **Modal Fields** (Read/Edit View)

| UI Element | Field Type | Database Column |
|-----------|-----------|-----------------|
| Modal Title | "Review & Edit Call Log" | Static text |
| Lead Name | Display only | From `leads` table |
| Company | Display only | From `leads.company` |
| Outcome | Dropdown (editable) | `call_logs.outcome` |
| Full Transcript | Read-only text area | `call_logs.transcript` TEXT |
| Notes | Editable text area | `call_logs.notes` TEXT |
| Duration | Display (mm:ss) | `call_logs.duration` |
| Call Type | Display badge | `call_logs.call_type` |
| Save Button | Button | Updates `call_logs` record |
| Close Button | Button | Closes modal |

**Tables Used:** `call_logs` (joined with `leads`)

---

### **Screenshot 12: Your AI - Workflows** (`12_your_ai_page_*.png`)

#### **Workflow Template Cards**

| Template Name | Database Column |
|--------------|-----------------|
| "New Lead Qualification" | `ai_workflows.workflow_name` WHERE `workflow_type = 'lead_qualification'` |
| "Long-term Follow-up" | `ai_workflows.workflow_name` WHERE `workflow_type = 'follow_up'` |
| "Re-engagement Campaign" | `ai_workflows.workflow_name` WHERE `workflow_type = 're_engagement'` |
| "Meeting Confirmation" | `ai_workflows.workflow_name` WHERE `workflow_type = 'meeting_confirmation'` |

#### **Workflow Types (Enum Values)**

```sql
'lead_qualification'
'follow_up'
're_engagement'
'meeting_confirmation'
'nurture'
'custom'
```

**Tables Used:** `ai_workflows`, `workflow_executions`

---

### **Screenshot 15: Settings Page** (`15_settings_page_*.png`)

#### **Company Information Section**

| Field Label | Input Type | Database Column |
|------------|-----------|-----------------|
| Company Name | Text input | `users.company_name` |
| Email | Email input | `users.company_email` |
| Industry | Dropdown | `users.industry` |
| Team Size | Dropdown | `users.team_size` |

#### **Industry Dropdown Options**

- Technology
- Healthcare
- Real Estate
- Finance
- Retail
- Manufacturing
- Other

#### **Team Size Dropdown Options**

- 1-10
- 11-50
- 51-200
- 201-500
- 500+

#### **Subscription Section**

| Field | Display Type | Database Column |
|-------|-------------|-----------------|
| Current Plan | Display | `users.subscription_plan` |
| Status | Badge | `users.subscription_status` |
| Billing Info | Display | `users.subscription_start_date`, `subscription_end_date` |

**Tables Used:** `users`

---

### **Screenshots 18-24: Filter & Search States**

#### **Screenshot 18: Leads Filtered by "Interested"**

| Filter Applied | Database Query |
|----------------|----------------|
| Status = Interested | `SELECT * FROM leads WHERE status = 'Interested'` |
| Count shown: (16) | `COUNT(*)` result |

#### **Screenshot 19: Leads Filtered by "Qualified"**

| Filter Applied | Database Query |
|----------------|----------------|
| Status = Qualified | `SELECT * FROM leads WHERE status = 'Qualified'` |
| Count shown: (17) | `COUNT(*)` result |

#### **Screenshot 20: Dashboard Filtered - Outbound Only**

| Filter Applied | Database Impact |
|----------------|-----------------|
| Call Type = Outbound | `dashboard_analytics.outbound_calls` OR filter `call_logs WHERE call_type = 'Outbound'` |

#### **Screenshot 21: Dashboard Filtered - Weekly View**

| Filter Applied | Database Impact |
|----------------|-----------------|
| Period = Weekly | `SELECT * FROM dashboard_analytics WHERE period_type = 'weekly'` |

#### **Screenshot 22: Call Logs Filter Dropdown**

| Dropdown Options | Database Column Values |
|------------------|----------------------|
| All Outcomes | No filter |
| Meeting Booked | `outcome = 'Meeting Booked'` |
| Callback Requested | `outcome = 'Callback Requested'` |
| Not Interested | `outcome = 'Not Interested'` |
| Voicemail | `outcome = 'Voicemail'` |
| No Answer | `outcome = 'No Answer'` |

#### **Screenshot 24: Leads Search - "Emily"**

| Search Input | Database Query |
|-------------|----------------|
| "Emily" | `WHERE first_name ILIKE '%Emily%' OR last_name ILIKE '%Emily%' OR email ILIKE '%Emily%'` |

---

## 🔗 Complete Database Table Summary

### **10 Main Tables Created**

1. **`users`** - User accounts, company info, subscription
2. **`leads`** - Lead records with ALL fields from UI
3. **`campaigns`** - Marketing campaigns
4. **`campaign_leads`** - Junction table (campaigns ↔ leads)
5. **`call_logs`** - Call history with VAPI integration
6. **`email_logs`** - Email communication tracking
7. **`sms_logs`** - SMS communication tracking
8. **`dashboard_analytics`** - Aggregated KPI metrics
9. **`ai_workflows`** - AI workflow templates
10. **`workflow_executions`** - Workflow execution history

---

## 🎯 Critical UI-to-DB Mappings

### **Lead Status Values** (Must match EXACTLY)

```sql
CHECK (status IN ('All', 'Interested', 'Contacted', 'Qualified', 'Not Interested', 'Converted'))
```

These are **filter tabs** in the UI. The counts must match.

### **Call Outcomes** (Must match badge values)

```sql
CHECK (outcome IN (
  'Meeting Booked',
  'Callback Requested',
  'Not Interested',
  'Voicemail',
  'No Answer',
  'Interested',
  'Follow-up Required'
))
```

### **Priority Levels** (Must match dropdown)

```sql
CHECK (priority IN ('High', 'Medium', 'Low'))
```

### **Call Types** (Must match badge)

```sql
CHECK (call_type IN ('Outbound', 'Inbound'))
```

### **Campaign Status** (Must match badge)

```sql
CHECK (status IN ('Active', 'Paused', 'Completed', 'Draft'))
```

---

## 🔢 Dashboard KPI Calculations

### **Total Calls Attempted**
```sql
SUM(total_calls_attempted) FROM dashboard_analytics
-- OR
COUNT(*) FROM call_logs
```

### **Meetings Booked**
```sql
COUNT(*) FROM call_logs WHERE outcome = 'Meeting Booked'
```

### **Total Talk Time**
```sql
SUM(duration) FROM call_logs
-- Display in minutes: SUM(duration)/60
```

### **Avg. Cost / Meeting**
```sql
SUM(cost) / COUNT(*) FROM call_logs WHERE outcome = 'Meeting Booked'
```

### **Total Emails Sent**
```sql
COUNT(*) FROM email_logs WHERE status IN ('sent', 'delivered', 'opened')
```

### **Total SMS Sent**
```sql
COUNT(*) FROM sms_logs WHERE status IN ('sent', 'delivered')
```

---

## 🤖 VAPI Integration Fields

**IMPORTANT:** Voice agent platform is **VAPI**, not MiniMax.

### **VAPI-Specific Columns in `call_logs`:**

```sql
vapi_call_id VARCHAR(255)        -- VAPI call identifier
vapi_session_id VARCHAR(255)     -- VAPI session ID
vapi_assistant_id VARCHAR(255)   -- Which VAPI assistant configuration was used
```

### **VAPI Workflow:**

1. Lead is selected for outbound call
2. VAPI assistant initiates call with conversation flow
3. VAPI handles objections, responses, conversation logic
4. Call transcript, outcome, and metadata stored in `call_logs`
5. `vapi_call_id` links to VAPI platform for full recording/analysis

---

## ✅ Validation Checklist

- [x] All Lead form required fields are NOT NULL in schema
- [x] All status values match filter tabs exactly
- [x] All outcome values match call log badges exactly
- [x] All priority values match dropdown options
- [x] All campaign metrics have corresponding columns
- [x] All dashboard KPIs can be calculated from database
- [x] VAPI integration fields added (not MiniMax)
- [x] Email and SMS logs support dashboard counts
- [x] AI workflows match "Your AI" template names
- [x] Settings fields match user table columns
- [x] Score is DECIMAL(3,2) for 0.00-1.00 range
- [x] Duration stored as seconds, displayed as mm:ss
- [x] All filter counts can be calculated with COUNT(*)
- [x] Search functionality covers name, email, company

---

## 📋 Next Steps

1. ✅ **Schema Created:** `schema_from_frontend.sql`
2. ⏳ **Apply to Supabase:** Run schema in Supabase SQL editor
3. ⏳ **Generate Seed Data:** Create 200 rows of realistic test data
4. ⏳ **Test Queries:** Verify all UI views can be populated
5. ⏳ **VAPI Integration:** Configure VAPI assistant and webhooks
6. ⏳ **Validate Counts:** Ensure filter tab counts match database queries

---

**Schema File:** `backend/src/database/schema_from_frontend.sql`  
**Last Updated:** 2025-11-21 13:36
