import { test, expect } from '@playwright/test';
import dayjsLib from 'dayjs';

const dayjs = dayjsLib;

test.describe('Planner read-only behaviour', () => {
  test('renders booked and hold segments without interactive cells', async ({ page }) => {
    test.skip(process.env.RUN_E2E !== 'true', 'Set RUN_E2E=true to run browser tests.');

    await page.route('**/schedule?**resourceType=bowling_lane**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2025-10-15',
          openHour: 12,
          closeHour: 22,
          resources: [
            {
              resourceId: 1,
              resourceName: 'Tor 1',
              bookings: [
                { from: '15:00', to: '16:00', status: 'BOOKED', peopleCount: null, orderId: null },
                { from: '16:00', to: '17:00', status: 'HOLD', peopleCount: null, orderId: null }
              ]
            }
          ]
        })
      });
    });

    await page.goto('/kregle');

    await expect(page.getByRole('heading', { name: 'Rezerwacja torow do kregli' })).toBeVisible();
    await expect(page.getByText('15:00-16:00')).toBeVisible();
    await expect(page.getByText('16:00-17:00')).toBeVisible();
    await expect(page.locator('[id^="planner-cell"]')).toHaveCount(0);
  });
});

test.describe('Panel billiards workflow', () => {
  test('shows availability list when creating billiards reservation', async ({ page }) => {
    test.skip(process.env.RUN_E2E !== 'true', 'Set RUN_E2E=true to run browser tests.');

    const availabilityRequests: string[] = [];
    const scheduleRequests: string[] = [];

    await page.route('**/admin/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 1, email: 'admin@local.test', role: 'ADMIN' },
          csrfToken: 'token'
        })
      });
    });

    await page.route('**/schedule?**resourceType=billiards_table**', async (route) => {
      scheduleRequests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2025-10-20',
          openHour: 12,
          closeHour: 22,
          resources: [
            {
              resourceId: 11,
              resourceName: 'Bilard #1',
              bookings: [
                {
                  from: '18:00',
                  to: '19:00',
                  status: 'BOOKED',
                  peopleCount: null,
                  orderId: 'order-7'
                }
              ]
            }
          ]
        })
      });
    });

    await page.route('**/availability?**', async (route) => {
      availabilityRequests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2025-10-20',
          timezone: 'Europe/Warsaw',
          openHour: 12,
          closeHour: 22,
          slotIntervalMinutes: 60,
          resources: [
            {
              id: 11,
              name: 'Bilard #1',
              type: 'BILLIARDS_TABLE',
              pricePerHour: 5000,
              priceFlat: null,
              slots: [
                { startTime: '12:00', endTime: '18:00', status: 'AVAILABLE' },
                { startTime: '18:00', endTime: '19:00', status: 'BOOKED' },
                { startTime: '19:00', endTime: '22:00', status: 'AVAILABLE' }
              ]
            }
          ],
          groupedByType: {
            bowlingLanes: [],
            billiardsTables: [],
            quizRooms: [],
            karaokeRooms: []
          },
          filters: { resourceType: 'BILLIARDS_TABLE' }
        })
      });
    });

    await page.goto('/panel/rezerwacje/nowa');

    await page.getByRole('button', { name: 'Bilard' }).click();

    const tomorrow = dayjs().add(1, 'day').date().toString();
    await page.getByRole('gridcell', { name: new RegExp(`^${tomorrow}$`) }).click();

    expect(
      availabilityRequests.some((url) => url.includes('resourceType=BILLIARDS_TABLE'))
    ).toBe(true);

    await expect(page.getByText('#order-7')).toBeVisible();

    await expect(page.getByRole('button', { name: '12:00' })).toBeVisible();
    await expect(page.getByRole('button', { name: '18:00' })).not.toBeVisible();
  });
});
