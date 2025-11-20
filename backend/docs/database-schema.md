# Supabase Database Schema Documentation

## Overview

This document describes the complete database schema for the AI Lead IQ application, including GDPR compliance features, Row-Level Security (RLS) policies, and blockchain integration stubs.

## Tables

### 1. Users (`users`)

Stores user authentication and profile data with GDPR-compliant hashed PII.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `email` | VARCHAR(255) | Unique email address |
| `email_hash` | VARCHAR(66) | Ethereum-style hash for GDPR compliance |
| `role` | VARCHAR(50) | User role: 'admin', 'manager', or 'agent' |
| `first_name` | VARCHAR(100) | First name |
| `last_name` | VARCHAR(100) | Last name |
| `phone` | VARCHAR(50) | Phone number |
| `phone_hash` | VARCHAR(66) | Hashed phone for GDPR |
| `is_active` | BOOLEAN | Account active status |
| `last_login_at` | TIMESTAMP | Last login timestamp |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_is_active` on `is_active`

---

### 2. Leads (`leads`)

Core table for lead management with AI scoring and blockchain tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `first_name` | VARCHAR(100) | Lead's first name (required) |
| `last_name` | VARCHAR(100) | Lead's last name (required) |
| `email` | VARCHAR(255) | Contact email |
| `email_hash` | VARCHAR(66) | GDPR-compliant email hash |
| `phone` | VARCHAR(50) | Contact phone |
| `phone_hash` | VARCHAR(66) | GDPR-compliant phone hash |
| `address` | TEXT | Property address |
| `property_type` | VARCHAR(100) | Property type |
| `budget` | DECIMAL(12,2) | Budget amount |
| `timeline` | VARCHAR(100) | Purchase timeline |
| `score` | DECIMAL(3,2) | AI quality score (0.0-1.0) |
| `status` | VARCHAR(50) | Lead status |
| `blockchain_tx_hash` | VARCHAR(66) | Ethereum transaction hash |
| `gdpr_consent` | BOOLEAN | GDPR consent flag |
| `gdpr_consent_date` | TIMESTAMP | Consent timestamp |
| `assigned_to` | UUID | FK to users.id |
| `source` | VARCHAR(100) | Lead source |
| `notes` | TEXT | Additional notes |
| `metadata` | JSONB | Flexible structured data |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |
| `last_contacted_at` | TIMESTAMP | Last contact timestamp |

**Status Values:** `new`, `contacted`, `qualified`, `unqualified`, `nurturing`, `closed_won`, `closed_lost`

**Source Values:** `website`, `referral`, `cold_call`, `social_media`, `advertisement`, `event`, `partner`, `other`

**Indexes:**
- `idx_leads_status` on `status`
- `idx_leads_score` on `score DESC`
- `idx_leads_created_at` on `created_at DESC`
- `idx_leads_assigned_to` on `assigned_to`
- `idx_leads_blockchain_tx` on `blockchain_tx_hash`

---

### 3. Call Logs (`call_logs`)

Tracks all voice interactions with leads using Retell AI and Twilio.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `lead_id` | UUID | FK to leads.id (required) |
| `agent_id` | UUID | FK to users.id |
| `retell_session_id` | VARCHAR(255) | Retell AI session ID |
| `call_sid` | VARCHAR(100) | Twilio Call SID |
| `duration` | INTEGER | Call duration in seconds |
| `direction` | VARCHAR(20) | 'inbound' or 'outbound' |
| `transcript` | TEXT | Call transcript |
| `transcript_hash` | VARCHAR(66) | GDPR-compliant hash |
| `summary` | TEXT | AI-generated summary |
| `sentiment` | VARCHAR(50) | Sentiment analysis |
| `sentiment_score` | DECIMAL(3,2) | Score from -1.0 to 1.0 |
| `outcome` | VARCHAR(50) | Call outcome |
| `follow_up_required` | BOOLEAN | Follow-up needed |
| `follow_up_date` | TIMESTAMP | Follow-up date |
| `call_quality_score` | DECIMAL(3,2) | Quality score 0.0-1.0 |
| `cost` | DECIMAL(10,4) | Call cost in USD |
| `recording_url` | TEXT | Recording URL |
| `recording_duration` | INTEGER | Recording duration |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMP | Record creation |
| `started_at` | TIMESTAMP | Call start time |
| `ended_at` | TIMESTAMP | Call end time |

**Sentiment Values:** `positive`, `neutral`, `negative`, `mixed`

**Outcome Values:** `successful`, `no_answer`, `voicemail`, `busy`, `failed`, `callback_requested`

**Indexes:**
- `idx_call_logs_lead_id` on `lead_id`
- `idx_call_logs_agent_id` on `agent_id`
- `idx_call_logs_retell_session` on `retell_session_id`
- `idx_call_logs_created_at` on `created_at DESC`

---

### 4. Lead Scoring History (`lead_scoring_history`)

Audit trail for lead score changes over time.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | FK to leads.id |
| `previous_score` | DECIMAL(3,2) | Previous score value |
| `new_score` | DECIMAL(3,2) | New score value |
| `score_factors` | JSONB | Factors influencing score |
| `changed_by` | VARCHAR(50) | 'ai', 'manual', 'call_outcome' |
| `created_at` | TIMESTAMP | Change timestamp |

---

## Row-Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

### Users Table
- **View own profile:** Users can view their own user record
- **Admins view all:** Admin users can view all user records
- **Update own profile:** Users can update their own profile

### Leads Table
- **View assigned leads:** Agents see their assigned leads; Managers/Admins see all
- **Insert leads:** All authenticated active users can create leads
- **Update assigned leads:** Agents can update their leads; Managers/Admins can update all
- **Delete leads:** Only admins can delete leads

### Call Logs Table
- **View/Insert:** Users can access call logs for leads they have access to
- Inherits lead access permissions

### Scoring History Table
- **View only:** Users can view scoring history for accessible leads
- Inherits lead access permissions

---

## Database Functions & Triggers

### Auto-Update Timestamp
**Function:** `update_updated_at_column()`
- Automatically updates `updated_at` field on record modification
- Applied to `users` and `leads` tables

### Auto-Score Leads
**Function:** `auto_score_lead()`
- Automatically calculates initial lead score on insert
- Scoring criteria:
  - Base score: 0.30
  - Email present: +0.15
  - Phone present: +0.15
  - Budget present: +0.20
  - Timeline present: +0.10
  - Property type present: +0.10

### Track Score Changes
**Function:** `track_score_changes()`
- Logs all lead score changes to `lead_scoring_history`
- Triggered on lead updates

---

## Database Views

### High Value Leads (`high_value_leads`)
Shows leads with score > 0.8 that aren't closed:
```sql
SELECT * FROM high_value_leads;
```

### Lead Performance Summary (`lead_performance_summary`)
Aggregate view showing lead engagement metrics:
```sql
SELECT * FROM lead_performance_summary;
```

---

## GDPR Compliance Features

### PII Hashing
- Email and phone numbers are hashed using Ethereum-style keccak256 (stubbed)
- Hashes stored alongside original data for privacy compliance
- Utility functions in `src/utils/gdprUtils.js`

### Blockchain Audit Trail
- `blockchain_tx_hash` field stores immutable transaction references
- Stub implementation provided in `gdprUtils.js`
- Production implementation should use ethers.js or web3.js

### Consent Tracking
- `gdpr_consent` and `gdpr_consent_date` fields track user consent
- Required before processing PII data

### Data Retention
- Helper function to check retention period expiration (default 2 years)
- Implement automated cleanup jobs for expired data

---

## Example Queries

### Find high-value leads assigned to you
```sql
SELECT * FROM leads 
WHERE score > 0.8 
  AND assigned_to = auth.uid()
  AND status NOT IN ('closed_won', 'closed_lost');
