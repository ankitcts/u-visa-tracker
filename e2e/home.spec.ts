import { test, expect } from '@playwright/test';

test.describe('homepage', () => {
  test('renders the hero, video, timeline, and image reel sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /How the U.+Visa came to be/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Watch the history/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Interactive timeline/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Image reel/i })).toBeVisible();
  });

  test('site-wide disclaimer banner is visible above the navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('note')).toBeVisible();
    await expect(page.getByText(/not legal advice/i).first()).toBeVisible();
  });

  test('"Read the history aloud" button reveals controls when clicked', async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByRole('button', { name: /Read the history aloud/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    // Pause / Skip / Stop controls appear.
    await expect(page.getByRole('button', { name: /pause narration|resume narration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /skip to next event/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /stop narration/i })).toBeVisible();
  });
});
