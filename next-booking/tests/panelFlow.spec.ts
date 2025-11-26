import { expect, test } from '@playwright/test';

function futureDateISO(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

test('employee can create, edit, and cancel a reservation from the panel', async ({ page }) => {
  const customerEmail = `panel-test+${Date.now()}@example.com`;
  const reservationDate = futureDateISO(2);

  await page.goto('/panel/login');

  await page.getByLabel('Email').fill('employee@local');
  await page.getByLabel('Hasło').fill('Employee123!');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.waitForURL(/\/panel$/);
  await expect(page.getByRole('heading', { name: 'Rezerwacje' })).toBeVisible();

  await page.getByRole('button', { name: 'Nowa rezerwacja' }).first().click();
  await page.waitForURL(/\/panel\/rezerwacje\/nowa$/);

  await page.getByLabel('Email').fill(customerEmail);
  await page.getByLabel('Imię').fill('Jan');
  await page.getByLabel('Nazwisko').fill('Testowy');
  await page.getByLabel('Telefon').fill('123123123');
  await page.getByLabel('Data').fill(reservationDate);

  await page.getByLabel('Zasób').click();
  await expect(page.getByRole('option', { name: /Tor/ }).first()).toBeVisible();
  await page.getByRole('option', { name: /Tor/ }).first().click();

  await page.getByLabel('Godzina startu').click();
  await page.getByRole('option', { name: '10:00' }).click();

  await page.getByRole('button', { name: 'Zapisz' }).click();

  await page.waitForURL(/\/panel\/rezerwacje\/.+/);
  await expect(page.getByRole('heading', { name: /Rezerwacja/ })).toBeVisible();

  await page.getByLabel('Godzina startu').click();
  await page.getByRole('option', { name: '11:00' }).click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByText('Rezerwacja zaktualizowana')).toBeVisible();

  await page.getByRole('button', { name: 'Anuluj rezerwację' }).click();
  await page.getByRole('button', { name: 'Anuluj rezerwację' }).last().click();
  await expect(page.getByText('Rezerwacja anulowana')).toBeVisible();

  await page.goto('/panel/rezerwacje');
  await expect(page.getByRole('cell', { name: customerEmail })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'CANCELLED' })).toBeVisible();
});
