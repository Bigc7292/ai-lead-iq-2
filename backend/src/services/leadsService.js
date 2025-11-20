const supabase = require('./supabaseClient');
const Lead = require('../models/Lead');

/**
 * Leads Service
 * Handles all database operations for leads
 */

const LEADS_TABLE = 'leads';

const leadsService = {
    /**
     * Get all leads
     */
    async getAllLeads() {
        if (!supabase) {
            throw new Error('Supabase client not initialized. Please configure your environment variables.');
        }

        const { data, error } = await supabase
            .from(LEADS_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(lead => new Lead(lead));
    },

    /**
     * Get lead by ID
     */
    async getLeadById(id) {
        if (!supabase) {
            throw new Error('Supabase client not initialized. Please configure your environment variables.');
        }

        const { data, error } = await supabase
            .from(LEADS_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return new Lead(data);
    },

    /**
     * Create new lead
     */
    async createLead(leadData) {
        if (!supabase) {
            throw new Error('Supabase client not initialized. Please configure your environment variables.');
        }

        const lead = new Lead(leadData);
        const validation = lead.validate();

        if (!validation.isValid) {
            const error = new Error('Validation failed');
            error.status = 400;
            error.details = validation.errors;
            throw error;
        }

        const { data, error } = await supabase
            .from(LEADS_TABLE)
            .insert([lead.toDatabase()])
            .select()
            .single();

        if (error) throw error;
        return new Lead(data);
    },

    /**
     * Update lead
     */
    async updateLead(id, updates) {
        if (!supabase) {
            throw new Error('Supabase client not initialized. Please configure your environment variables.');
        }

        const lead = new Lead({ id, ...updates });
        const dbData = lead.toDatabase();

        const { data, error } = await supabase
            .from(LEADS_TABLE)
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return new Lead(data);
    },

    /**
     * Update lead score
     */
    async updateLeadScore(id, score) {
        if (!supabase) {
            throw new Error('Supabase client not initialized. Please configure your environment variables.');
        }

        const { data, error } = await supabase
            .from(LEADS_TABLE)
            .update({ score, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return new Lead(data);
    },

    /**
     * Delete lead
     */
    async deleteLead(id) {
        if (!supabase) {
            throw new Error('Supabase client not initialized. Please configure your environment variables.');
        }

        const { error } = await supabase
            .from(LEADS_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

module.exports = leadsService;
