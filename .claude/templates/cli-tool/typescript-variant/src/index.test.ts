/**
 * CLI Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { logger } from './core/logger';

describe('Logger', () => {
  it('logs info messages', () => {
    const spy = vi.spyOn(console, 'log');

    logger.info('Test message');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs success messages', () => {
    const spy = vi.spyOn(console, 'log');

    logger.success('Success!');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs error messages', () => {
    const spy = vi.spyOn(console, 'error');

    logger.error('Error occurred');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Configuration', () => {
  it('loads default config', async () => {
    const { loadConfig } = await import('./core/config.js');
    const config = loadConfig();

    expect(config).toHaveProperty('logLevel');
    expect(config).toHaveProperty('dataDir');
  });
});
