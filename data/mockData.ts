import { Lead, LeadStatus, Campaign, CampaignStatus, CallLog, CallOutcome } from '../types';

export const mockLeads: Lead[] = [
    {
        id: 63, name: 'Emily Chen', company: 'Retail Hub 4', email: 'contact63@company63.com', phone: '+971501234063',
        position: 'VP Sales', industry: 'Retail', status: LeadStatus.NOT_INTERESTED, priority: 'High', source: 'Website',
        notes: 'Initial interest but found another solution.', aiScore: 45, lastContacted: '2025-10-20', avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    {
        id: 75, name: 'Hind Al-Zaabi', company: 'Travel Agency 1', email: 'contact75@company75.com', phone: '+971501234075',
        position: 'Director', industry: 'Travel', status: LeadStatus.NOT_INTERESTED, priority: 'Low', source: 'Referral',
        notes: 'Budget constraints.', aiScore: 30, lastContacted: '2025-10-18', avatarUrl: 'https://i.pravatar.cc/150?img=2'
    },
    {
        id: 74, name: 'Daniel Martinez', company: 'Consulting Firm 4', email: 'contact74@company74.com', phone: '+971501234074',
        position: 'Director', industry: 'Consulting', status: LeadStatus.INTERESTED, priority: 'High', source: 'Social Media',
        notes: 'Very interested in workflow automation.', aiScore: 92, lastContacted: '2025-10-22', avatarUrl: 'https://i.pravatar.cc/150?img=3'
    },
    {
        id: 73, name: 'Mariam Youssef', company: 'Retail Hub 4', email: 'contact73@company73.com', phone: '+971501234073',
        position: 'VP Sales', industry: 'Retail', status: LeadStatus.CONTACTED, priority: 'Medium', source: 'Website',
        notes: 'Had a good initial call.', aiScore: 78, lastContacted: '2025-10-25', avatarUrl: 'https://i.pravatar.cc/150?img=4'
    },
    {
        id: 72, name: 'Thomas Anderson', company: 'Finance Plus 1', email: 'contact72@company72.com', phone: '+971501234072',
        position: 'Analyst', industry: 'Finance', status: LeadStatus.NEW, priority: 'Low', source: 'Website',
        notes: 'New signup from the website.', aiScore: 65, lastContacted: '2025-10-26', avatarUrl: 'https://i.pravatar.cc/150?img=5'
    },
    {
        id: 71, name: 'Noor Al-Mansoori', company: 'Media Co 4', email: 'contact71@company71.com', phone: '+971501234071',
        position: 'Partner', industry: 'Other', status: LeadStatus.CONVERTED, priority: 'High', source: 'Social Media',
        notes: 'Sample lead #71 - interested in AI-powered sales automation. Closed deal.', aiScore: 98, lastContacted: '2025-09-15', avatarUrl: 'https://i.pravatar.cc/150?img=6'
    },
    {
        id: 16, name: 'John Doe', company: 'Acme Corp', email: 'john.d@acme.com', phone: '+1 (555) 000-0000',
        position: 'Sales Manager', industry: 'Technology', status: LeadStatus.QUALIFIED, priority: 'Medium', source: 'Referral',
        notes: 'Additional notes...', aiScore: 85, lastContacted: '2025-10-12', avatarUrl: 'https://i.pravatar.cc/150?img=7'
    },
     {
        id: 19, name: 'Rania Mahmoud', company: 'Tech Innovators', email: 'rania.m@techinnovators.com', phone: '+971501234019',
        position: 'CTO', industry: 'Technology', status: LeadStatus.NOT_INTERESTED, priority: 'High', source: 'Website',
        notes: 'No longer interested.', aiScore: 25, lastContacted: '2025-10-19', avatarUrl: 'https://i.pravatar.cc/150?img=8'
    },
    {
        id: 4, name: 'David Thompson', company: 'Global Solutions', email: 'david.t@globalsolutions.com', phone: '+971501234004',
        position: 'CEO', industry: 'Finance', status: LeadStatus.INTERESTED, priority: 'High', source: 'Referral',
        notes: 'Wants a demo next week.', aiScore: 91, lastContacted: '2025-10-18', avatarUrl: 'https://i.pravatar.cc/150?img=9'
    },
];


export const mockCampaigns: Campaign[] = [
    {
        id: 1, name: 'Mixed Industry Pilot', status: CampaignStatus.DRAFT, industry: 'Other', progress: 0, total: 50,
        createdAt: '2025-03-01', description: 'Test campaign across various industries.',
        meetingsBooked: 0, callsAnswered: 0, avgCostPerMeeting: 0,
    },
    {
        id: 2, name: 'Insurance Companies', status: CampaignStatus.COMPLETED, industry: 'Insurance', progress: 22, total: 22,
        conversionRate: 27, createdAt: '2025-02-15', description: 'Reach insurance providers and agencies.',
        meetingsBooked: 6, callsAnswered: 22, avgCostPerMeeting: 42.50,
    },
    {
        id: 3, name: 'Education Sector Reach', status: CampaignStatus.ACTIVE, industry: 'Education', progress: 10, total: 18,
        conversionRate: 28, createdAt: '2025-04-10', description: 'Target schools and educational institutions.',
        meetingsBooked: 3, callsAnswered: 10, avgCostPerMeeting: 65.00,
    },
    {
        id: 4, name: 'Retail Growth Initiative', status: CampaignStatus.ACTIVE, industry: 'Retail', progress: 25, total: 40,
        conversionRate: 15, createdAt: '2025-05-20', description: 'Connect with retail businesses.',
        meetingsBooked: 4, callsAnswered: 25, avgCostPerMeeting: 88.20,
    },
    {
        id: 5, name: 'Real Estate Expansion', status: CampaignStatus.PAUSED, industry: 'Real Estate', progress: 20, total: 35,
        conversionRate: 10, createdAt: '2025-06-01', description: 'Target real estate agencies and brokers.',
        meetingsBooked: 2, callsAnswered: 20, avgCostPerMeeting: 110.00,
    },
    {
        id: 6, name: 'Healthcare Providers', status: CampaignStatus.ACTIVE, industry: 'Healthcare', progress: 8, total: 20,
        conversionRate: 12, createdAt: '2025-07-05', description: 'Outreach to healthcare organizations.',
        meetingsBooked: 1, callsAnswered: 8, avgCostPerMeeting: 95.75,
    },
    {
        id: 7, name: 'Q1 2024 Technology Outreach', status: CampaignStatus.ACTIVE, industry: 'Technology', progress: 18, total: 30,
        conversionRate: 22, createdAt: '2025-01-15', description: 'Technology outreach for Q1.',
        meetingsBooked: 4, callsAnswered: 18, avgCostPerMeeting: 55.30,
    },
    {
        id: 8, name: 'Finance Sector Campaign', status: CampaignStatus.ACTIVE, industry: 'Finance', progress: 12, total: 25,
        conversionRate: 16, createdAt: '2025-08-01', description: 'Campaign targeting finance sector.',
        meetingsBooked: 2, callsAnswered: 12, avgCostPerMeeting: 72.00,
    }
];

const johnDoe = mockLeads.find(l => l.id === 16)!;
const danielMartinez = mockLeads.find(l => l.id === 74)!;
const emilyChen = mockLeads.find(l => l.id === 63)!;

export const mockCallLogs: CallLog[] = [
    {
        id: 1,
        lead: johnDoe,
        direction: 'Outbound',
        outcome: CallOutcome.MEETING_BOOKED,
        duration: '8 min 12 sec',
        dateTime: 'Oct 22, 2025 • 2:15 PM',
        notes: 'Product demo scheduled for Friday. Sent follow-up email with calendar invite.',
        keyPoints: ['Budget confirmed', 'Decision maker', 'Demo scheduled'],
        transcript: `[00:00] AI: Hello John, this is Alex from AILeadIQ. How are you today?
[00:04] John: Hi Alex, I'm doing well, thanks. I saw your email and was intrigued.
[00:09] AI: That's great to hear. I was hoping to learn a bit more about your current sales process at Acme Corp and see if our AI-powered agents could help streamline things.
...
[07:58] John: That sounds fantastic. Let's get that demo scheduled. Does Friday work for you?
[08:02] AI: Absolutely. I'll send over a calendar invite for Friday afternoon. We look forward to showing you what we can do.`,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder URL
        cost: 1.25,
    },
    {
        id: 2,
        lead: danielMartinez,
        direction: 'Outbound',
        outcome: CallOutcome.CALLBACK_REQUESTED,
        duration: '2 min 45 sec',
        dateTime: 'Oct 21, 2025 • 11:30 AM',
        notes: 'Requested a callback tomorrow afternoon. Mentioned he is evaluating competitors.',
        keyPoints: ['Evaluating competitors', 'Callback requested'],
        transcript: `[00:00] AI: Hi Daniel, I'm calling from AILeadIQ regarding your interest in our platform.
[00:05] Daniel: Hi there. Look, now is not a good time, I'm just heading into a meeting.
[00:10] AI: I understand completely. Would it be alright if I called you back tomorrow afternoon?
[00:15] Daniel: Yes, that would be better. Say, around 3 PM?
[00:18] AI: 3 PM tomorrow it is. I'll speak with you then.`,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        cost: 0.42,
    },
    {
        id: 3,
        lead: emilyChen,
        direction: 'Outbound',
        outcome: CallOutcome.NOT_INTERESTED,
        duration: '3 min 50 sec',
        dateTime: 'Oct 20, 2025 • 4:00 PM',
        notes: 'Stated they have already chosen another vendor. Not open to re-evaluating at this time.',
        keyPoints: ['Competitor solution chosen'],
        transcript: `[00:00] AI: Hello Emily, my name is Alex from AILeadIQ. I was hoping to discuss how we can help optimize your sales outreach.
[00:06] Emily: Hi, thanks for the call, but we've actually just signed a contract with another provider.
[00:11] AI: I see. Well, we appreciate you letting us know. We'd be happy to be a resource in the future if anything changes.
[00:17] Emily: Sounds good, thanks. Bye.`,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        cost: 0.61,
    },
    {
        id: 4,
        lead: johnDoe,
        direction: 'Inbound',
        outcome: CallOutcome.INTERESTED,
        duration: '12 min 30 sec',
        dateTime: 'Oct 19, 2025 • 9:05 AM',
        notes: 'Called back with some technical questions about integration. Seems very keen.',
        keyPoints: ['Technical questions', 'Integration concerns'],
        transcript: `[00:00] John: Hi, I'm calling back for Alex... I had a few more questions about the API.
[00:05] AI: Of course, John. I'm here to help and have access to all our technical documentation. What's on your mind?
...
[12:20] AI: That's a great question. Our system is designed for exactly that kind of custom workflow.
[12:25] John: Perfect, that's what I needed to hear.`,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },
];