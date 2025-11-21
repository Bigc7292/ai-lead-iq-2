# AI Lead IQ Backend

AI-powered real estate lead management system with voice outreach capabilities.

## 🚀 Quick Start

**New to this project? Start here:**

1. **[📋 TODO Checklist](./TODO_CHECKLIST.md)** - Printable step-by-step checklist for setup
2. **[⚡ Quick Start Guide](./QUICK_START.md)** - Detailed setup instructions (~15 min)

**Already set up?** See [Setup Instructions](#setup-instructions) below.

---

## Features

- 🎯 **AI Lead Scoring**: Automatic lead qualification using Google Gemini
- 🗣️ **Voice AI**: Text-to-Speech and Speech-to-Text via MiniMax (speech-02-turbo)
- 📞 **Outbound Calling**: Automated voice outreach (Sprint 2)
- 💾 **Supabase Database**: Scalable PostgreSQL backend
- 🚀 **RESTful API**: Express.js server with structured routes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI Services**:
  - Google Gemini (Lead Scoring & Analysis)
  - MiniMax speech-02-turbo (TTS/STT)
- **Telephony**: Twilio (Planned for Sprint 2)

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── routes/
│   │   ├── health.js          # Health check endpoint
│   │   └── leads.js           # Lead management routes
│   ├── models/
│   │   └── Lead.js            # Lead data model
│   └── services/
│       ├── supabaseClient.js  # Supabase configuration
│       ├── leadsService.js    # Lead CRUD operations
│       ├── geminiService.js   # AI scoring & analysis
│       └── minimaxService.js  # Voice AI (TTS/STT)
├── docs/
│   ├── architecture.md        # System architecture
│   └── database-schema.md     # Database setup guide
├── tests/                     # Test files (Sprint 1)
├── .env.example              # Environment variables template
└── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Google AI Studio API key (Gemini)
- MiniMax API credentials

### 2. Installation

```bash
cd backend
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# MiniMax
MINIMAX_API_KEY=your-minimax-api-key
MINIMAX_GROUP_ID=your-minimax-group-id

# Server
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Follow the instructions in `docs/database-schema.md`
4. Run the SQL to create the `leads` table

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Leads Management

```
GET    /api/leads          # Get all leads
GET    /api/leads/:id      # Get lead by ID
POST   /api/leads          # Create new lead (auto-scores with AI)
PUT    /api/leads/:id      # Update lead
DELETE /api/leads/:id      # Delete lead
POST   /api/leads/:id/call # Initiate outbound call (Sprint 2)
```

### Example: Create a Lead

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

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "score": 75,
    "status": "new",
    ...
  }
}
```

## Development Roadmap

### ✅ Sprint 1: Foundation & Data Layer (Current)
- [x] Project structure and dependencies
- [x] Supabase integration
- [x] Lead CRUD API
- [x] Gemini AI scoring
- [x] MiniMax service foundation

### 🔄 Sprint 2: Voice & AI Integration
- [ ] Twilio integration
- [ ] Call flow implementation
- [ ] Real-time conversation handling
- [ ] Post-call analysis with Gemini
- [ ] Call logs and history

### 📋 Sprint 3: Deployment & Polish
- [ ] Error handling and logging
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Cloud deployment (Render/Heroku)
- [ ] Performance optimization

## Testing

```bash
# Run tests (Sprint 1)
npm test

# Run with coverage
npm run test:coverage
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run test suite
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for real estate professionals**
