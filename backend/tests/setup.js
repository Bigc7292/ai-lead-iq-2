// Load environment variables for tests
require('dotenv').config({ path: '.env.example' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-12345678901234567890';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Mock console methods to reduce test output noise
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);
