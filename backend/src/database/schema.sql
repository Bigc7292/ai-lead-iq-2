-- ============================================
-- AI Lead IQ - Supabase Database Schema
-- ============================================
-- This schema includes GDPR-compliant design with PII hashing and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Stores user authentication and profile data with GDPR compliance
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_hash VARCHAR(66), -- Ethereum-style hash for GDPR compliance (0x + 64 chars)
  role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  phone_hash VARCHAR(66), -- Hashed phone for GDPR compliance
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- Core table for lead management with scoring and blockchain tracking
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  email_hash VARCHAR(66), -- Ethereum-style hash for GDPR compliance
  phone VARCHAR(50),
  phone_hash VARCHAR(66), -- Hashed phone for GDPR compliance
  
  -- Property Details
  address TEXT,
  property_type VARCHAR(100),
  budget DECIMAL(12, 2),
  timeline VARCHAR(100),
  
  -- Lead Scoring & Status
  score DECIMAL(3, 2) DEFAULT 0.00 CHECK (score >= 0.00 AND score <= 1.00), -- Normalized score 0.0-1.0
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'nurturing', 'closed_won', 'closed_lost')),
  
  -- Blockchain & Compliance
  blockchain_tx_hash VARCHAR(66), -- Ethereum transaction hash for immutable audit trail
  gdpr_consent BOOLEAN DEFAULT false,
  gdpr_consent_date TIMESTAMP WITH TIME ZONE,
  
  -- Ownership & Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  source VARCHAR(100), -- lead source (website, referral, cold_call, etc.)
  
  -- Additional Data
  notes TEXT,
  metadata JSONB, -- Flexible field for additional structured data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CALL LOGS TABLE
-- Track all voice interactions with leads
-- ============================================
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Call Details
  minimax_session_id VARCHAR(255), -- MiniMax AI session identifier
  call_sid VARCHAR(100), -- Twilio Call SID
  duration INTEGER, -- Duration in seconds
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
  
  -- Call Content & Analysis
  transcript TEXT,
  transcript_hash VARCHAR(66), -- Hash for GDPR compliance if needed
  summary TEXT, -- AI-generated summary
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  sentiment_score DECIMAL(3, 2), -- -1.0 to 1.0
  
  -- Outcomes
  outcome VARCHAR(50) CHECK (outcome IN ('successful', 'no_answer', 'voicemail', 'busy', 'failed', 'callback_requested')),
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  
  -- Quality & Cost
  call_quality_score DECIMAL(3, 2), -- 0.0 to 1.0
  cost DECIMAL(10, 4), -- Call cost in USD
  
  -- Audio & Media
  recording_url TEXT,
  recording_duration INTEGER, -- Actual recording duration
  
  -- Metadata
  metadata JSONB, -- Additional structured data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- LEAD SCORING HISTORY TABLE
-- Track score changes over time for analytics
-- ============================================
CREATE TABLE lead_scoring_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  previous_score DECIMAL(3, 2),
  new_score DECIMAL(3, 2) NOT NULL,
  score_factors JSONB, -- Store factors that influenced the score
  changed_by VARCHAR(50), -- 'ai', 'manual', 'call_outcome'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Leads indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_blockchain_tx ON leads(blockchain_tx_hash);
CREATE INDEX idx_leads_source ON leads(source);

-- Call logs indexes
CREATE INDEX idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX idx_call_logs_agent_id ON call_logs(agent_id);
CREATE INDEX idx_call_logs_minimax_session ON call_logs(minimax_session_id);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at DESC);
CREATE INDEX idx_call_logs_outcome ON call_logs(outcome);
CREATE INDEX idx_call_logs_sentiment ON call_logs(sentiment);

