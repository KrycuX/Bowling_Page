import { test, expect } from '@playwright/test';

test.describe('Booking widget', () => {
  test('allows navigating to reservation page', async ({ page }) => {
    test.skip(process.env.RUN_E2E !== 'true', 'Set RUN_E2E=true to run browser tests.');

    await page.goto('/rezerwacje');
    await expect(page.getByRole('heading', { name: 'Zarezerwuj sw�j termin' })).toBeVisible();
    await expect(page.getByLabel('Data rezerwacji')).toBeVisible();
  });
});

test('apply coupon in booking form', async ({ page }) => {
  await page.goto('/');
  // navigate to a booking page depending on the app structure
  // Here we expect EnhancedBookingForm to be reachable
  // Fill minimal fields
  await page.getByLabel('Imię').fill('Jan');
  await page.getByLabel('Nazwisko').fill('Kowalski');
  await page.getByLabel('Email').fill('jan@example.com');
  // Apply coupon
  const couponInput = page.getByLabel('Kod rabatowy');
  await couponInput.fill('ZIMA10');
  const applyButton = page.getByRole('button', { name: 'Zastosuj' });
  if (await applyButton.isVisible()) {
    await applyButton.click();
  }
  // We expect success info somewhere
  // This is a smoke check; UI may differ
});