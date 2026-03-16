import { test, expect } from '@playwright/test';

test.describe('Creative Pages Visual Regression', () => {
  test('nzqa-creative page matches snapshot', async ({ page }) => {
    await page.goto('/nzqa-creative');
    await page.waitForLoadState('networkidle');
    // Allow D3 animations and force simulations to settle
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('nzqa-creative.png', { fullPage: true });
  });

  test('nzqa-stories page matches snapshot', async ({ page }) => {
    await page.goto('/nzqa-stories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('nzqa-stories.png', { fullPage: true });
  });

  test('nzqa-patterns page matches snapshot', async ({ page }) => {
    await page.goto('/nzqa-patterns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('nzqa-patterns.png', { fullPage: true });
  });

  test('home page with nav cards matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-nav-cards.png', { fullPage: true });
  });
});