```

### Get leads with recent successful calls
```sql
SELECT l.*, COUNT(cl.id) as call_count
FROM leads l
INNER JOIN call_logs cl ON cl.lead_id = l.id
WHERE cl.outcome = 'successful'
  AND cl.created_at > NOW() - INTERVAL '7 days'
GROUP BY l.id
ORDER BY call_count DESC;
```

### Find leads needing follow-up
```sql
SELECT l.*, cl.follow_up_date
FROM leads l
INNER JOIN call_logs cl ON cl.lead_id = l.id
WHERE cl.follow_up_required = true
  AND cl.follow_up_date <= NOW()
ORDER BY cl.follow_up_date ASC;
```

---

## Setup Instructions

### 1. Run Schema Migration
```bash
# In Supabase SQL Editor, run:
psql -h your-db-host -U postgres -d postgres -f src/database/schema.sql
```

Or copy the contents of `schema.sql` and paste into the Supabase SQL Editor.

### 2. Verify Tables
Check that all tables were created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 3. Seed Test Data
```bash
node src/database/seedData.js
```

### 4. Test RLS Policies
Authenticate as different users and verify row-level access restrictions work correctly.

---

## Security Best Practices

1. **Never use service role key** in client-side code
2. **Always validate GDPR consent** before processing PII
3. **Sanitize PII** from logs using `sanitizePII()` utility
4. **Rotate encryption keys** regularly
5. **Monitor blockchain transactions** for audit compliance
6. **Implement automated data retention** cleanup jobs

---

## Production Implementation TODOs

⚠️ **IMPORTANT:** The following are STUB implementations that require production-ready replacements:

1. **Ethereum Hashing:** Replace SHA-256 stubs with actual keccak256 using ethers.js
2. **Blockchain Transactions:** Implement real Ethereum transactions for audit trails
3. **Encryption:** Add field-level encryption for sensitive data at rest
4. **Automated Cleanup:** Create cron jobs for GDPR data retention enforcement
5. **Monitoring:** Set up alerts for failed RLS policies or unauthorized access attempts
