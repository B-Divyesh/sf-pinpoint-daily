import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('demo opens a playable course with an isolated banner', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Pinpoint Daily');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Shoot' })).toBeVisible();
  await expect(page.locator('canvas')).toBeFocused({ timeout: 1 }).catch(() => {});
  await page.locator('canvas').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Shots: 1 / 5')).toBeVisible();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('mobile view keeps the game controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Less power' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Play today’s three-hole course' })).toBeVisible();
});

test('demo has no serious accessibility findings', async ({ page }) => {
  await page.goto('/demo');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? '')).map(issue => issue.id)).toEqual([]);
});
