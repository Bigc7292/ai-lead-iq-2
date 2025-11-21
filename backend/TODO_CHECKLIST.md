# 📝 AI Lead IQ - Setup To-Do List

**Free Tier Setup** - Complete these tasks in order

Date Started: _______________

---

## ✅ PHASE 1: Prerequisites

### Task 1.1: Install Node.js
- [ ] Download Node.js 18+ from https://nodejs.org
- [ ] Open terminal and verify: `node --version`
- [ ] Should show v18.x or higher

### Task 1.2: Install Docker Desktop (for Redis)
- [ ] Download from https://www.docker.com/products/docker-desktop/
- [ ] Install and start Docker Desktop
- [ ] Verify: `docker --version`

**OR** Skip Docker and use cloud Redis (Upstash - free tier)

---

## ✅ PHASE 2: Create Accounts

### Task 2.1: Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up (free account)
- [ ] Click "New Project"
- [ ] Fill in:
  - Name: `ai-lead-iq`
  - Password: _________________ (save this!)
  - Region: (choose closest)
- [ ] Wait ~2 minutes for project to be ready

### Task 2.2: Get Supabase Credentials
- [ ] Go to Settings ⚙️ → API
- [ ] Copy `Project URL`: _________________________________
- [ ] Copy `anon public` key: _________________________________
- [ ] Save these somewhere safe (you'll paste them in .env)

### Task 2.3: ✅ Gemini API (Already Done!)
- [x] Free API key already provided: `AIzaSyCyFE0rZ58xUjiSgbYyD-MdzDI-7s_xQZI`
- [x] Limits: 15 requests/min, 1M tokens/day

---

## ✅ PHASE 3: Local Setup

### Task 3.1: Install Dependencies
Open terminal in VS Code:
```bash
cd backend
npm install
```
- [ ] Run command above
- [ ] Wait for completion (1-2 minutes)
- [ ] No errors reported

### Task 3.2: Create .env File
```bash
cp .env.example .env
```
- [ ] Run command above
- [ ] File `.env` created in `backend/` folder

### Task 3.3: Generate Security Keys
Run this command **TWICE** and save outputs:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
- [ ] First output (JWT_SECRET): _________________________________
- [ ] Second output (ENCRYPTION_KEY): _________________________________

### Task 3.4: Edit .env File
Open `backend/.env` in VS Code and update:

```env
# 1. SUPABASE - paste from Task 2.2
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOxxxxx

# 2. GEMINI - already filled!
GEMINI_API_KEY=AIzaSyCyFE0rZ58xUjiSgbYyD-MdzDI-7s_xQZI

# 3. SECURITY - paste from Task 3.3
JWT_SECRET=paste_first_generated_key_here
ENCRYPTION_KEY=paste_second_generated_key_here

# 4. REDIS - keep default for now
REDIS_URL=redis://localhost:6379

# 5. SERVER - keep defaults
PORT=3000
NODE_ENV=development
```

**Checklist:**
- [ ] SUPABASE_URL updated
- [ ] SUPABASE_ANON_KEY updated
- [ ] JWT_SECRET updated
- [ ] ENCRYPTION_KEY updated
- [ ] File saved (Ctrl+S)

---

## ✅ PHASE 4: Database Setup

### Task 4.1: Open Supabase SQL Editor
- [ ] Go to your Supabase project dashboard
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "+ New query"

### Task 4.2: Run Database Schema
- [ ] Open `backend/src/database/schema.sql` in VS Code
- [ ] Select ALL content (Ctrl+A)
- [ ] Copy (Ctrl+C)
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button (or F5)
- [ ] Wait for "Success. No rows returned" message

### Task 4.3: Verify Tables Created
- [ ] Click "Table Editor" in Supabase left sidebar
- [ ] Verify these tables exist:
  - [ ] `users`
  - [ ] `leads`
  - [ ] `call_logs`
  - [ ] `lead_scoring_history`

### Task 4.4: (Optional) Add Sample Data
```bash
node src/database/seedData.js
```
- [ ] Run command
- [ ] Sees "✅ Seeded X leads, Y users..." message

---

## ✅ PHASE 5: Redis Setup

**Choose ONE option:**

### Option A: Docker (Recommended)
```bash
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
```
- [ ] Run command
- [ ] Verify running: `docker ps | grep redis`

### Option B: Cloud Redis (Upstash)
- [ ] Go to https://upstash.com
- [ ] Sign up (free tier)
- [ ] Create Redis database
- [ ] Copy Redis URL: _________________________________
- [ ] Update `REDIS_URL` in `.env` file

---

## ✅ PHASE 6: Start & Test

### Task 6.1: Start the Server
```bash
npm run dev
```
- [ ] Run command
- [ ] See: "✅ Server is running on http://localhost:3000"
- [ ] See: "✅ Supabase connected"
- [ ] See: "✅ Redis connected"
- [ ] No errors shown

### Task 6.2: Test Health Endpoint
Open NEW terminal window:
```bash
curl http://localhost:3000/api/health
```
**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```
- [ ] Command returns healthy status
- [ ] No errors

### Task 6.3: Create a Test Lead
```bash
curl -X POST http://localhost:3000/api/leads -H "Content-Type: application/json" -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"phone\":\"+1234567890\",\"budget\":500000,\"timeline\":\"3-6 months\"}"
```
- [ ] Command succeeds
- [ ] Returns lead object with `score` field
- [ ] Gemini AI scored the lead automatically!

### Task 6.4: Run Tests
```bash
npm test
```
- [ ] Tests run
- [ ] All tests pass ✅
- [ ] Coverage report shows >80%

---

## ✅ PHASE 7: Optional Enhancements

### Task 7.1: Get MiniMax API (For Voice AI)
- [ ] Go to MiniMax dashboard
- [ ] Get API key and Group ID
- [ ] Update in `.env`:
  - `MINIMAX_API_KEY=...`
  - `MINIMAX_GROUP_ID=...`

### Task 7.2: Get Twilio Account (For Phone Calls)
- [ ] Go to https://www.twilio.com/try-twilio
- [ ] Sign up (free trial includes credit)
- [ ] Get credentials:
  - Account SID: _________________________________
  - Auth Token: _________________________________
  - Phone Number: _________________________________
- [ ] Update in `.env`

---

## 🎉 COMPLETION CHECKLIST

**You're done when ALL these are true:**

- [ ] ✅ Server starts without errors
- [ ] ✅ Health check returns `"status": "healthy"`
- [ ] ✅ Can create new leads via API
- [ ] ✅ Gemini AI scores leads automatically
- [ ] ✅ All tests pass (`npm test`)
- [ ] ✅ Database has sample data
- [ ] ✅ Redis is connected

---

## 📊 What You Have Now

- ✅ Full backend API running locally
- ✅ AI-powered lead scoring (Gemini)
- ✅ PostgreSQL database (Supabase)
- ✅ Background job processing (Redis + BullMQ)
- ✅ Secure authentication (JWT)
- ✅ GDPR-compliant data handling
- ✅ Full test suite

---

## 🚀 Next Steps

1. **Build a frontend** - Create a React/Vue app to interact with API
2. **Deploy to cloud** - Use Render.com or Railway (free tier)
3. **Add voice features** - Get MiniMax + Twilio (optional)
4. **Customize AI prompts** - Edit `src/services/geminiService.js`

---

## 🆘 Having Issues?

**Check the troubleshooting guide in `QUICK_START.md`**

Common fixes:
- Restart server: Ctrl+C, then `npm run dev`
- Restart Redis: `docker restart redis-local`
- Check `.env` file has all required values
- Verify Supabase project is active

---

**Date Completed:** _______________

**Notes:**
_______________________________________________________
_______________________________________________________
_______________________________________________________
