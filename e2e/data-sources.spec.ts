import { test, expect } from '@playwright/test';

test.describe('Data Sources page', () => {
  test('loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/data-sources');
    await page.waitForSelector('h1', { timeout: 10000 });
    expect(consoleErrors).toHaveLength(0);
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/data-sources');
    await expect(page).toHaveTitle(/Data Sources/);
  });

  test('all 4 source section headings are visible', async ({ page }) => {
    await page.goto('/data-sources');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Use h2 selector to avoid strict-mode violation (section containers also contain the text)
    await expect(page.locator('h2').filter({ hasText: 'NZQA Secondary School Statistics' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'TIMSS International Maths Study' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'NMSSA Maths Achievement Reports' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Curriculum Insights Dashboard' })).toBeVisible();
  });

  test('all 4 anchor ids are present in the DOM', async ({ page }) => {
    await page.goto('/data-sources');
    await page.waitForSelector('h1', { timeout: 10000 });

    await expect(page.locator('#source-nzqa')).toBeAttached();
    await expect(page.locator('#source-timss')).toBeAttached();
    await expect(page.locator('#source-nmssa')).toBeAttached();
    await expect(page.locator('#source-curriculum-insights')).toBeAttached();
  });

  test('deep link to TIMSS section — anchor exists', async ({ page }) => {
    await page.goto('/data-sources#source-timss');
    await page.waitForSelector('#source-timss', { timeout: 10000 });
    await expect(page.locator('#source-timss')).toBeAttached();
  });

  test('external source links have target=_blank and rel=noopener noreferrer', async ({ page }) => {
    await page.goto('/data-sources');
    await page.waitForSelector('h1', { timeout: 10000 });

    const externalLinks = page.locator('a[href^="https://"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('nav link to /data-sources exists on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    const dataSourcesLink = page.locator('a[href="/data-sources"]');
    await expect(dataSourcesLink).toBeAttached();
  });

  test('"About this data" link on /nzqa-maths points to NZQA anchor', async ({ request }) => {
    test.setTimeout(90000);
    // Fetch raw HTML — links are server-rendered so no need to execute JS
    const response = await request.get('/nzqa-maths', { timeout: 60000 });
    const html = await response.text();
    expect(html).toContain('href="/data-sources#source-nzqa"');
  });

  test('"About this data" links on /primary-maths point to correct anchors', async ({ request }) => {
    test.setTimeout(90000);
    // Fetch raw HTML — links are server-rendered so no need to execute JS
    const response = await request.get('/primary-maths', { timeout: 60000 });
    const html = await response.text();
    expect(html).toContain('href="/data-sources#source-timss"');
    expect(html).toContain('href="/data-sources#source-nmssa"');
    expect(html).toContain('href="/data-sources#source-curriculum-insights"');
  });
});
