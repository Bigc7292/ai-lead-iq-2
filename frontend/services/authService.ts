/**
 * Authentication Service
 * Handles user authentication, token management, and auto-login for development
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
    id: number;
    email: string;
    role: string;
    name?: string;
}

/**
 * Initialize authentication
 * Auto-logs in for development if no token exists
 */
export const init = () => {
    if (!isAuthenticated()) {
        console.log('🔐 Auto-authenticating for development...');
        // Auto-login with development token
        const devToken = 'DEV_TEST_TOKEN';
        const devUser: AuthUser = {
            id: 1,
            email: 'dev@ai-lead-iq.com',
            name: 'Development User',
            role: 'admin'
        };

        setToken(devToken);
        setUser(devUser);
        console.log('✅ Development user authenticated');
    }
};

/**
 * Login user (simplified for development)
 * In production, this would call an auth API endpoint
 */
export const login = async (email: string, password?: string) => {
    // Simplified development login
    const user: AuthUser = {
        id: email === 'admin@ai-lead-iq.com' ? 1 : 2,
        email,
        name: email.split('@')[0],
        role: email === 'admin@ai-lead-iq.com' ? 'admin' : 'user'
    };

    const token = 'DEV_TEST_TOKEN';
    setToken(token);
    setUser(user);

    return { user, token };
};

/**
 * Log out user
 */
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Get stored auth token
 */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set auth token in storage
 */
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get stored user info
 */
export const getUser = (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr) as AuthUser;
    } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
    }
};

/**
 * Set user info in storage
 */
export const setUser = (user: AuthUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

const authService = {
    init,
    login,
    logout,
    getToken,
    setToken,
    getUser,
    setUser,
    isAuthenticated
};

export default authService;
