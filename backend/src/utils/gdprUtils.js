/**
 * GDPR Utilities for AI Lead IQ
 * Handles PII hashing, sanitization, and compliance
 */

const crypto = require('crypto');

/**
 * Hash email for GDPR compliance using SHA-256
 * @param {string} email - Email to hash
 * @returns {string} Hashed email
 */
function hashEmail(email) {
    if (!email) return null;
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Hash phone number for GDPR compliance using SHA-256
 * @param {string} phone - Phone number to hash
 * @returns {string} Hashed phone
 */
function hashPhone(phone) {
    if (!phone) return null;
    // Remove all non-numeric characters for consistent hashing
    const normalized = phone.replace(/\D/g, '');
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate a general hash for any data
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
function generateHash(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(String(data)).digest('hex');
}

/**
 * Generate audit trail hash for data integrity
 * @param {Object} data - Data object to hash
 * @returns {string} Audit hash
 */
function generateAuditHash(data) {
    const serialized = JSON.stringify(data);
    return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Generate GDPR-compliant hashes for lead data
 * @param {Object} data - Data object
 * @param {string} data.email - Email address
 * @param {string} data.phone - Phone number
 * @returns {Object} Object with original data and hashes
 */
function generateGDPRHashes(data) {
    const result = {};

    if (data.email) {
        result.email = data.email;
        result.email_hash = hashEmail(data.email);
    }

    if (data.phone) {
        result.phone = data.phone;
        result.phone_hash = hashPhone(data.phone);
    }

    return result;
}

/**
 * Sanitize PII fields in a data object
 * @param {Object} data - Data object that may contain PII
 * @returns {Object} Sanitized data object
 */
function sanitizePII(data) {
    const sanitized = { ...data };

    // Fields to sanitize
    const piiFields = ['email', 'phone', 'address', 'transcript'];

    piiFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***REDACTED***';
        }
    });

    return sanitized;
}

/**
 * Verify GDPR consent before processing PII
 * 
 * @param {Object} lead - Lead object
 * @returns {boolean} True if consent is valid
 */
function hasValidGDPRConsent(lead) {
    return lead.gdpr_consent === true && lead.gdpr_consent_date != null;
}

/**
 * Check if data retention period has expired
 * GDPR requires data deletion after retention period (typically 2 years)
 * 
 * @param {Date} createdAt - Record creation date
 * @param {number} retentionYears - Retention period in years (default 2)
 * @returns {boolean} True if retention period has expired
 */
function isDataRetentionExpired(createdAt, retentionYears = 2) {
    const retentionMs = retentionYears * 365 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(createdAt.getTime() + retentionMs);
    return new Date() > expirationDate;
}

/**
 * Create GDPR consent record
 * 
 * @returns {Object} GDPR consent data
 */
function createGDPRConsent() {
    return {
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString(),
    };
}

/**
 * GDPR-compliant lead data processor
 * Adds hashes and prepares data for storage
 * 
 * @param {Object} leadData - Raw lead data
 * @returns {Object} Processed lead data with GDPR compliance
 */
function processLeadForGDPR(leadData) {
    const processed = { ...leadData };

    // Generate hashes for PII
    if (leadData.email) {
        processed.email_hash = hashEmail(leadData.email);
    }

    if (leadData.phone) {
        processed.phone_hash = hashPhone(leadData.phone);
    }

    // Add consent if not present
    if (!processed.gdpr_consent) {
        const consent = createGDPRConsent();
        processed.gdpr_consent = consent.gdpr_consent;
        processed.gdpr_consent_date = consent.gdpr_consent_date;
    }

    return processed;
}

/**
 * Record lead audit for compliance tracking
 * @param {Object} data - Audit data
 */
function recordLeadAudit(data) {
    console.log('Recording lead audit:', {
        timestamp: new Date().toISOString(),
        action: data.action,
        userId: data.userId,
        leadId: data.leadId,
        hash: generateAuditHash(data),
    });
}

module.exports = {
    generateHash,
    hashEmail,
    hashPhone,
    generateGDPRHashes,
    generateAuditHash,
    sanitizePII,
    hasValidGDPRConsent,
    isDataRetentionExpired,
    createGDPRConsent,
    processLeadForGDPR,
    recordLeadAudit,
};
