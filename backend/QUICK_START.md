# 🚀 Quick Start Guide - AI Lead IQ Backend

**Free Tier Setup** - No billing account required!

This guide will get you from zero to a working AI lead management system in ~15 minutes.

---

## ✅ What You'll Need

### Required (Free):
- ✅ **Supabase Account** (Free tier: 500MB database)
- ✅ **Gemini API Key** (Free tier: 15 req/min, 1M tokens/day) - ✅ **Already configured!**
- ✅ **Node.js 18+** installed
- ✅ **Redis** (Docker or cloud free tier)

### Optional (For full features):
- ⚪ MiniMax API (Voice AI)
- ⚪ Twilio Account (Phone calls)

---

## 📋 Step-by-Step Setup

### **Step 1: Install Node.js Dependencies**

Open your terminal in VS Code and run:

```bash
cd backend
npm install
```

**Expected output:** ✅ Packages installed successfully

---

### **Step 2: Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in (free account)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `ai-lead-iq`
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to you
5. Click **"Create new project"** (takes ~2 minutes)

6. **Get your credentials:**
   - Go to **Settings** (⚙️) → **API**
   - Copy these two values:
     - `Project URL` → You'll need this as `SUPABASE_URL`
     - `anon` `public` key → You'll need this as `SUPABASE_ANON_KEY`

---

### **Step 3: Configure Environment Variables**

1. **Create your `.env` file:**
   ```bash
   # In the backend folder
   cp .env.example .env
   ```

2. **Edit `.env` file** (use VS Code):
   - Open `backend/.env`
   - Update these values:

```env
# 1. SUPABASE (paste your values from Step 2)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGxxxxxxxxxxxxxxxxxxxxxxxxx

# 2. GEMINI API (already filled in!)
GEMINI_API_KEY=AIzaSyCyFE0rZ58xUjiSgbYyD-MdzDI-7s_xQZI

# 3. SECURITY (run this command to generate):
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET=PASTE_GENERATED_SECRET_HERE
ENCRYPTION_KEY=PASTE_GENERATED_SECRET_HERE

# 4. REDIS (we'll set up next)
REDIS_URL=redis://localhost:6379

# 5. SERVER (keep defaults)
PORT=3000
NODE_ENV=development
```

3. **Generate security keys:**
   ```bash
   # Run this twice and paste each output into .env
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

---

### **Step 4: Set Up Database**

1. **Open Supabase SQL Editor:**
   - Go to your project → **SQL Editor** (left sidebar)
   - Click **"+ New query"**

2. **Copy the schema:**
   - Open `backend/src/database/schema.sql` in VS Code
   - Copy **ALL** the content (Ctrl+A, Ctrl+C)

3. **Run the schema:**
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or press F5)
   - Wait for "Success" message

4. **Verify tables were created:**
   - Go to **Table Editor** (left sidebar)
   - You should see: `leads`, `call_logs`, `users`, etc.

✅ **Database is ready!**

---

### **Step 5: Install Redis**

Redis is needed for batch calling features.

**Option A: Using Docker (Recommended)**
```bash
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
```

**Option B: Free Cloud Redis**
1. Go to [https://upstash.com](https://upstash.com) (free tier: 10,000 commands/day)
2. Create account → Create database
3. Copy the Redis URL → Update `REDIS_URL` in your `.env`

**Verify Redis is running:**
```bash
# If using Docker
docker ps | grep redis
```

---

### **Step 6: (Optional) Seed Test Data**

Add sample leads to test with:

```bash
node src/database/seedData.js
```

This creates:
- 3 sample leads
- 2 test users
- Sample call logs

---

### **Step 7: Start the Server!**

```bash
npm run dev
```

**Expected output:**
```
✅ Server is running on http://localhost:3000
✅ Supabase connected
✅ Redis connected
```

**Test it works:**

Open a new terminal and run:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## 🎯 What You Can Do Now

### **1. Create a Lead** (with AI scoring!)

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "propertyType": "house",
    "budget": 500000,
    "timeline": "3-6 months"
  }'
```

Gemini AI will automatically score this lead (0.0-1.0)!

### **2. Get All Leads**

```bash
curl http://localhost:3000/api/leads
```

### **3. Run Tests**

```bash
npm test
```

---

## 🚧 What's NOT Working (Optional Services)

These require additional setup but aren't needed for core features:

- ❌ **Voice Calls** (needs MiniMax API + Twilio)
- ❌ **Google Cloud Deployment** (needs billing account)
- ❌ **Secret Manager** (not needed for local dev)

---

## 📊 Free Tier Limitations

| Service | Free Limit | Your Usage (Est.) |
|---------|-----------|------------------|
| Supabase | 500MB DB | ~10MB (1000s of leads) |
| Gemini API | 15 req/min | ~5-10 leads/min |
| Redis (Upstash) | 10K commands/day | ~100-200 leads/day |

**Conclusion:** Perfect for development and moderate production use!

---

## ❓ Troubleshooting

### **Issue: `npm install` fails**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Issue: "GEMINI_API_KEY not configured"**
- Check `.env` file has `GEMINI_API_KEY=AIzaSyCy...`
- Restart the server (`Ctrl+C` then `npm run dev`)

### **Issue: "Supabase connection failed"**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active (not paused)

### **Issue: "Redis connection timeout"**
- If using Docker: `docker ps` to check Redis is running
- If using cloud: Verify `REDIS_URL` is correct
- Try: `docker restart redis-local`

### **Issue: "Port 3000 already in use"**
```bash
# Change port in .env
PORT=3001
```

---

## 🎉 Success Checklist

- [x] ✅ Gemini API key configured
- [ ] ✅ Supabase project created
- [ ] ✅ Database schema deployed
- [ ] ✅ `.env` file configured
- [ ] ✅ Redis running
- [ ] ✅ Server starts successfully
- [ ] ✅ Health check returns 200 OK
- [ ] ✅ Can create and score leads

---

## 🚀 Next Steps

1. **Explore the API** - Check `docs/api-documentation.md`
2. **Run all tests** - `npm test` and `npm run test:e2e`
3. **Add frontend** - Build a UI to interact with the API
4. **Deploy** - Use Render.com or Railway (free tier) instead of Google Cloud

---

## 📚 Additional Resources

- [Full README](./README.md)
- [API Documentation](./docs/api-documentation.md)
- [Database Schema](./docs/database-schema.md)
- [Architecture Overview](./docs/architecture.md)

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.

**Built with ❤️ using free-tier services** 🎉
