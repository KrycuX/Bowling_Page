import { ResourceType, SlotStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { buildBookingsForResource } from '../../src/services/scheduleService';

const TIMEZONE = 'Europe/Warsaw';

function utc(date: string) {
  return new Date(`${date}Z`);
}

describe('buildBookingsForResource', () => {
  it('merges contiguous hourly slots into a single booking block', () => {
    const reservations = [
      {
        resourceId: 1,
        orderId: 'order-1',
        startTime: utc('2025-10-07T16:00:00'),
        endTime: utc('2025-10-07T17:00:00'),
        status: SlotStatus.BOOKED
      },
      {
        resourceId: 1,
        orderId: 'order-1',
        startTime: utc('2025-10-07T17:00:00'),
        endTime: utc('2025-10-07T18:00:00'),
        status: SlotStatus.BOOKED
      },
      {
        resourceId: 1,
        orderId: 'order-2',
        startTime: utc('2025-10-07T18:00:00'),
        endTime: utc('2025-10-07T19:00:00'),
        status: SlotStatus.HOLD
      }
    ];

    const peopleCountMap = new Map<string, number | null>([['order-2:1', 5]]);

    const bookings = buildBookingsForResource({
      reservations,
      resourceType: ResourceType.BOWLING_LANE,
      timezone: TIMEZONE,
      peopleCountMap,
      includeOrderId: true
    });

    expect(bookings).toHaveLength(2);
    expect(bookings[0]).toMatchObject({
      from: '18:00',
      to: '20:00',
      status: 'BOOKED',
      peopleCount: null,
      orderId: 'order-1'
    });
    expect(bookings[1]).toMatchObject({
      from: '20:00',
      to: '21:00',
      status: 'HOLD',
      peopleCount: null,
      orderId: 'order-2'
    });
  });

  it('marks merged bookings as HOLD when any segment is a hold and hides orderId when not requested', () => {
    const reservations = [
      {
        resourceId: 2,
        orderId: 'order-3',
        startTime: utc('2025-10-07T12:00:00'),
        endTime: utc('2025-10-07T13:00:00'),
        status: SlotStatus.HOLD
      },
      {
        resourceId: 2,
        orderId: 'order-3',
        startTime: utc('2025-10-07T13:00:00'),
        endTime: utc('2025-10-07T14:00:00'),
        status: SlotStatus.BOOKED
      },
      {
        resourceId: 2,
        orderId: 'order-3',
        startTime: utc('2025-10-07T14:00:00'),
        endTime: utc('2025-10-07T15:00:00'),
        status: SlotStatus.RELEASED
      }
    ];

    const peopleCountMap = new Map<string, number | null>([['order-3:2', 8]]);

    const bookings = buildBookingsForResource({
      reservations,
      resourceType: ResourceType.QUIZ_ROOM,
      timezone: TIMEZONE,
      peopleCountMap,
      includeOrderId: false
    });

    expect(bookings).toHaveLength(1);
    expect(bookings[0]).toMatchObject({
      from: '14:00',
      to: '16:00',
      status: 'HOLD',
      peopleCount: 8,
      orderId: null
    });
  });

  it('omits people count for billiards resources', () => {
    const reservations = [
      {
        resourceId: 3,
        orderId: 'order-10',
        startTime: utc('2025-10-07T12:00:00'),
        endTime: utc('2025-10-07T13:00:00'),
        status: SlotStatus.BOOKED
      }
    ];

    const peopleCountMap = new Map<string, number | null>([['order-10:3', 6]]);

    const bookings = buildBookingsForResource({
      reservations,
      resourceType: ResourceType.BILLIARDS_TABLE,
      timezone: TIMEZONE,
      peopleCountMap,
      includeOrderId: true
    });

    expect(bookings).toEqual([
      {
        from: '14:00',
        to: '15:00',
        status: 'BOOKED',
        peopleCount: null,
        orderId: 'order-10'
      }
    ]);
  });
});
