import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', heading: /How the U.+Visa came to be/ },
  { path: '/u-visa', heading: /Understanding the U.+Visa/i },
  { path: '/news', heading: /U-Visa News/i },
  { path: '/dashboard', heading: /Dashboard/ },
  { path: '/analyze', heading: /Analyze/i },
  { path: '/backlog', heading: /U Visa Backlog/i },
  { path: '/geography', heading: /Geography/i },
  { path: '/integrity', heading: /Program Integrity/i },
  { path: '/litigation', heading: /U Visa Litigation/i },
  { path: '/about', heading: /About the U Visa/i },
  { path: '/sources', heading: /Data Sources/i },
  { path: '/archives', heading: /Archive Search/i },
  { path: '/disclaimer', heading: /Legal Disclaimer/i },
  { path: '/privacy', heading: /Privacy Notice/i },
  { path: '/terms', heading: /Terms of Use/i },
];

for (const r of ROUTES) {
  test(`route ${r.path} returns 200 and renders its h1`, async ({ page }) => {
    const resp = await page.goto(r.path);
    expect(resp?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: r.heading })).toBeVisible();
  });
}
