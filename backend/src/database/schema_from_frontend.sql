-- ============================================
-- AI LEAD IQ - DATABASE SCHEMA
-- Built from Frontend Screenshots Analysis
-- Voice Agent: VAPI (not MiniMax)
-- ============================================
-- Generated: 2025-11-21
-- Source: Complete frontend screenshot analysis (24 screenshots)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password hashing

-- ============================================
-- 1. USERS TABLE
-- Based on: Login page, Settings page, User info shown in nav
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication (from Login screenshot)
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Hashed password
  
  -- Profile Information (from Settings & Nav)
  first_name VARCHAR(100), -- e.g., "Colin"
  last_name VARCHAR(100),  -- e.g., "Loader"
  
  -- Company/Organization (from Settings screenshot)
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  industry VARCHAR(100), -- Dropdown in settings
  team_size VARCHAR(50),  -- Dropdown in settings (e.g., "1-10", "11-50")
  
  -- Role & Permissions
  role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  is_active BOOLEAN DEFAULT true,
  
  -- Subscription (from Settings screenshot)
  subscription_plan VARCHAR(100), -- e.g., "Pro", "Enterprise"
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Session tracking
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. LEADS TABLE
-- Based on: Leads List, Add Lead Form, Lead inline details
-- Screenshot Analysis: 03_leads_list, 05_add_lead_form
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information (from Add Lead Form - ALL REQUIRED FIELDS)
  first_name VARCHAR(100) NOT NULL,  -- * Required in form
  last_name VARCHAR(100) NOT NULL,   -- * Required in form
  company VARCHAR(255) NOT NULL,     -- * Required in form
  title VARCHAR(150) NOT NULL,       -- * Required in form (e.g., "CEO", "VP Sales")
  email VARCHAR(255) NOT NULL,       -- * Required in form
  phone VARCHAR(50) NOT NULL,        -- * Required in form
  
  -- Lead Metadata (from Add Lead Form dropdowns & Leads List columns)
  source VARCHAR(100) NOT NULL,      -- Dropdown: LinkedIn, Webinar, Referral, Cold Outreach, etc.
  status VARCHAR(50) NOT NULL DEFAULT 'All',  -- Dropdown + Filter tabs
    CHECK (status IN ('All', 'Interested', 'Contacted', 'Qualified', 'Not Interested', 'Converted')),
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium',  -- Dropdown + Column
    CHECK (priority IN ('High', 'Medium', 'Low')),
  
  -- AI Scoring (from Leads List - Score column shows decimal 0.00-1.00)
  score DECIMAL(3, 2) DEFAULT 0.00 
    CHECK (score >= 0.00 AND score <= 1.00),  -- Displays as 0.85, 0.72, etc.
  
  -- Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Additional tracking
  notes TEXT,
  metadata JSONB, -- For flexible additional data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 3. CAMPAIGNS TABLE
-- Based on: Campaigns List screenshot (06_campaigns_list)
-- Screenshot shows: Name, Status, Industry, Conversion %, Cost/Meeting, Leads Processed
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Campaign Details (visible in campaign cards)
  campaign_name VARCHAR(255) NOT NULL,  -- e.g., "Mixed Industry Pilot", "Tech Startup Outreach"
  industry VARCHAR(100),                -- e.g., "Tech", "Healthcare", "Real Estate", "Mixed"
  
  -- Status (badge shown: Active/Paused)
  status VARCHAR(50) DEFAULT 'Active' 
    CHECK (status IN ('Active', 'Paused', 'Completed', 'Draft')),
  
  -- Performance Metrics (displayed on campaign cards)
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00, -- Shown as percentage (e.g., "15.2%")
  cost_per_meeting DECIMAL(10, 2),            -- Shown in dollars (e.g., "$125.50")
  leads_processed INTEGER DEFAULT 0,          -- Count of leads in campaign
  
  -- Campaign configuration
  target_leads INTEGER,      -- How many leads to target
  description TEXT,
  
  -- Ownership
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. CAMPAIGN_LEADS (Junction Table)
-- Link leads to campaigns (many-to-many)
-- ============================================
CREATE TABLE campaign_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  
  -- Track when lead was added to campaign
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Lead status within this specific campaign
  campaign_status VARCHAR(50) DEFAULT 'queued'
    CHECK (campaign_status IN ('queued', 'in_progress', 'contacted', 'completed', 'skipped')),
  
  UNIQUE(campaign_id, lead_id) -- Prevent duplicate entries
);

