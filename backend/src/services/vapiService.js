const supabase = require('../config/supabaseClient');
const { Vapi } = require('@vapi-ai/server-sdk');

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;

if (!VAPI_API_KEY) {
    console.warn('⚠️  Warning: VAPI_API_KEY not configured. Set it in .env file.');
}

// Initialize Vapi SDK
const vapi = VAPI_API_KEY ? new Vapi({ token: VAPI_API_KEY }) : null;

/**
 * Vapi Service
 * Handles integration with Vapi AI platform for voice calls
 * Documentation: https://docs.vapi.ai/
 */
const vapiService = {
    /**
     * Handle call started event
     * Log when a call begins
     */
    async handleCallStarted(call) {
        try {
            console.log(`📞 Call started: ${call.id}`);

            // Optionally create initial call log entry
            const { data, error } = await supabase
                .from('call_logs')
                .insert({
                    vapi_call_id: call.id,
                    vapi_session_id: call.sessionId || null,
                    vapi_assistant_id: call.assistantId,
                    call_type: call.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound',
                    call_started_at: new Date(call.startedAt),
                    created_at: new Date()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating initial call log:', error);
            }

            return data;
        } catch (error) {
            console.error('Error in handleCallStarted:', error);
            throw error;
        }
    },

    /**
     * Handle call ended event
     * Save complete call data including transcript and structured outputs
     */
    async handleCallEnded(message) {
        try {
            const call = message.call;
            const endedReason = message.endedReason;

            console.log(`✅ Call ended: ${call.id}, Reason: ${endedReason}`);

            // Extract structured data from analysis
            const structuredData = call.analysis?.structuredData || {};

            // Determine outcome based on structured data and conversation
            const outcome = this.determineOutcome(structuredData, call);

            // Calculate duration in seconds
            const duration = call.endedAt && call.startedAt
                ? Math.floor((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)
                : null;

            // Find or create lead
            let leadId = null;
            if (structuredData.phone_number || structuredData.email) {
                leadId = await this.findOrCreateLead(structuredData);
            }

            // Build call log entry
            const callLog = {
                vapi_call_id: call.id,
                vapi_session_id: call.sessionId || null,
                vapi_assistant_id: call.assistantId,
                lead_id: leadId,
                call_type: call.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound',
                transcript: call.transcript || call.messages?.map(m => `${m.role}: ${m.message}`).join('\n'),
                duration,
                outcome,
                call_started_at: call.startedAt ? new Date(call.startedAt) : null,
                call_ended_at: call.endedAt ? new Date(call.endedAt) : null,
                recording_url: call.recordingUrl || null,
                cost: call.cost || null,
                metadata: {
                    endedReason,
                    structuredData,
                    analysis: call.analysis
                },
                created_at: new Date()
            };

            // Upsert call log (update if exists from call-started, otherwise insert)
            const { data, error } = await supabase
                .from('call_logs')
                .upsert(callLog, {
                    onConflict: 'vapi_call_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving call log:', error);
                throw error;
            }

            console.log(`💾 Call log saved: ${data.id}`);

            return data;
        } catch (error) {
            console.error('Error in handleCallEnded:', error);
            throw error;
        }
    },

    /**
     * Handle real-time transcript updates
     */
    async handleTranscriptUpdate(message) {
        try {
            // Real-time transcript processing can be added here
            console.log('📝 Transcript update:', message.transcript?.text);

            // Optionally store in separate transcripts table or update call log
            return true;
        } catch (error) {
            console.error('Error in handleTranscriptUpdate:', error);
            throw error;
        }
    },

    /**
     * Handle function/tool calls from assistant
     * Example: Book appointment, send email, check availability
     */
    async handleFunctionCall(message) {
        try {
            const functionCall = message.functionCall;
            console.log(`🔧 Function call: ${functionCall.name}`, functionCall.parameters);

            // Example function implementations
            switch (functionCall.name) {
                case 'bookAppointment':
                    return await this.bookAppointment(functionCall.parameters);

                case 'checkAvailability':
                    return await this.checkPropertyAvailability(functionCall.parameters);

                case 'sendPropertyDetails':
                    return await this.sendPropertyDetails(functionCall.parameters);

                default:
                    console.warn(`Unknown function: ${functionCall.name}`);
                    return { success: false, message: 'Function not implemented' };
            }
        } catch (error) {
            console.error('Error in handleFunctionCall:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get dynamic assistant configuration for specific call
     */
    async getAssistantConfig(message) {
        try {
            // Return customized assistant config based on call context
            // Example: Different prompts for different lead sources
            return {
                model: {
                    provider: 'openai',
                    model: 'gpt-4o'
                },
                firstMessage: 'Hello! Thank you for your interest in Dubai properties.',
                voice: {
                    provider: 'vapi',
                    voiceId: 'elliot'
                }
            };
        } catch (error) {
            console.error('Error in getAssistantConfig:', error);
            throw error;
        }
    },

    /**
     * Create outbound call via Vapi SDK
     */
    async createOutboundCall(leadId, phoneNumber, assistantId = VAPI_ASSISTANT_ID) {
        try {
            if (!vapi) {
                throw new Error('Vapi SDK not initialized. Check VAPI_API_KEY configuration.');
            }

            console.log(`📱 Creating outbound call to ${phoneNumber}`);

            const call = await vapi.calls.create({
                assistantId,
                phoneNumberId: VAPI_PHONE_NUMBER_ID,
                customer: {
                    number: phoneNumber
                }
            });

            console.log(`✅ Outbound call created: ${call.id}`);

            // Log call initiation
            if (leadId) {
                await supabase
                    .from('call_logs')
                    .insert({
                        lead_id: leadId,
                        vapi_call_id: call.id,
                        vapi_assistant_id: assistantId,
                        call_type: 'Outbound',
                        created_at: new Date()
                    });
            }

            return call;
        } catch (error) {
            console.error('Error creating outbound call:', error);
            throw error;
        }
    },

    /**
     * Find existing lead or create new one from structured data
     */
    async findOrCreateLead(structuredData) {
        try {
            const { phone_number, email, lead_name, property_type, budget_range_aed, preferred_locations, timeline, purpose, lead_score } = structuredData;

            // Try to find existing lead by phone or email
            let lead = null;

            if (phone_number) {
                const { data } = await supabase
                    .from('leads')
                    .select('id')
                    .eq('phone', phone_number)
                    .single();
                lead = data;
            }

            if (!lead && email) {
                const { data } = await supabase
                    .from('leads')
                    .select('id')
                    .eq('email', email)
                    .single();
                lead = data;
            }

            // If lead exists, update it
            if (lead) {
                await supabase
                    .from('leads')
                    .update({
                        score: lead_score ? lead_score / 100 : null, // Convert 0-100 to 0-1
                        notes: `Property interest: ${property_type}, Budget: ${budget_range_aed}, Locations: ${preferred_locations?.join(', ')}`,
                        metadata: structuredData,
                        updated_at: new Date()
                    })
                    .eq('id', lead.id);

                return lead.id;
            }

            // Create new lead
            const nameParts = (lead_name || 'Unknown').split(' ');
            const firstName = nameParts[0] || 'Unknown';
            const lastName = nameParts.slice(1).join(' ') || '';

            const { data: newLead, error } = await supabase
                .from('leads')
                .insert({
                    first_name: firstName,
                    last_name: lastName,
                    email: email || `${phone_number}@temp.com`,
                    phone: phone_number || 'Unknown',
                    company: 'Dubai Property Inquiry',
                    title: 'Property Buyer',
                    source: 'Vapi Voice Call',
                    status: 'Contacted',
                    priority: lead_score > 70 ? 'High' : lead_score > 40 ? 'Medium' : 'Low',
                    score: lead_score ? lead_score / 100 : 0.5,
                    notes: `Property interest: ${property_type}, Budget: ${budget_range_aed}, Locations: ${preferred_locations?.join(', ')}, Timeline: ${timeline}, Purpose: ${purpose}`,
                    metadata: structuredData,
                    created_at: new Date()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating lead:', error);
                throw error;
            }

            console.log(`👤 Lead created: ${newLead.id}`);
            return newLead.id;

        } catch (error) {
            console.error('Error in findOrCreateLead:', error);
            return null;
        }
    },

    /**
     * Determine call outcome based on structured data and conversation
     */
    determineOutcome(structuredData, call) {
        if (structuredData.appointment_requested) {
            return 'Meeting Booked';
        }

        if (structuredData.lead_score > 70) {
            return 'Interested';
        }

        if (structuredData.lead_score < 30) {
            return 'Not Interested';
        }

        if (call?.endedReason === 'customer-busy') {
            return 'Callback Requested';
        }

        return 'Follow-up Required';
    },

    /**
     * Example function implementations
     */
    async bookAppointment(params) {
        // Implement appointment booking logic
        console.log('Booking appointment:', params);
        return { success: true, appointmentId: 'apt_123', message: 'Appointment booked successfully' };
    },

    async checkPropertyAvailability(params) {
        // Check property availability in your system
        console.log('Checking availability:', params);
        return { available: true, properties: [] };
    },

    async sendPropertyDetails(params) {
        // Send property details via email/SMS
        console.log('Sending property details:', params);
        return { success: true, message: 'Details sent' };
    }
};

module.exports = vapiService;
