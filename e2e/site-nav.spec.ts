import { test, expect } from '@playwright/test';

test.describe('SiteNav drawer', () => {
  test('trigger button is present on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('button[aria-label="Open navigation"]')).toBeVisible();
  });

  test('trigger button is present on a chart page', async ({ page }) => {
    await page.goto('/nzqa-maths');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('button[aria-label="Open navigation"]')).toBeVisible();
  });

  test('clicking trigger opens the drawer', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    const drawer = page.locator('#site-nav-drawer');
    // Drawer exists in DOM but is off-screen
    await expect(drawer).toBeAttached();
    await page.locator('button[aria-label="Open navigation"]').click();
    // After open, drawer should not have -translate-x-full class
    await expect(drawer).not.toHaveClass(/-translate-x-full/);
    // Mazmatics wordmark visible in drawer
    await expect(drawer.locator('text=Mazmatics')).toBeVisible();
  });

  test('clicking backdrop closes the drawer', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    // Wait for drawer to open
    await expect(page.locator('#site-nav-drawer').locator('text=Mazmatics')).toBeVisible();
    // Click the backdrop (fixed overlay div)
    await page.locator('div[aria-hidden="true"][tabindex="-1"]').click({ force: true });
    // Drawer should be closed (trigger label reverts)
    await expect(page.locator('button[aria-label="Open navigation"]')).toBeVisible();
  });

  test('pressing Escape closes the drawer', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    await expect(page.locator('#site-nav-drawer').locator('text=Mazmatics')).toBeVisible();
    await page.keyboard.press('Escape');
    // Trigger label should revert to "Open navigation"
    await expect(page.locator('button[aria-label="Open navigation"]')).toBeVisible({ timeout: 5000 });
  });

  test('all chart nav links are present in the drawer', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    const drawer = page.locator('#site-nav-drawer');
    await expect(drawer.locator('text=Mazmatics')).toBeVisible();

    const expectedLinks = [
      { href: '/primary-maths',          label: 'Primary Maths' },
      { href: '/nzqa-maths',             label: 'Secondary Maths' },
      { href: '/nzqa-literacy-numeracy', label: 'Literacy & Numeracy' },
      { href: '/nzqa-scholarship',       label: 'Scholarship' },
      { href: '/nzqa-endorsement',       label: 'Endorsement' },
      { href: '/nzqa-creative',          label: 'Creative Views' },
      { href: '/nzqa-stories',           label: 'Data Stories' },
      { href: '/nzqa-patterns',          label: 'Patterns & Trends' },
    ];

    for (const { href, label } of expectedLinks) {
      await expect(drawer.locator(`a[href="${href}"]`)).toBeAttached();
      await expect(drawer.locator(`a[href="${href}"]`)).toHaveText(label);
    }
  });

  test('utility links (Data Sources, About) are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    const drawer = page.locator('#site-nav-drawer');
    await expect(drawer.locator('text=Mazmatics')).toBeVisible();
    await expect(drawer.locator('a[href="/data-sources"]')).toBeAttached();
    await expect(drawer.locator('a[href="/about"]')).toBeAttached();
  });

  test('clicking a nav link navigates to that page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    await expect(page.locator('#site-nav-drawer').locator('text=Mazmatics')).toBeVisible();
    await page.locator('#site-nav-drawer a[href="/about"]').click();
    await page.waitForURL('**/about', { timeout: 10000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    expect(page.url()).toContain('/about');
  });

  test('active route link has aria-current=page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    const drawer = page.locator('#site-nav-drawer');
    await expect(drawer.locator('text=Mazmatics')).toBeVisible();
    await expect(drawer.locator('a[href="/about"][aria-current="page"]')).toBeAttached();
  });

  test('drawer has role=dialog when open', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.locator('button[aria-label="Open navigation"]').click();
    await expect(page.locator('#site-nav-drawer')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('#site-nav-drawer')).toHaveAttribute('aria-modal', 'true');
  });
});