-- ============================================
-- 5. CALL_LOGS TABLE
-- Based on: Call Logs List (08), Call Log Detail Modal (09)
-- IMPORTANT: Using VAPI for voice agent (not MiniMax)
-- ============================================
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL, -- Link to campaign if part of one
  
  -- Call Details (visible in list view)
  call_type VARCHAR(20) NOT NULL 
    CHECK (call_type IN ('Outbound', 'Inbound')),  -- Badge shown in screenshot
  
  -- Duration (shown as mm:ss in list, e.g., "03:45")
  duration INTEGER,  -- Stored in seconds, displayed as mm:ss
  
  -- Outcome (badge shown: Meeting Booked, Callback Requested, Not Interested, Voicemail, No Answer)
  outcome VARCHAR(100) NOT NULL DEFAULT 'No Answer'
    CHECK (outcome IN (
      'Meeting Booked',
      'Callback Requested', 
      'Not Interested',
      'Voicemail',
      'No Answer',
      'Interested',
      'Follow-up Required'
    )),
  
  -- Call Content (from Call Log Detail modal - screenshot 09)
  transcript TEXT,        -- Full conversation transcript shown in modal
  notes TEXT,            -- Editable notes field in modal
  summary TEXT,          -- AI-generated summary
  
  -- VAPI Integration (replacing MiniMax)
  vapi_call_id VARCHAR(255),           -- VAPI call identifier
  vapi_session_id VARCHAR(255),        -- VAPI session ID
  vapi_assistant_id VARCHAR(255),      -- Which VAPI assistant was used
  
  -- Call recording
  recording_url TEXT,
  recording_duration INTEGER,
  
  -- AI Analysis
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  sentiment_score DECIMAL(3, 2), -- -1.0 to 1.0
  key_points JSONB,              -- Extracted key points from conversation
  
  -- Quality & Cost
  call_quality_score DECIMAL(3, 2), -- 0.0 to 1.0
  cost DECIMAL(10, 4),              -- Call cost
  
  -- Follow-up tracking
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps (shown in list: Date & Time column)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  call_started_at TIMESTAMP WITH TIME ZONE,
  call_ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. DASHBOARD_ANALYTICS TABLE
-- Based on: Dashboard Main screenshot (02_dashboard_main)
-- Stores aggregated KPI data for charts and metrics
-- KPIs shown: Total Calls, Meetings Booked, Talk Time, Avg Cost, Emails, SMS
-- ============================================
CREATE TABLE dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date range for this analytics record
  date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL 
    CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  
  -- KPI Metrics (exact names from dashboard screenshot)
  total_calls_attempted INTEGER DEFAULT 0,      -- "Total Calls Attempted: 1,240"
  meetings_booked INTEGER DEFAULT 0,            -- "Meetings Booked: 32"
  total_talk_time INTEGER DEFAULT 0,            -- "Total Talk Time: 163 min" (stored in minutes)
  avg_cost_per_meeting DECIMAL(10, 2),          -- "Avg. Cost / Meeting: $125.50"
  total_emails_sent INTEGER DEFAULT 0,          -- "Total Emails Sent: 1,500"
  total_sms_sent INTEGER DEFAULT 0,             -- "Total SMS Sent: 800"
  
  -- Call breakdowns (for Outbound/Inbound filters)
  outbound_calls INTEGER DEFAULT 0,
  inbound_calls INTEGER DEFAULT 0,
  
  -- Additional metrics for charts
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  voicemails INTEGER DEFAULT 0,
  no_answers INTEGER DEFAULT 0,
  
  -- Conversion funnel data (for Conversion Funnel chart)
  leads_contacted INTEGER DEFAULT 0,
  leads_interested INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  
  -- Engagement metrics (for Volume & Engagement Trend chart)
  average_call_duration INTEGER,  -- In seconds
  total_revenue DECIMAL(12, 2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date, period_type) -- One record per user per period
);