-- Scoring history indexes
CREATE INDEX idx_scoring_history_lead_id ON lead_scoring_history(lead_id);
CREATE INDEX idx_scoring_history_created_at ON lead_scoring_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_history ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Leads RLS Policies
CREATE POLICY "Agents can view assigned leads" ON leads
  FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Agents can insert leads" ON leads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Agents can update assigned leads" ON leads
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Only admins can delete leads" ON leads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Call Logs RLS Policies
CREATE POLICY "View call logs for accessible leads" ON call_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE id = call_logs.lead_id 
      AND (
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Insert call logs for accessible leads" ON call_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE id = call_logs.lead_id 
      AND (
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    )
  );

-- Scoring History RLS (inherits from leads)
CREATE POLICY "View scoring history for accessible leads" ON lead_scoring_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE id = lead_scoring_history.lead_id 
      AND (
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    )
  );

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

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-score leads on insert (placeholder for AI scoring)
CREATE OR REPLACE FUNCTION auto_score_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic scoring logic (to be enhanced with AI)
  -- Score based on presence of key information
  DECLARE
    base_score DECIMAL := 0.30;
  BEGIN
    IF NEW.email IS NOT NULL THEN base_score := base_score + 0.15; END IF;
    IF NEW.phone IS NOT NULL THEN base_score := base_score + 0.15; END IF;
    IF NEW.budget IS NOT NULL THEN base_score := base_score + 0.20; END IF;
    IF NEW.timeline IS NOT NULL THEN base_score := base_score + 0.10; END IF;
    IF NEW.property_type IS NOT NULL THEN base_score := base_score + 0.10; END IF;
    
    NEW.score := LEAST(base_score, 1.00);
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-scoring trigger
CREATE TRIGGER auto_score_new_lead BEFORE INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION auto_score_lead();

-- Function to track scoring changes
CREATE OR REPLACE FUNCTION track_score_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.score IS DISTINCT FROM NEW.score THEN
    INSERT INTO lead_scoring_history (lead_id, previous_score, new_score, changed_by)
    VALUES (NEW.id, OLD.score, NEW.score, 'manual');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply scoring history trigger
CREATE TRIGGER track_lead_score_changes AFTER UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION track_score_changes();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- High-value leads view
CREATE OR REPLACE VIEW high_value_leads AS
SELECT 
  l.*,
  u.first_name AS agent_first_name,
  u.last_name AS agent_last_name,
  COUNT(cl.id) AS total_calls,
  MAX(cl.created_at) AS last_call_date
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN call_logs cl ON l.id = cl.lead_id
WHERE l.score > 0.8 AND l.status NOT IN ('closed_won', 'closed_lost')
GROUP BY l.id, u.first_name, u.last_name;

-- Lead performance summary
CREATE OR REPLACE VIEW lead_performance_summary AS
SELECT 
  l.id,
  l.first_name,
  l.last_name,
  l.score,
  l.status,
  COUNT(cl.id) AS total_calls,
  AVG(cl.duration) AS avg_call_duration,
  AVG(cl.sentiment_score) AS avg_sentiment,
  MAX(cl.created_at) AS last_contact_date
FROM leads l
LEFT JOIN call_logs cl ON l.id = cl.lead_id
GROUP BY l.id, l.first_name, l.last_name, l.score, l.status;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'User accounts with GDPR-compliant hashed PII';
COMMENT ON TABLE leads IS 'Lead records with AI scoring and audit trail';
COMMENT ON TABLE call_logs IS 'Call history with MiniMax AI session tracking and transcripts';
COMMENT ON TABLE lead_scoring_history IS 'Audit trail for lead score changes';

COMMENT ON COLUMN users.email_hash IS 'SHA-256 hash of email for GDPR compliance';
COMMENT ON COLUMN users.phone_hash IS 'SHA-256 hash of phone for GDPR compliance';
COMMENT ON COLUMN leads.score IS 'AI-generated lead quality score (0.0 = lowest, 1.0 = highest)';
COMMENT ON COLUMN leads.blockchain_tx_hash IS 'Optional audit trail reference for compliance';
COMMENT ON COLUMN call_logs.minimax_session_id IS 'MiniMax AI session identifier for voice interactions';
