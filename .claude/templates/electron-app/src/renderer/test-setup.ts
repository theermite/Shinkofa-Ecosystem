/**
 * Test Setup
 * Vitest configuration and global mocks
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.api globally (can be overridden in individual tests)
(global as any).window = {
  ...(global as any).window,
  api: {
    invoke: () => Promise.resolve({ success: true, data: [] }),
    send: () => {},
    on: () => {},
  },
};