-- ============================================
-- 7. EMAIL_LOGS TABLE
-- The dashboard shows "Total Emails Sent: 1,500"
-- This table tracks email communications with leads
-- ============================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Email details
  subject VARCHAR(500),
  body TEXT,
  email_type VARCHAR(50) 
    CHECK (email_type IN ('outreach', 'follow_up', 'meeting_confirmation', 'nurture', 'campaign')),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'sent'
    CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  
  -- Engagement metrics
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 8. SMS_LOGS TABLE
-- The dashboard shows "Total SMS Sent: 800"
-- This table tracks SMS communications with leads
-- ============================================
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- SMS details
  message TEXT NOT NULL,
  to_phone VARCHAR(50) NOT NULL,
  from_phone VARCHAR(50),
  
  sms_type VARCHAR(50)
    CHECK (sms_type IN ('outreach', 'follow_up', 'reminder', 'confirmation', 'campaign')),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'sent'
    CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered')),
  
  -- Twilio/Provider details
  sms_sid VARCHAR(255), -- Twilio Message SID
  
  -- Engagement
  replied_at TIMESTAMP WITH TIME ZONE,
  reply_message TEXT,
  
  -- Cost
  cost DECIMAL(6, 4),
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 9. AI_WORKFLOWS TABLE
-- Based on: Your AI screenshot (12_your_ai_page)
-- Templates shown: New Lead Qualification, Long-term Follow-up, Re-engagement, Meeting Confirmation
-- ============================================
CREATE TABLE ai_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Workflow details
  workflow_name VARCHAR(255) NOT NULL, -- e.g., "New Lead Qualification"
  workflow_type VARCHAR(50) NOT NULL
    CHECK (workflow_type IN (
      'lead_qualification',
      'follow_up',
      're_engagement',
      'meeting_confirmation',
      'nurture',
      'custom'
    )),
  
  description TEXT,
  
  -- Template or custom
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Workflow configuration
  trigger_conditions JSONB,  -- When to trigger this workflow
  actions JSONB,             -- What actions to take
  ai_prompt TEXT,            -- Prompt for AI assistant/VAPI
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Usage statistics
  times_used INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. WORKFLOW_EXECUTIONS TABLE
-- Track when workflows are executed on leads
-- ============================================
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  workflow_id UUID REFERENCES ai_workflows(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  
  -- Execution details
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  
  result JSONB,          -- Outcome of the workflow
  error_message TEXT,    -- If failed
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_name ON users(company_name);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- Leads
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company ON leads(company);

-- Campaigns
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_industry ON campaigns(industry);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Campaign Leads
CREATE INDEX idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON campaign_leads(lead_id);

-- Call Logs
CREATE INDEX idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX idx_call_logs_agent_id ON call_logs(agent_id);
CREATE INDEX idx_call_logs_campaign_id ON call_logs(campaign_id);
CREATE INDEX idx_call_logs_call_type ON call_logs(call_type);
CREATE INDEX idx_call_logs_outcome ON call_logs(outcome);
CREATE INDEX idx_call_logs_vapi_call_id ON call_logs(vapi_call_id);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at DESC);

-- Email Logs
CREATE INDEX idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- SMS Logs
CREATE INDEX idx_sms_logs_lead_id ON sms_logs(lead_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);

