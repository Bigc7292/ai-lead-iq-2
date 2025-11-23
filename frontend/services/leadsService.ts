import apiClient from './apiClient';
import { Lead, LeadStatus, LeadPriority } from '../types';

/**
 * Backend API Lead Interface
 */
export interface ApiLead {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    property_type: string | null;
    budget: number | null;
    timeline: string | null;
    score: number; // 0.0 to 1.0
    status: string;
    blockchain_tx_hash: string | null;
    gdpr_consent: boolean;
    gdpr_consent_date: string | null;
    assigned_to: string | null;
    source: string | null;
    notes: string | null;
    metadata: any;
    created_at: string;
    updated_at: string;
    last_contacted_at: string | null;
}

/**
 * API Response Format
 */
interface ApiResponse<T> {
    data: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        total_pages?: number;
        score_avg?: number;
        ai_scored?: boolean;
    };
}

/**
 * Transform backend API lead to frontend Lead type
 */
export function transformApiLead(apiLead: ApiLead): Lead {
    // Map backend status to frontend enum
    const statusMap: Record<string, LeadStatus> = {
        'new': LeadStatus.NEW,
        'contacted': LeadStatus.CONTACTED,
        'qualified': LeadStatus.QUALIFIED,
        'interested': LeadStatus.INTERESTED,
        'converted': LeadStatus.CONVERTED,
        'closed_won': LeadStatus.CONVERTED,
        'not_interested': LeadStatus.NOT_INTERESTED,
        'closed_lost': LeadStatus.NOT_INTERESTED,
    };

    // Determine priority based on score
    const getPriority = (score: number): LeadPriority => {
        if (score >= 0.8) return 'High';
        if (score >= 0.5) return 'Medium';
        return 'Low';
    };

    return {
        id: parseInt(apiLead.id.replace(/-/g, '').substring(0, 15), 16), // Convert UUID to number for frontend
        name: `${apiLead.first_name} ${apiLead.last_name}`.trim(),
        company: apiLead.metadata?.company || apiLead.property_type || 'Real Estate Lead',
        email: apiLead.email || '',
        phone: apiLead.phone || '',
        position: apiLead.metadata?.position || 'Property Seeker',
        industry: apiLead.metadata?.industry || 'Real Estate',
        status: statusMap[apiLead.status] || LeadStatus.NEW,
        priority: getPriority(apiLead.score),
        source: apiLead.source || 'Unknown',
        notes: apiLead.notes || '',
        aiScore: Math.round(apiLead.score * 100), // Convert 0.0-1.0 to 0-100
        lastContacted: apiLead.last_contacted_at || apiLead.updated_at || apiLead.created_at,
        avatarUrl: `https://i.pravatar.cc/150?u=${apiLead.id}`, // Generate avatar from ID
    };
}

const leadsService = {
    /**
     * Get all leads with optional filtering
     */
    async getLeads(filters?: {
        status?: string;
        min_score?: number;
        max_score?: number;
        page?: number;
        limit?: number;
    }): Promise<{ leads: Lead[]; meta: any }> {
        try {
            const params = new URLSearchParams();

            if (filters?.status) params.append('status', filters.status);
            if (filters?.min_score !== undefined) params.append('min_score', filters.min_score.toString());
            if (filters?.max_score !== undefined) params.append('max_score', filters.max_score.toString());
            if (filters?.page) params.append('page', filters.page.toString());
            if (filters?.limit) params.append('limit', filters.limit.toString());

            const response = await apiClient.get<ApiResponse<ApiLead[]>>(`/leads?${params.toString()}`);

            const leads = response.data.data.map(transformApiLead);

            return {
                leads,
                meta: response.data.meta || {},
            };
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            throw error;
        }
    },

    /**
     * Get single lead by ID
     */
    async getLeadById(id: string): Promise<Lead | null> {
        try {
            const response = await apiClient.get<ApiResponse<ApiLead>>(`/leads/${id}`);
            return transformApiLead(response.data.data);
        } catch (error) {
            console.error(`Failed to fetch lead ${id}:`, error);
            return null;
        }
    },

    /**
     * Create new lead
     */
    async createLead(leadData: Partial<ApiLead>): Promise<Lead> {
        try {
            const response = await apiClient.post<ApiResponse<ApiLead>>('/leads', leadData);
            return transformApiLead(response.data.data);
        } catch (error) {
            console.error('Failed to create lead:', error);
            throw error;
        }
    },

    /**
     * Update existing lead
     */
    async updateLead(id: string, updates: Partial<ApiLead>): Promise<Lead> {
        try {
            const response = await apiClient.put<ApiResponse<ApiLead>>(`/leads/${id}`, updates);
            return transformApiLead(response.data.data);
        } catch (error) {
            console.error(`Failed to update lead ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete lead
     */
    async deleteLead(id: string): Promise<void> {
        try {
            await apiClient.delete(`/leads/${id}`);
        } catch (error) {
            console.error(`Failed to delete lead ${id}:`, error);
            throw error;
        }
    },
};

export default leadsService;
