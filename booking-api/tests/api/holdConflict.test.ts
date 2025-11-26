import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConflictError } from '../../src/utils/errors';

vi.mock('../../src/services/orderService', () => ({
  createHold: vi
    .fn()
    .mockRejectedValue(new ConflictError('Selected slot is no longer available for all resources'))
}));

describe('POST /hold conflict handling', () => {
  let app: typeof import('../../src/app').app;

  beforeEach(async () => {
    const module = await import('../../src/app');
    app = module.app;
  });

  it('returns 409 when hold collides with existing reservation', async () => {
    const response = await request(app).post('/hold').send({
      items: [
        {
          resourceId: 1,
          date: '2024-04-10',
          start: '12:00',
          duration: 2,
          pricingMode: 'PER_RESOURCE_PER_HOUR'
        }
      ],
      customer: {
        email: 'jan@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski'
      }
    });

    expect(response.status).toBe(409);
    expect(response.body.error.message).toMatch(/slot is no longer available/i);
  });
});
