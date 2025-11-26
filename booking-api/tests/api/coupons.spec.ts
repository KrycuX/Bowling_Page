import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('/coupons/validate', () => {
  it('returns discount for ZIMA10', async () => {
    const res = await request(app)
      .post('/coupons/validate')
      .send({
        code: 'ZIMA10',
        email: 'john@example.com',
        items: [
          { resourceType: 'BOWLING_LANE', totalAmount: 10000 },
          { resourceType: 'KARAOKE_ROOM', totalAmount: 5000 }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.discount.amount).toBeGreaterThan(0);
  });

  it('rejects invalid code', async () => {
    const res = await request(app)
      .post('/coupons/validate')
      .send({ code: 'NOPE', email: 'john@example.com', items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }] });
    expect([400, 404]).toContain(res.status);
  });
});
