import { test, expect } from '@playwright/test';

test.describe('About page', () => {
  test.setTimeout(30000);

  test('loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        !msg.text().includes('Failed to load resource')
      ) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    expect(consoleErrors).toHaveLength(0);
  });

  test('h1 "About Mazmatics" is visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('About Mazmatics');
  });

  test('"Where it all started" section heading visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByText('Where it all started')).toBeVisible({ timeout: 5000 });
  });

  test('"From a story book to a data story" section heading visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByText('From a story book to a data story')).toBeVisible({ timeout: 5000 });
  });

  test('"The data behind the charts" section heading visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByText('The data behind the charts')).toBeVisible({ timeout: 5000 });
  });

  test('"Get in touch" section heading visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Get in touch' })).toBeVisible({ timeout: 5000 });
  });

  test('stat cards: "Wellington, NZ" visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByText('Wellington, NZ')).toBeVisible({ timeout: 5000 });
  });

  test('stat cards: "Two kids" visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByText('Two kids')).toBeVisible({ timeout: 5000 });
  });

  test('stat cards: "Web developer" visible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.getByText('Web developer', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('book section external link has rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    const bookLink = page.locator('a[href*="mazmatics.com/get-the-book"]');
    await expect(bookLink).toBeAttached();
    await expect(bookLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('/data-sources link present and navigates correctly', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    // Use text filter to target the in-page link, not the hidden SiteNav drawer link
    const dsLink = page.locator('a[href="/data-sources"]').filter({ hasText: 'methodology' });
    await expect(dsLink).toBeAttached();
    await dsLink.click();
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page).toHaveURL(/\/data-sources/);
  });

  test('mailto:hellomazmatics@gmail.com link present', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    const mailLink = page.locator('a[href="mailto:hellomazmatics@gmail.com"]');
    await expect(mailLink).toBeAttached();
  });

  test('home page has "About" card linking to /about', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    const aboutLink = page.locator('a[href="/about"]').first();
    await expect(aboutLink).toBeAttached();
  });

  test('/about nav back-link navigates to home', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    // Use text filter to target the in-page back-link, not the hidden SiteNav drawer link
    const backLink = page.locator('a[href="/"]').filter({ hasText: 'All explorers' });
    await expect(backLink).toBeAttached();
    await backLink.click();
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });
});
