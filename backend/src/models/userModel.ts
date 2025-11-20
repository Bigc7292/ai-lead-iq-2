/**
 * User Model - TypeScript Interfaces and Types
 * Defines the structure for user authentication and profiles
 */

/**
 * User role enum
 */
export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    AGENT = 'agent',
}

/**
 * Core User interface
 */
export interface User {
    id: string; // UUID
    email: string;
    email_hash?: string; // Ethereum-style hash for GDPR
    role: UserRole;
    first_name?: string;
    last_name?: string;
    phone?: string;
    phone_hash?: string; // Ethereum-style hash for GDPR
    is_active: boolean;
    last_login_at?: Date;
    created_at: Date;
    updated_at: Date;
}

/**
 * Interface for creating a new user
 */
export interface CreateUserDTO {
    email: string;
    role?: UserRole;
    first_name?: string;
    last_name?: string;
    phone?: string;
    is_active?: boolean;
}

/**
 * Interface for updating a user
 */
export interface UpdateUserDTO {
    email?: string;
    role?: UserRole;
    first_name?: string;
    last_name?: string;
    phone?: string;
    is_active?: boolean;
}

/**
 * User with statistics
 */
export interface UserWithStats extends User {
    total_leads?: number;
    active_leads?: number;
    total_calls?: number;
    avg_lead_score?: number;
    conversion_rate?: number; // Percentage of leads closed won
}

/**
 * Type guard to check if user is admin
 */
export function isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
}

/**
 * Type guard to check if user is manager or admin
 */
export function canManageLeads(user: User): boolean {
    return [UserRole.ADMIN, UserRole.MANAGER].includes(user.role);
}