-- Dashboard Analytics
CREATE INDEX idx_dashboard_analytics_user_id ON dashboard_analytics(user_id);
CREATE INDEX idx_dashboard_analytics_date ON dashboard_analytics(date DESC);
CREATE INDEX idx_dashboard_analytics_period ON dashboard_analytics(period_type);

-- AI Workflows
CREATE INDEX idx_ai_workflows_type ON ai_workflows(workflow_type);
CREATE INDEX idx_ai_workflows_is_active ON ai_workflows(is_active);
CREATE INDEX idx_ai_workflows_created_by ON ai_workflows(created_by);

-- Workflow Executions
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_lead_id ON workflow_executions(lead_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON ai_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON dashboard_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- All leads with their latest call information
CREATE OR REPLACE VIEW leads_with_latest_call AS
SELECT 
  l.*,
  u.first_name AS agent_first_name,
  u.last_name AS agent_last_name,
  cl.call_type AS last_call_type,
  cl.outcome AS last_call_outcome,
  cl.created_at AS last_call_date,
  cl.duration AS last_call_duration,
  COUNT(DISTINCT cl2.id) AS total_calls
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN LATERAL (
  SELECT * FROM call_logs
  WHERE lead_id = l.id
  ORDER BY created_at DESC
  LIMIT 1
) cl ON true
LEFT JOIN call_logs cl2 ON l.id = cl2.lead_id
GROUP BY l.id, u.first_name, u.last_name, cl.call_type, cl.outcome, cl.created_at, cl.duration;

-- Campaign performance summary
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
  c.*,
  COUNT(DISTINCT cl_leads.lead_id) AS total_leads,
  COUNT(DISTINCT calls.id) AS total_calls,
  COUNT(DISTINCT CASE WHEN calls.outcome = 'Meeting Booked' THEN calls.id END) AS meetings_booked,
  AVG(calls.duration) AS avg_call_duration,
  SUM(calls.cost) AS total_call_cost
FROM campaigns c
LEFT JOIN campaign_leads cl_leads ON c.id = cl_leads.campaign_id
LEFT JOIN call_logs calls ON cl_leads.lead_id = calls.lead_id AND calls.campaign_id = c.id
GROUP BY c.id;

-- Lead status distribution (for filter counts)
CREATE OR REPLACE VIEW lead_status_counts AS
SELECT 
  status,
  COUNT(*) as count
FROM leads
GROUP BY status;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'User accounts with company and subscription info';
COMMENT ON TABLE leads IS 'Lead records matching exact frontend schema - source, status, priority from UI';
COMMENT ON TABLE campaigns IS 'Marketing campaigns with metrics shown in campaign cards';
COMMENT ON TABLE call_logs IS 'Call history with VAPI integration (voice agent platform)';
COMMENT ON TABLE email_logs IS 'Email communication tracking for dashboard KPI: Total Emails Sent';
COMMENT ON TABLE sms_logs IS 'SMS communication tracking for dashboard KPI: Total SMS Sent';
COMMENT ON TABLE dashboard_analytics IS 'Aggregated KPI data matching dashboard screenshot metrics';
COMMENT ON TABLE ai_workflows IS 'AI workflow templates from "Your AI" page';

COMMENT ON COLUMN leads.score IS 'AI lead score 0.00-1.00 displayed in leads list';
COMMENT ON COLUMN leads.status IS 'Exact values from filter tabs: All, Interested, Contacted, Qualified, Not Interested, Converted';
COMMENT ON COLUMN leads.priority IS 'High/Medium/Low shown in leads list';
COMMENT ON COLUMN call_logs.vapi_call_id IS 'VAPI platform call identifier for voice agent integration';
COMMENT ON COLUMN call_logs.outcome IS 'Exact values from outcome badges: Meeting Booked, Callback Requested, etc.';
COMMENT ON COLUMN campaigns.conversion_rate IS 'Percentage shown on campaign cards';
COMMENT ON COLUMN campaigns.cost_per_meeting IS 'Dollar amount shown on campaign cards';

-- ============================================
-- END OF SCHEMA
-- ============================================
