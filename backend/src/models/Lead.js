/**
 * Lead Model
 * Represents a real estate lead in the system
 */

class Lead {
    constructor(data) {
        this.id = data.id || null;
        this.firstName = data.firstName || data.first_name || '';
        this.lastName = data.lastName || data.last_name || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.address = data.address || '';
        this.propertyType = data.propertyType || data.property_type || '';
        this.budget = data.budget || null;
        this.timeline = data.timeline || '';
        this.score = data.score || 0;
        this.status = data.status || 'new'; // new, contacted, qualified, unqualified
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
        this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
    }

    // Convert to database format (snake_case)
    toDatabase() {
        return {
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            phone: this.phone,
            address: this.address,
            property_type: this.propertyType,
            budget: this.budget,
            timeline: this.timeline,
            score: this.score,
            status: this.status,
            notes: this.notes,
            updated_at: new Date().toISOString()
        };
    }

    // Validate lead data
    validate() {
        const errors = [];

        if (!this.firstName) errors.push('First name is required');
        if (!this.lastName) errors.push('Last name is required');
        if (!this.phone && !this.email) errors.push('Phone or email is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Get full name
    getFullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}

module.exports = Lead;
