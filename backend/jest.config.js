module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/**/*.test.{js,jsx}',
        '!src/server.js', // Entry point, not testable logic
        '!src/workers/**', // Workers are tested differently
    ],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
        },
    },
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
    testMatch: [
        '**/tests/**/*.test.js',
    ],
    moduleFileExtensions: ['js', 'json'],
    testTimeout: 10000, // 10 seconds
};
