import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {}
}));

const getScheduleForDateMock = vi.fn();

vi.mock('../../src/services/scheduleService', () => ({
  getScheduleForDate: getScheduleForDateMock
}));

vi.mock('../../src/middleware/requireAuth', () => ({
  requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => next()
}));

describe('schedule routes', () => {
  let app: typeof import('../../src/app').app;

  beforeEach(async () => {
    getScheduleForDateMock.mockReset();
    const module = await import('../../src/app');
    app = module.app;
  });

  it('returns aggregated public schedule and disables caching', async () => {
    const sampleSchedule = {
      date: '2025-10-07',
      openHour: 12,
      closeHour: 24,
      resources: [
        {
          resourceId: 1,
          resourceName: 'Tor 1',
          bookings: [
            {
              from: '18:00',
              to: '20:00',
              status: 'BOOKED',
              peopleCount: null,
              orderId: null
            }
          ]
        },
        {
          resourceId: 5,
          resourceName: 'Quiz Room',
          bookings: [
            {
              from: '20:00',
              to: '21:00',
              status: 'HOLD',
              peopleCount: 8,
              orderId: null
            }
          ]
        },
        {
          resourceId: 6,
          resourceName: 'Karaoke Room',
          bookings: []
        }
      ]
    };

    getScheduleForDateMock.mockResolvedValue(sampleSchedule);

    const response = await request(app)
      .get('/schedule')
      .query({ date: '2025-10-07', resourceType: 'bowling_lane', resourceId: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(sampleSchedule);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(getScheduleForDateMock).toHaveBeenCalledWith(
      '2025-10-07',
      {
        resourceType: 'BOWLING_LANE',
        resourceId: 1
      },
      false
    );
  });

  it('returns admin schedule with order identifiers', async () => {
    const adminSchedule = {
      date: '2025-10-08',
      openHour: 12,
      closeHour: 24,
      resources: [
        {
          resourceId: 2,
          resourceName: 'Tor 2',
          bookings: [
            {
              from: '12:00',
              to: '14:00',
              status: 'BOOKED',
              peopleCount: null,
              orderId: 'order-42'
            }
          ]
        }
      ]
    };

    getScheduleForDateMock.mockResolvedValue(adminSchedule);

    const response = await request(app).get('/admin/schedule').query({ date: '2025-10-08' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(adminSchedule);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(getScheduleForDateMock).toHaveBeenCalledWith(
      '2025-10-08',
      {
        resourceType: undefined,
        resourceId: undefined
      },
      true
    );
  });

  it('supports billiards tables in public schedule queries', async () => {
    const billiardsSchedule = {
      date: '2025-10-09',
      openHour: 12,
      closeHour: 22,
      resources: [
        {
          resourceId: 10,
          resourceName: 'Bilard #1',
          bookings: []
        }
      ]
    };

    getScheduleForDateMock.mockResolvedValue(billiardsSchedule);

    const response = await request(app)
      .get('/schedule')
      .query({ date: '2025-10-09', resourceType: 'billiards_table' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(billiardsSchedule);
    expect(getScheduleForDateMock).toHaveBeenCalledWith(
      '2025-10-09',
      {
        resourceType: 'BILLIARDS_TABLE',
        resourceId: undefined
      },
      false
    );
  });
});
