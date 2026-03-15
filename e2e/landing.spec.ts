import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Mazmatics math stats playground');
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mazmatics/);
  });
});
