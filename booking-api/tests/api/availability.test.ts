import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {}
}));

const getAvailabilityMock = vi.fn();

vi.mock('../../src/services/availabilityService', () => ({
  getAvailability: getAvailabilityMock
}));

describe('availability route', () => {
  let app: typeof import('../../src/app').app;

  beforeEach(async () => {
    getAvailabilityMock.mockReset();
    const module = await import('../../src/app');
    app = module.app;
  });

  it('returns availability for billiards tables', async () => {
    const payload = {
      date: '2025-10-11',
      timezone: 'Europe/Warsaw',
      openHour: 12,
      closeHour: 22,
      slotIntervalMinutes: 60,
      resources: [
        {
          id: 11,
          name: 'Bilard #1',
          type: 'BILLIARDS_TABLE' as const,
          pricePerHour: 5000,
          priceFlat: null,
          slots: [
            { startTime: '12:00', endTime: '13:00', status: 'AVAILABLE' },
            { startTime: '13:00', endTime: '14:00', status: 'HOLD' }
          ]
        }
      ],
      groupedByType: {
        bowlingLanes: [],
        billiardsTables: [],
        quizRooms: [],
        karaokeRooms: []
      },
      filters: {
        resourceType: 'BILLIARDS_TABLE'
      }
    };

    getAvailabilityMock.mockResolvedValue(payload);

    const response = await request(app)
      .get('/availability')
      .query({ date: '2025-10-11', resourceType: 'BILLIARDS_TABLE' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(payload);
    expect(getAvailabilityMock).toHaveBeenCalledWith('2025-10-11', {
      resourceType: 'BILLIARDS_TABLE',
      resourceId: undefined
    });
  });
});
