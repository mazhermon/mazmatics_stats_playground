import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('landing page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
    });
  });
});
