-- ============================================
-- 🌱 AI LEAD IQ - SEED DATA (200 ROWS)
-- ============================================
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click "RUN" to generate all test data
-- ============================================

-- Helper function to generate random names
DO $$
DECLARE
  user_admin_id UUID;
  user_agent1_id UUID;
  user_agent2_id UUID;
  user_manager_id UUID;
  lead_ids UUID[] := ARRAY[]::UUID[];
  campaign_ids UUID[] := ARRAY[]::UUID[];
  i INT;
  j INT;
  lead_id UUID;
  campaign_id UUID;
BEGIN

-- ============================================
-- 1. INSERT USERS (4 users)
-- ============================================

INSERT INTO users (email, password_hash, first_name, last_name, company_name, company_email, industry, team_size, role, subscription_plan, subscription_status, is_active)
VALUES 
  ('colinloader061@gmail.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Colin', 'Loader', 'AI Lead IQ', 'contact@aileadiq.com', 'Technology', '1-10', 'admin', 'Pro', 'active', true),
  ('sarah.manager@aileadiq.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Sarah', 'Johnson', 'AI Lead IQ', 'contact@aileadiq.com', 'Technology', '1-10', 'manager', 'Pro', 'active', true),
  ('agent1@aileadiq.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Mike', 'Smith', 'AI Lead IQ', 'contact@aileadiq.com', 'Technology', '1-10', 'agent', 'Pro', 'active', true),
  ('agent2@aileadiq.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Jessica', 'Williams', 'AI Lead IQ', 'contact@aileadiq.com', 'Technology', '1-10', 'agent', 'Pro', 'active', true);

SELECT id INTO user_admin_id FROM users WHERE email = 'colinloader061@gmail.com' LIMIT 1;
SELECT id INTO user_agent1_id FROM users WHERE email = 'agent1@aileadiq.com' LIMIT 1;
SELECT id INTO user_agent2_id FROM users WHERE email = 'agent2@aileadiq.com' LIMIT 1;
SELECT id INTO user_manager_id FROM users WHERE email = 'sarah.manager@aileadiq.com' LIMIT 1;

RAISE NOTICE 'Created 4 users';

-- ============================================
-- 2. INSERT 200 LEADS
-- ============================================

