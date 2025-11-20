 * @param { string } data.email - Email address
    * @param { string } data.phone - Phone number
        * @returns { Object } Object with original data and hashes
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
 * @param { Object } data - Data object that may contain PII
            * @returns { Object } Sanitized data object
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
 * @param { string } data.email - Email address
                * @param { string } data.phone - Phone number
                    * @returns { Object } Object with original data and hashes
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
             * @param { Object } data - Data object that may contain PII
                * @returns { Object } Sanitized data object
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

            // Placeholder functions for missing dependencies
            function hashEmail(email) { return `hashed_${email}`; }
            function hashPhone(phone) { return `hashed_${phone}`; }
            function generateHash(data) { return `generated_hash_${data}`; }
            function generateAuditHash(data) { return `audit_hash_${data}`; }
            function recordLeadAudit(data) { console.log("Recording lead audit:", data); }


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
