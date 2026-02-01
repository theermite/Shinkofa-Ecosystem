/**
 * Test Setup
 * © 2025 La Voie Shinkofa
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock console for cleaner test output
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress expected test errors
  if (args[0]?.includes?.('test') || args[0]?.includes?.('mock')) {
    return;
  }
  originalConsoleError(...args);
};
