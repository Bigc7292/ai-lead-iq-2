// Fix: Replaced mock data with actual type definitions to resolve import errors across the application.
export enum LeadStatus {
    NEW = 'New',
    CONTACTED = 'Contacted',
    QUALIFIED = 'Qualified',
    INTERESTED = 'Interested',
    CONVERTED = 'Converted',
    NOT_INTERESTED = 'Not Interested',
}

export type LeadPriority = 'High' | 'Medium' | 'Low';

export interface Lead {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    position: string;
    industry: string;
    status: LeadStatus;
    priority: LeadPriority;
    source: string;
    notes: string;
    aiScore: number;
    lastContacted: string;
    avatarUrl: string;
}

export enum CampaignStatus {
    DRAFT = 'Draft',
    ACTIVE = 'Active',
    PAUSED = 'Paused',
    COMPLETED = 'Completed',
}

export interface Campaign {
    id: number;
    name: string;
    status: CampaignStatus;
    industry: string;
    progress: number;
    total: number;
    conversionRate?: number;
    createdAt: string;
    description: string;
    meetingsBooked: number;
    callsAnswered: number;
    avgCostPerMeeting: number;
}

export enum CallOutcome {
    MEETING_BOOKED = 'Meeting Booked',
    CALLBACK_REQUESTED = 'Callback Requested',
    NOT_INTERESTED = 'Not Interested',
    INTERESTED = 'Interested',
    NO_ANSWER = 'No Answer',
}

export interface CallLog {
    id: number;
    lead: Lead;
    direction: 'Inbound' | 'Outbound';
    outcome: CallOutcome;
    duration: string;
    dateTime: string;
    notes: string;
    keyPoints: string[];
    transcript: string;
    audioUrl: string;
    cost?: number;
}

export interface User {
    name: string;
    email: string;
    avatarUrl: string;
    isAdmin: boolean;
}
