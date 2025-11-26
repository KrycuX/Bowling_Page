import { SlotStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { buildAvailabilityGrid } from '../../src/domain/availability';
import { getDayStart } from '../../src/domain/time';

describe('buildAvailabilityGrid', () => {
  it('merges statuses across interval timeline', () => {
    const dayStart = getDayStart('2024-04-10', 'Europe/Warsaw');

    const reservations = [
      {
        startTime: new Date(dayStart.getTime() + 10 * 60 * 60 * 1000 + 15 * 60 * 1000),
        endTime: new Date(dayStart.getTime() + 12 * 60 * 60 * 1000 + 15 * 60 * 1000),
        status: SlotStatus.HOLD
      },
      {
        startTime: new Date(dayStart.getTime() + 13 * 60 * 60 * 1000 + 30 * 60 * 1000),
        endTime: new Date(dayStart.getTime() + 14 * 60 * 60 * 1000 + 30 * 60 * 1000),
        status: SlotStatus.BOOKED
      }
    ];

    const grid = buildAvailabilityGrid(dayStart, 10, 15, 'Europe/Warsaw', reservations, 15);

    expect(grid.find((slot) => slot.status === 'HOLD')).toMatchObject({
      startTime: '10:15',
      endTime: '12:15'
    });
    expect(grid.find((slot) => slot.status === 'BOOKED')).toMatchObject({
      startTime: '13:30',
      endTime: '14:30'
    });
  });

  it('marks billiards table slots as unavailable when overlap occurs', () => {
    const dayStart = getDayStart('2024-05-01', 'Europe/Warsaw');

    const reservations = [
      {
        startTime: new Date(dayStart.getTime() + 15 * 60 * 60 * 1000),
        endTime: new Date(dayStart.getTime() + 16 * 60 * 60 * 1000),
        status: SlotStatus.BOOKED
      }
    ];

    const grid = buildAvailabilityGrid(dayStart, 12, 18, 'Europe/Warsaw', reservations, 60);
    const conflictSlot = grid.find((slot) => slot.startTime === '15:00');

    expect(conflictSlot?.status).toBe('BOOKED');
    expect(grid.every((slot) => !(slot.startTime === '15:00' && slot.status === 'AVAILABLE'))).toBe(
      true
    );
  });
});
