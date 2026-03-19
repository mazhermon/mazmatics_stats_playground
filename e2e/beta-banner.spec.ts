import { test, expect } from '@playwright/test';

test.describe('Beta banner + badge', () => {
  test('banner disclaimer text is visible on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('aside[aria-label="Beta notice"]', { timeout: 10000 });
    await expect(page.locator('text=/Early beta/i').first()).toBeVisible();
    await expect(page.locator('text=/starting point/i').first()).toBeVisible();
  });

  test('beta badge is present in DOM on home page', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('[aria-hidden="true"]').filter({ hasText: /beta/i }).first();
    await expect(badge).toBeAttached();
  });
});
