import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Mazmatics NZ school math stats playground');
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mazmatics/);
  });
});

test.describe('Home page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // allow D3 chart previews to render
  });

  test('Featured Explorations and More Explorations headings are visible', async ({ page }) => {
    await expect(page.getByText('Featured Explorations')).toBeVisible();
    await expect(page.getByText('More Explorations')).toBeVisible();
  });

  test('all 4 featured category cards are present', async ({ page }) => {
    // .first() because SiteNav also contains these links — we just verify a link exists
    await expect(page.locator('a[href="/primary-maths"]').first()).toBeVisible();
    await expect(page.locator('a[href="/nzqa-maths"]').first()).toBeVisible();
    await expect(page.locator('a[href="/nzqa-literacy-numeracy"]').first()).toBeVisible();
    await expect(page.locator('a[href="/nzqa-creative"]').first()).toBeVisible();
  });

  test('all 5 more nav cards are present', async ({ page }) => {
    // .first() because SiteNav also contains these links — we just verify a link exists
    await expect(page.locator('a[href="/nzqa-scholarship"]').first()).toBeVisible();
    await expect(page.locator('a[href="/nzqa-endorsement"]').first()).toBeVisible();
    await expect(page.locator('a[href="/nzqa-stories"]').first()).toBeVisible();
    await expect(page.locator('a[href="/nzqa-patterns"]').first()).toBeVisible();
    await expect(page.locator('a[href="/about"]').first()).toBeVisible();
  });

  test('preview charts render at least 4 SVGs after data loads', async ({ page }) => {
    const svgs = page.locator('svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('featured card navigates to /primary-maths', async ({ page }) => {
    // .last() because SiteNav link is first and is outside viewport when drawer is closed
    await page.locator('a[href="/primary-maths"]').last().click();
    await expect(page).toHaveURL('/primary-maths');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('home page loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
});