FOR i IN 1..200 LOOP
  INSERT INTO leads (
    first_name, 
    last_name, 
    company, 
    title, 
    email, 
    phone, 
    source, 
    status, 
    priority, 
    score,
    assigned_to,
    created_at
  )
  VALUES (
    (ARRAY['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Jennifer', 'Robert', 'Maria'])[1 + floor(random() * 10)],
    (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'])[1 + floor(random() * 10)],
    (ARRAY['TechCorp Inc.', 'Global Solutions LLC', 'Innovation Labs', 'DataDrive Systems', 'CloudFirst Technologies', 'NextGen Enterprises', 'Digital Dynamics', 'Smart Industries', 'Future Works Co.', 'Prime Ventures'])[1 + floor(random() * 10)],
    (ARRAY['CEO', 'CTO', 'VP Sales', 'VP Marketing', 'Sales Manager', 'Director of Sales', 'Business Development Manager', 'Account Executive', 'General Manager', 'Product Manager'])[1 + floor(random() * 10)],
    'lead' || i || '@company' || floor(random() * 50) || '.com',
    '+1-' || (200 + floor(random() * 800))::text || '-' || (100 + floor(random() * 900))::text || '-' || (1000 + floor(random() * 9000))::text,
    (ARRAY['LinkedIn', 'Webinar', 'Referral', 'Cold Outreach', 'Website', 'Advertisement', 'Social Media'])[1 + floor(random() * 7)],
    (ARRAY['Interested', 'Contacted', 'Qualified', 'Not Interested', 'Converted'])[1 + floor(random() * 5)],
    (ARRAY['High', 'Medium', 'Low'])[1 + floor(random() * 3)],
    random()::numeric(3,2),
    CASE WHEN random() < 0.5 THEN user_agent1_id ELSE user_agent2_id END,
    NOW() - (random() * 90 || ' days')::interval
  )
  RETURNING id INTO lead_id;
  
  lead_ids := array_append(lead_ids, lead_id);
  
  IF i % 50 = 0 THEN
    RAISE NOTICE 'Created % leads', i;
  END IF;
END LOOP;

RAISE NOTICE 'Created 200 leads';

-- ============================================
-- 3. INSERT CAMPAIGNS (15 campaigns)
-- ============================================

FOR i IN 1..15 LOOP
  INSERT INTO campaigns (
    campaign_name,
    industry,
    status,
    conversion_rate,
    cost_per_meeting,
    leads_processed,
    target_leads,
    created_by,
    created_at
  )
  VALUES (
    (ARRAY['Mixed Industry Pilot', 'Tech Startup Outreach', 'Healthcare Q4 Campaign', 'Real Estate Leads Drive', 'Finance Sector Push', 'Retail Holiday Campaign', 'B2B Prospecting Q1', 'Enterprise Outreach', 'SMB Growth Initiative', 'Referral Partner Program', 'LinkedIn Lead Gen', 'Webinar Follow-up Campaign', 'Cold Call Blitz', 'Email Nurture Sequence', 'Re-engagement Campaign'])[i],
    (ARRAY['Technology', 'Healthcare', 'Real Estate', 'Finance', 'Retail', 'Manufacturing', 'Mixed'])[1 + floor(random() * 7)],
    (ARRAY['Active', 'Active', 'Active', 'Paused'])[1 + floor(random() * 4)],
    5 + (random() * 20)::numeric(5,2),
    80 + (random() * 120)::numeric(10,2),
    20 + floor(random() * 80)::int,
    100 + floor(random() * 400)::int,
    user_admin_id,
    NOW() - (random() * 60 || ' days')::interval
  )
  RETURNING id INTO campaign_id;
  
  campaign_ids := array_append(campaign_ids, campaign_id);
END LOOP;

RAISE NOTICE 'Created 15 campaigns';

-- ============================================
-- 4. LINK LEADS TO CAMPAIGNS
-- ============================================

FOR i IN 1..array_length(campaign_ids, 1) LOOP
  FOR j IN 1..(10 + floor(random() * 20)::int) LOOP
    BEGIN
      INSERT INTO campaign_leads (campaign_id, lead_id, campaign_status, added_at)
      VALUES (
        campaign_ids[i],
        lead_ids[1 + floor(random() * 200)::int],
        (ARRAY['queued', 'in_progress', 'contacted', 'completed'])[1 + floor(random() * 4)],
        NOW() - (random() * 30 || ' days')::interval
      );
    EXCEPTION WHEN unique_violation THEN
      -- Skip duplicates
    END;
  END LOOP;
END LOOP;

RAISE NOTICE 'Linked leads to campaigns';

-- ============================================
-- 5. INSERT CALL LOGS (350 calls)
-- ============================================

FOR i IN 1..350 LOOP
  INSERT INTO call_logs (
    lead_id,
    agent_id,
    campaign_id,
    call_type,
    duration,
    outcome,
    transcript,
    notes,
    vapi_call_id,
    vapi_session_id,
    vapi_assistant_id,
    sentiment,
    sentiment_score,
    call_quality_score,
    cost,
    follow_up_required,
    created_at
  )
  VALUES (
    lead_ids[1 + floor(random() * 200)::int],
    CASE WHEN random() < 0.5 THEN user_agent1_id ELSE user_agent2_id END,
    CASE WHEN random() < 0.7 THEN campaign_ids[1 + floor(random() * 15)::int] ELSE NULL END,
    (ARRAY['Outbound', 'Inbound'])[1 + floor(random() * 2)],
    (CASE 
      WHEN random() < 0.2 THEN floor(random() * 30)::int
      ELSE 60 + floor(random() * 540)::int
    END),
    (ARRAY['Meeting Booked', 'Callback Requested', 'Not Interested', 'Voicemail', 'No Answer', 'Interested', 'Follow-up Required'])[1 + floor(random() * 7)],
    'Agent: Hi, this is calling from AI Lead IQ...<br>Lead: Tell me more about your services...',
    CASE WHEN random() < 0.5 THEN 'Follow-up scheduled for next week' ELSE NULL END,
    'vapi_call_' || floor(random() * 1000000)::text || '_' || i::text,
    'vapi_session_' || floor(random() * 1000000)::text || '_' || i::text,
    'asst_lead_qualification_v1',
    (ARRAY['positive', 'neutral', 'negative', 'mixed'])[1 + floor(random() * 4)],
    -1 + (random() * 2)::numeric(3,2),
    0.5 + (random() * 0.5)::numeric(3,2),
    0.50 + (random() * 2.50)::numeric(10,4),
    random() < 0.3,
    NOW() - (random() * 60 || ' days')::interval
  );
  
  IF i % 100 = 0 THEN
    RAISE NOTICE 'Created % call logs', i;
  END IF;
END LOOP;

RAISE NOTICE 'Created 350 call logs';

-- ============================================
-- 6. INSERT EMAIL LOGS (1,500 emails)
-- ============================================

FOR i IN 1..1500 LOOP
  INSERT INTO email_logs (
    lead_id,
    campaign_id,
    subject,
    email_type,
    status,
    sent_at
  )
  VALUES (
    lead_ids[1 + floor(random() * 200)::int],
    CASE WHEN random() < 0.6 THEN campaign_ids[1 + floor(random() * 15)::int] ELSE NULL END,
    'Quick question about your sales process',
    (ARRAY['outreach', 'follow_up', 'nurture'])[1 + floor(random() * 3)],
    (ARRAY['sent', 'delivered', 'opened', 'clicked'])[1 + floor(random() * 4)],
    NOW() - (random() * 60 || ' days')::interval
  );
END LOOP;

RAISE NOTICE 'Created 1,500 email logs';

-- ============================================
-- 7. INSERT SMS LOGS (800 SMS)
-- ============================================

FOR i IN 1..800 LOOP
  INSERT INTO sms_logs (
    lead_id,
    message,
    to_phone,
    sms_type,
    status,
    cost,
    sent_at
  )
  VALUES (
    lead_ids[1 + floor(random() * 200)::int],
    'Hi! Quick question about scheduling a demo. Let me know!',
    '+1-' || (200 + floor(random() * 800))::text || '-' || (100 + floor(random() * 900))::text || '-' || (1000 + floor(random() * 9000))::text,
    (ARRAY['outreach', 'follow_up', 'reminder'])[1 + floor(random() * 3)],
    (ARRAY['sent', 'delivered'])[1 + floor(random() * 2)],
    0.01 + (random() * 0.04)::numeric(6,4),
    NOW() - (random() * 60 || ' days')::interval
  );
END LOOP;

RAISE NOTICE 'Created 800 SMS logs';

-- ============================================
-- 8. INSERT AI WORKFLOWS (4 templates)
-- ============================================

INSERT INTO ai_workflows (workflow_name, workflow_type, description, is_template, created_by, is_active)
VALUES
  ('New Lead Qualification', 'lead_qualification', 'Automatically qualify new leads based on profile and engagement', true, user_admin_id, true),
  ('Long-term Follow-up', 'follow_up', 'Re-engage leads that haven''t responded in 30+ days', true, user_admin_id, true),
  ('Re-engagement Campaign', 're_engagement', 'Win back leads marked as "Not Interested"', true, user_admin_id, true),
  ('Meeting Confirmation', 'meeting_confirmation', 'Automated meeting confirmations and reminders', true, user_admin_id, true);

RAISE NOTICE 'Created 4 AI workflows';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

RAISE NOTICE '✅ SEED DATA GENERATION COMPLETE!';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE '📊 Summary:';
RAISE NOTICE '   👥 Users: 4';
RAISE NOTICE '   📋 Leads: 200';
RAISE NOTICE '   🎯 Campaigns: 15';
RAISE NOTICE '   🔗 Campaign-Lead Links: ~250';
RAISE NOTICE '   📞 Call Logs: 350';
RAISE NOTICE '   📧 Email Logs: 1,500';
RAISE NOTICE '   💬 SMS Logs: 800';
RAISE NOTICE '   🤖 AI Workflows: 4';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE '🔐 Test Login: colinloader061@gmail.com / password123';
RAISE NOTICE '✅ Check Table Editor to see all your data!';

END $$;
