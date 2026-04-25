import { test, expect } from '@playwright/test';

test.describe('/analyze tabs and filters', () => {
  test('switches between Overview, By State, and By Year tabs', async ({ page }) => {
    await page.goto('/analyze');
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    const byState = page.getByRole('tab', { name: 'By State' });
    await byState.click();
    await expect(page.getByText(/State drill-down/i)).toBeVisible();
    const byYear = page.getByRole('tab', { name: 'By Year' });
    await byYear.click();
    await expect(page.getByText(/Year drill-down/i)).toBeVisible();
  });

  test('Reset / FY12–18 / Last 5 FYs presets are clickable', async ({ page }) => {
    await page.goto('/analyze');
    for (const label of ['Reset', 'FY12–18', 'Last 5 FYs']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
    await page.getByRole('button', { name: 'FY12–18' }).click();
  });
});

test.describe('legal pages', () => {
  test('disclaimer page hits the key sections', async ({ page }) => {
    await page.goto('/disclaimer');
    await expect(page.getByRole('heading', { name: /no legal advice/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /no government affiliation/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /aggregate data only/i })).toBeVisible();
  });

  test('terms page hits indemnity + governing law', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /indemnification/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /governing law/i })).toBeVisible();
  });
});
