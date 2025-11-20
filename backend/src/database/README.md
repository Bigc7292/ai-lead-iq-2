# Database Setup - AI Lead IQ

Complete Supabase database schema implementation for the AI Lead IQ platform.

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabaseClient.js       # Supabase client initialization
│   ├── database/
│   │   ├── schema.sql              # Complete database schema with RLS
│   │   └── seedData.js             # Test data seeder script
│   ├── models/
│   │   ├── leadModel.ts            # Lead TypeScript interfaces
│   │   ├── userModel.ts            # User TypeScript interfaces
│   │   └── callLogModel.ts         # Call log TypeScript interfaces
│   └── utils/
│       └── gdprUtils.js            # GDPR compliance utilities
└── docs/
    ├── database-schema.md          # Complete schema documentation
    └── database-quickstart.md      # Quick start guide
```

## 🚀 Quick Start

### 1. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Run Schema Migration
Open Supabase SQL Editor and run `src/database/schema.sql`

### 3. Seed Test Data
```bash
node src/database/seedData.js
```

## 🗂️ Database Tables

| Table | Description |
|-------|-------------|
| **users** | User authentication and profiles with GDPR hashing |
| **leads** | Lead management with AI scoring and blockchain tracking |
| **call_logs** | Call history with Retell AI/Twilio integration |
| **lead_scoring_history** | Audit trail for score changes |

## 🔒 Security Features

- ✅ **Row-Level Security (RLS)** on all tables
- ✅ **GDPR-compliant PII hashing** (Ethereum-style)
- ✅ **Blockchain audit trails** (stub implementation)
- ✅ **Consent tracking** for data processing
- ✅ **Role-based access control** (Admin, Manager, Agent)

## 🤖 Auto-Scoring System

Leads are automatically scored on creation based on:
- Email present: +15%
- Phone present: +15%
- Budget specified: +20%
- Timeline provided: +10%
- Property type known: +10%
- Base score: 30%

## 📊 Database Views

- **high_value_leads**: Leads with score > 0.8
- **lead_performance_summary**: Aggregate engagement metrics

## 🔧 Example Usage

### Query Leads
```javascript
const { supabase } = require('./config/supabaseClient');

const { data, error } = await supabase
  .from('leads')
  .select('*')
  .gt('score', 0.8);
```

### Create GDPR-Compliant Lead
```javascript
const { processLeadForGDPR } = require('./utils/gdprUtils');

const leadData = processLeadForGDPR({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-1234',
});

await supabase.from('leads').insert([leadData]);
```

## 📚 Documentation

- **Complete Schema Docs**: [database-schema.md](../docs/database-schema.md)
- **Quick Start Guide**: [database-quickstart.md](../docs/database-quickstart.md)

## ⚠️ Production TODOs

The following are stub implementations requiring production replacements:

1. Replace SHA-256 with actual keccak256 (ethers.js/web3.js)
2. Implement real Ethereum blockchain transactions
3. Add field-level encryption for sensitive data
4. Create automated GDPR data retention cleanup jobs
5. Set up monitoring for RLS policy violations

## 📝 Environment Variables Required

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # Server-side only!
```

## 🎯 Key Features

- **Auto-scoring triggers** on lead insertion
- **Score change tracking** with audit trail
- **Automatic timestamp updates** on modifications
- **GDPR consent validation** before PII processing
- **PII sanitization** for secure logging
- **Health checks** for database connectivity

## 🧪 Testing

```bash
# Test database connection
node -e "require('./src/config/supabaseClient').testConnection()"

# Seed test data
node src/database/seedData.js

# Run queries via Supabase SQL Editor
SELECT * FROM high_value_leads;
```

## 🔗 Related Technologies

- **Supabase**: PostgreSQL database with RLS
- **TypeScript**: Type-safe models and interfaces
- **GDPR**: EU data protection compliance
- **Ethereum**: Blockchain audit trail (stub)
- **Retell AI**: Voice interaction tracking
- **Twilio**: Call management integration

---

**Status**: ✅ Schema complete and ready for deployment

**Last Updated**: 2025-11-20
