import { describe, expect, it } from 'vitest';

import { ensureTimeAlignment, formatTimeInZone, parseDateTime } from '../../src/domain/time';

const SLOT_INTERVAL = 60;

describe('time utilities', () => {
  it('parses date and time in Warsaw timezone', () => {
    const date = parseDateTime('2024-04-10', '12:00', 'Europe/Warsaw', SLOT_INTERVAL);
    const formatted = formatTimeInZone(date, 'Europe/Warsaw');

    expect(formatted).toBe('12:00');
  });

  it('throws when time is not aligned to interval', () => {
    expect(() => ensureTimeAlignment('12:30', SLOT_INTERVAL)).toThrow(/60-minute/);
  });
});
