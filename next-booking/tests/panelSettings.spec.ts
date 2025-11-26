import { expect, test } from '@playwright/test';

test('admin can update settings', async ({ page }) => {
  await page.goto('/panel/login');

  await page.getByLabel('Email').fill('admin@local');
  await page.getByLabel('Hasło').fill('Admin123!');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.waitForURL(/\/panel$/);
  await page.getByRole('button', { name: 'Ustawienia' }).click();
  await page.waitForURL(/\/panel\/ustawienia$/);

  // Change hold duration and save
  const hold = page.getByLabel('Czas HOLD (min)');
  await hold.fill('12');
  await page.getByRole('button', { name: 'Zapisz ustawienia' }).click();

  await expect(page.getByText('Zapisano ustawienia')).toBeVisible();
});


