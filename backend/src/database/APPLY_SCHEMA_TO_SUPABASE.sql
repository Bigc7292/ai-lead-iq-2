-- ============================================
-- 🚀 QUICK APPLY: AI LEAD IQ DATABASE SCHEMA
-- ============================================
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click "RUN" or press Ctrl+Enter
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean re-run)
DROP VIEW IF EXISTS lead_status_counts CASCADE;
DROP VIEW IF EXISTS campaign_performance CASCADE;
DROP VIEW IF EXISTS leads_with_latest_call CASCADE;

DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS ai_workflows CASCADE;
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS dashboard_analytics CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS campaign_leads CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLE CREATION
-- ============================================

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  industry VARCHAR(100),
  team_size VARCHAR(50),
  role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  is_active BOOLEAN DEFAULT true,
  subscription_plan VARCHAR(100),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LEADS TABLE
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  source VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'All' CHECK (status IN ('All', 'Interested', 'Contacted', 'Qualified', 'Not Interested', 'Converted')),
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  score DECIMAL(3, 2) DEFAULT 0.00 CHECK (score >= 0.00 AND score <= 1.00),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- 3. CAMPAIGNS TABLE
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed', 'Draft')),
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
  cost_per_meeting DECIMAL(10, 2),
  leads_processed INTEGER DEFAULT 0,
  target_leads INTEGER,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 4. CAMPAIGN_LEADS TABLE
CREATE TABLE campaign_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  campaign_status VARCHAR(50) DEFAULT 'queued' CHECK (campaign_status IN ('queued', 'in_progress', 'contacted', 'completed', 'skipped')),
  UNIQUE(campaign_id, lead_id)
);

-- 5. CALL_LOGS TABLE (with VAPI integration)
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('Outbound', 'Inbound')),
  duration INTEGER,
  outcome VARCHAR(100) NOT NULL DEFAULT 'No Answer' CHECK (outcome IN ('Meeting Booked', 'Callback Requested', 'Not Interested', 'Voicemail', 'No Answer', 'Interested', 'Follow-up Required')),
  transcript TEXT,
  notes TEXT,
  summary TEXT,
  vapi_call_id VARCHAR(255),
  vapi_session_id VARCHAR(255),
  vapi_assistant_id VARCHAR(255),
  recording_url TEXT,
  recording_duration INTEGER,
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  sentiment_score DECIMAL(3, 2),
  key_points JSONB,
  call_quality_score DECIMAL(3, 2),
  cost DECIMAL(10, 4),
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  call_started_at TIMESTAMP WITH TIME ZONE,
  call_ended_at TIMESTAMP WITH TIME ZONE
);

-- 6. DASHBOARD_ANALYTICS TABLE
CREATE TABLE dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  total_calls_attempted INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  total_talk_time INTEGER DEFAULT 0,
  avg_cost_per_meeting DECIMAL(10, 2),
  total_emails_sent INTEGER DEFAULT 0,
  total_sms_sent INTEGER DEFAULT 0,
  outbound_calls INTEGER DEFAULT 0,
  inbound_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  voicemails INTEGER DEFAULT 0,
  no_answers INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_interested INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  average_call_duration INTEGER,
  total_revenue DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, period_type)
);

-- 7. EMAIL_LOGS TABLE
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(500),
  body TEXT,
  email_type VARCHAR(50) CHECK (email_type IN ('outreach', 'follow_up', 'meeting_confirmation', 'nurture', 'campaign')),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- 8. SMS_LOGS TABLE
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  to_phone VARCHAR(50) NOT NULL,
  from_phone VARCHAR(50),
  sms_type VARCHAR(50) CHECK (sms_type IN ('outreach', 'follow_up', 'reminder', 'confirmation', 'campaign')),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered')),
  sms_sid VARCHAR(255),
  replied_at TIMESTAMP WITH TIME ZONE,
  reply_message TEXT,
  cost DECIMAL(6, 4),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- 9. AI_WORKFLOWS TABLE
CREATE TABLE ai_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_name VARCHAR(255) NOT NULL,
  workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN ('lead_qualification', 'follow_up', 're_engagement', 'meeting_confirmation', 'nurture', 'custom')),
  description TEXT,
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  trigger_conditions JSONB,
  actions JSONB,
  ai_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  times_used INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. WORKFLOW_EXECUTIONS TABLE
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES ai_workflows(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_name ON users(company_name);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company ON leads(company);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_industry ON campaigns(industry);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE INDEX idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON campaign_leads(lead_id);

CREATE INDEX idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX idx_call_logs_agent_id ON call_logs(agent_id);
CREATE INDEX idx_call_logs_campaign_id ON call_logs(campaign_id);
CREATE INDEX idx_call_logs_call_type ON call_logs(call_type);
CREATE INDEX idx_call_logs_outcome ON call_logs(outcome);
CREATE INDEX idx_call_logs_vapi_call_id ON call_logs(vapi_call_id);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at DESC);

CREATE INDEX idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);

CREATE INDEX idx_sms_logs_lead_id ON sms_logs(lead_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);

CREATE INDEX idx_dashboard_analytics_user_id ON dashboard_analytics(user_id);
CREATE INDEX idx_dashboard_analytics_date ON dashboard_analytics(date DESC);
CREATE INDEX idx_dashboard_analytics_period ON dashboard_analytics(period_type);

CREATE INDEX idx_ai_workflows_type ON ai_workflows(workflow_type);
CREATE INDEX idx_ai_workflows_is_active ON ai_workflows(is_active);
CREATE INDEX idx_ai_workflows_created_by ON ai_workflows(created_by);

CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_lead_id ON workflow_executions(lead_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- ============================================
-- CREATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- CREATE VIEWS
-- ============================================

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

CREATE OR REPLACE VIEW lead_status_counts AS
SELECT 
  status,
  COUNT(*) as count
FROM leads
GROUP BY status;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ SCHEMA APPLIED SUCCESSFULLY!';
  RAISE NOTICE '10 tables created, 40+ indexes, 5 triggers, 3 views';
  RAISE NOTICE 'Next step: Run the seed data generator';
END $$;
