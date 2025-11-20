/**
 * Lead Model - TypeScript Interfaces and Types
 * Defines the structure for lead data with GDPR compliance
 */

/**
 * Lead status enum
 */
export enum LeadStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    QUALIFIED = 'qualified',
    UNQUALIFIED = 'unqualified',
    NURTURING = 'nurturing',
    CLOSED_WON = 'closed_won',
    CLOSED_LOST = 'closed_lost',
}

/**
 * Lead source enum
 */
export enum LeadSource {
    WEBSITE = 'website',
    REFERRAL = 'referral',
    COLD_CALL = 'cold_call',
    SOCIAL_MEDIA = 'social_media',
    ADVERTISEMENT = 'advertisement',
    EVENT = 'event',
    PARTNER = 'partner',
    OTHER = 'other',
}

/**
 * Core Lead interface
 */
export interface Lead {
    id: string; // UUID

    // Basic Information
    first_name: string;
    last_name: string;
    email?: string;
    email_hash?: string; // Ethereum-style hash for GDPR
    phone?: string;
    phone_hash?: string; // Ethereum-style hash for GDPR

    // Property Details
    address?: string;
    property_type?: string;
    budget?: number;
    timeline?: string;

    // Lead Scoring & Status
    score: number; // 0.0 to 1.0
    status: LeadStatus;

    // Blockchain & Compliance
    blockchain_tx_hash?: string; // Ethereum transaction hash
    gdpr_consent: boolean;
    gdpr_consent_date?: Date;

    // Ownership & Assignment
    assigned_to?: string; // User UUID
    source?: LeadSource;

    // Additional Data
    notes?: string;
    metadata?: Record<string, any>; // JSONB flexible data

    // Timestamps
    created_at: Date;
    updated_at: Date;
    last_contacted_at?: Date;
}

/**
 * Interface for creating a new lead
 */
export interface CreateLeadDTO {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    property_type?: string;
    budget?: number;
    timeline?: string;
    assigned_to?: string;
    source?: LeadSource;
    notes?: string;
    gdpr_consent?: boolean;
    metadata?: Record<string, any>;
}

/**
 * Interface for updating a lead
 */
export interface UpdateLeadDTO {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    property_type?: string;
    budget?: number;
    timeline?: string;
    score?: number;
    status?: LeadStatus;
    assigned_to?: string;
    source?: LeadSource;
    notes?: string;
    gdpr_consent?: boolean;
    blockchain_tx_hash?: string;
    metadata?: Record<string, any>;
    last_contacted_at?: Date;
}

/**
 * Interface for lead query filters
 */
export interface LeadQueryFilters {
    status?: LeadStatus | LeadStatus[];
    min_score?: number; // e.g., 0.8 for high-value leads
    max_score?: number;
    assigned_to?: string;
    source?: LeadSource;
    created_after?: Date;
    created_before?: Date;
    has_phone?: boolean;
    has_email?: boolean;
    search?: string; // Search in name, email, phone
}

/**
 * Interface for lead with related data
 */
export interface LeadWithDetails extends Lead {
    agent?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    total_calls?: number;
    last_call_date?: Date;
    avg_call_duration?: number;
    avg_sentiment?: number;
}

/**
 * Interface for lead scoring factors
 */
export interface LeadScoringFactors {
    has_email: boolean;
    has_phone: boolean;
    has_budget: boolean;
    has_timeline: boolean;
    has_property_type: boolean;
    engagement_score?: number; // Based on calls, responses
    sentiment_score?: number; // From call analysis
    recency_score?: number; // How recent the lead is
}

/**
 * Interface for lead scoring history
 */
export interface LeadScoringHistory {
    id: string;
    lead_id: string;
    previous_score: number;
    new_score: number;
    score_factors?: LeadScoringFactors;
    changed_by: 'ai' | 'manual' | 'call_outcome';
    created_at: Date;
}

/**
 * GDPR Compliance utilities
 */
export interface GDPRHashData {
    email_hash?: string;
    phone_hash?: string;
    blockchain_tx_hash?: string;
}

/**
 * Type guard to check if a lead has valid contact information
 */
export function hasContactInfo(lead: Lead): boolean {
    return !!(lead.email || lead.phone);
}

/**
 * Type guard to check if a lead is high-value (score > 0.8)
 */
export function isHighValueLead(lead: Lead): boolean {
    return lead.score > 0.8;
}

/**
 * Type guard to check if a lead is active
 */
export function isActiveLead(lead: Lead): boolean {
    return ![LeadStatus.CLOSED_WON, LeadStatus.CLOSED_LOST, LeadStatus.UNQUALIFIED].includes(lead.status);
}

/**
 * Helper to calculate lead quality tier
 */
export enum LeadQualityTier {
    HOT = 'hot', // score > 0.8
    WARM = 'warm', // score 0.5 - 0.8
    COLD = 'cold', // score < 0.5
}

export function getLeadQualityTier(score: number): LeadQualityTier {
    if (score > 0.8) return LeadQualityTier.HOT;
    if (score >= 0.5) return LeadQualityTier.WARM;
    return LeadQualityTier.COLD;
}

/**
 * Response type for paginated leads
 */
export interface PaginatedLeadsResponse {
    data: Lead[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
