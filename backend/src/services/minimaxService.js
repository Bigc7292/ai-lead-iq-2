const axios = require('axios');

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    console.warn('⚠️  Warning: MiniMax credentials not configured. Set MINIMAX_API_KEY and MINIMAX_GROUP_ID in .env file.');
}

/**
 * MiniMax Service
 * Handles Text-to-Speech and Speech-to-Text operations
 * Uses the speech-02-turbo model for low latency
 */

const minimaxService = {
    /**
     * Convert text to speech using MiniMax TTS
     * @param {string} text - The text to convert to speech
     * @param {object} options - Optional configuration
     * @returns {Promise<Buffer>} Audio buffer
     */
    async textToSpeech(text, options = {}) {
        if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
            throw new Error('MiniMax API credentials not configured');
        }

        try {
            const response = await axios.post(
                `${MINIMAX_BASE_URL}/text_to_speech`,
                {
                    model: 'speech-02-turbo',
                    text: text,
                    voice_id: options.voiceId || 'default',
                    speed: options.speed || 1.0,
                    vol: options.volume || 1.0,
                    pitch: options.pitch || 0,
                    audio_sample_rate: options.sampleRate || 24000,
                    bitrate: options.bitrate || 128000,
                    format: options.format || 'mp3'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                        'Content-Type': 'application/json',
                        'GroupId': MINIMAX_GROUP_ID
                    },
                    responseType: 'arraybuffer'
                }
            );

            return Buffer.from(response.data);
        } catch (error) {
            console.error('MiniMax TTS Error:', error.response?.data || error.message);
            throw new Error(`Failed to generate speech: ${error.message}`);
        }
    },

    /**
     * Convert speech to text using MiniMax STT
     * @param {Buffer} audioBuffer - Audio data
     * @param {object} options - Optional configuration
     * @returns {Promise<string>} Transcribed text
     */
    async speechToText(audioBuffer, options = {}) {
        if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
            throw new Error('MiniMax API credentials not configured');
        }

        try {
            const FormData = require('form-data');
            const form = new FormData();

            form.append('model', 'speech-02-turbo');
            form.append('file', audioBuffer, {
                filename: 'audio.wav',
                contentType: 'audio/wav'
            });

            if (options.language) {
                form.append('language', options.language);
            }

            const response = await axios.post(
                `${MINIMAX_BASE_URL}/speech_to_text`,
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                        'GroupId': MINIMAX_GROUP_ID
                    }
                }
            );

            return response.data.text || '';
        } catch (error) {
            console.error('MiniMax STT Error:', error.response?.data || error.message);
            throw new Error(`Failed to transcribe speech: ${error.message}`);
        }
    },

    /**
     * Generate conversational audio response
     * This will be expanded in Sprint 2 to handle full conversations
     * @param {string} message - The message to speak
     * @param {object} context - Conversation context
     * @returns {Promise<Buffer>} Audio response
     */
    async generateConversationAudio(message, context = {}) {
        // For now, just use TTS
        // In Sprint 2, this will integrate with conversation management
        return await this.textToSpeech(message, {
            voiceId: context.voiceId || 'professional_female',
            speed: 1.1, // Slightly faster for natural conversation
            ...context.ttsOptions
        });
    }
};

module.exports = minimaxService;
