import { test, expect } from '@playwright/test';

test.describe('Booking flow', () => {
  test('creates hold and returns Przelewy24 redirect', async ({ request }) => {
    test.skip(process.env.RUN_E2E !== 'true', 'Set RUN_E2E=true to run E2E tests');

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dateString = date.toISOString().slice(0, 10);

    const holdResponse = await request.post('/hold', {
      data: {
        resourceIds: [1, 2],
        date: dateString,
        startTime: '12:15',
        durationHours: 1,
        customer: {
          name: 'Playwright Tester',
          email: 'playwright@example.com'
        }
      }
    });

    expect(holdResponse.status()).toBe(201);
    const holdBody = await holdResponse.json();
    expect(holdBody).toHaveProperty('orderId');
    expect(Array.isArray(holdBody.reservedSlots)).toBe(true);

    const checkoutResponse = await request.post('/checkout', {
      data: {
        orderId: holdBody.orderId
      }
    });

    expect(checkoutResponse.status()).toBe(200);
    const checkoutBody = await checkoutResponse.json();
    expect(checkoutBody.redirectUrl).toContain('http');
    expect(checkoutBody).toHaveProperty('sessionId');
  });
});
