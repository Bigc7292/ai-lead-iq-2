/**
 * Call Log Model - TypeScript Interfaces and Types
 * Defines the structure for call logs and voice interactions
 */

/**
 * Call direction enum
 */
export enum CallDirection {
    INBOUND = 'inbound',
    OUTBOUND = 'outbound',
}

/**
 * Call sentiment enum
 */
export enum CallSentiment {
    POSITIVE = 'positive',
    NEUTRAL = 'neutral',
    NEGATIVE = 'negative',
    MIXED = 'mixed',
}

/**
 * Call outcome enum
 */
export enum CallOutcome {
    SUCCESSFUL = 'successful',
    NO_ANSWER = 'no_answer',
    VOICEMAIL = 'voicemail',
    BUSY = 'busy',
    FAILED = 'failed',
    CALLBACK_REQUESTED = 'callback_requested',
}

/**
 * Main CallLog interface
 */
export interface CallLog {
    // IDs
    id: string;
    lead_id: string;
    agent_id?: string;
    minimax_session_id?: string;

    // Call details
    direction: CallDirection;
    duration?: number;
    started_at?: Date;
    ended_at?: Date;

    // Transcript & Analysis
    transcript?: string;
    summary?: string;
    sentiment?: CallSentiment;
    sentiment_score?: number; // -1.0 to 1.0 or 0.0 to 1.0 depending on implementation

    // Outcomes
    outcome?: CallOutcome;
    follow_up_required?: boolean;
    follow_up_date?: Date;

    // Quality & Cost
    call_quality_score?: number; // 0.0 to 1.0
    cost?: number; // Call cost in USD

    // Audio & Media
    recording_url?: string;
    recording_duration?: number;

    // Metadata
    metadata?: Record<string, any>; // JSONB flexible data

    // Timestamps
    created_at: Date;
}

/**
 * Interface for call log with related data
 */
export interface CallLogWithDetails extends CallLog {
    lead?: {
        id: string;
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
        score: number;
        status: string;
    };
    agent?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email: string;
    };
}

/**
 * Interface for call analytics
 */
export interface CallAnalytics {
    total_calls: number;
    total_duration: number; // in seconds
    avg_duration: number;
    avg_sentiment_score: number;
    outcome_breakdown: Record<CallOutcome, number>;
    sentiment_breakdown: Record<CallSentiment, number>;
    total_cost: number;
    avg_call_quality: number;
    successful_calls: number;
    follow_ups_required: number;
}

/**
 * Interface for call query filters
 */
export interface CallLogQueryFilters {
    lead_id?: string;
    agent_id?: string;
    outcome?: CallOutcome | CallOutcome[];
    sentiment?: CallSentiment | CallSentiment[];
    min_duration?: number;
    max_duration?: number;
    direction?: CallDirection;
    follow_up_required?: boolean;
    created_after?: Date;
    created_before?: Date;
    has_recording?: boolean;
    min_quality_score?: number;
}

/**
 * Type guard to check if call was successful
 */
export function wasCallSuccessful(callLog: CallLog): boolean {
    return callLog.outcome === CallOutcome.SUCCESSFUL;
}

/**
 * Type guard to check if call needs follow-up
 */
export function needsFollowUp(callLog: CallLog): boolean {
    return !!callLog.follow_up_required && (!callLog.follow_up_date || callLog.follow_up_date <= new Date());
}

/**
 * Helper to determine call effectiveness tier
 */
export enum CallEffectivenessTier {
    HIGH = 'high', // positive sentiment, successful outcome
    MEDIUM = 'medium', // neutral sentiment or mixed outcome
    LOW = 'low', // negative sentiment or failed outcome
}

export function getCallEffectivenessTier(callLog: CallLog): CallEffectivenessTier {
    if (callLog.outcome === CallOutcome.SUCCESSFUL && callLog.sentiment === CallSentiment.POSITIVE) {
        return CallEffectivenessTier.HIGH;
    }
    if (callLog.outcome === CallOutcome.FAILED || callLog.sentiment === CallSentiment.NEGATIVE) {
        return CallEffectivenessTier.LOW;
    }
    return CallEffectivenessTier.MEDIUM;
}

/**
 * Response type for paginated call logs
 */
export interface PaginatedCallLogsResponse {
    data: CallLog[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
