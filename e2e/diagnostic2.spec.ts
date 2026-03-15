import { test } from '@playwright/test';
import path from 'path';

const DIR = path.join(__dirname, 'screenshots');

test('deep inspect — equity chart and map', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

  await page.goto('/nzqa-maths');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Scroll to equity section
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(DIR, 'A-equity-full.png'), fullPage: false });

  // Check what group_labels are in the equity chart end labels
  const endLabels = await page.locator('.chart-body text').allTextContents().catch(() => [] as string[]);
  console.log('Chart text elements:', endLabels.slice(0, 20));

  // Scroll to map
  await page.evaluate(() => window.scrollTo(0, 2800));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(DIR, 'B-map-section.png'), fullPage: false });

  // Check if SVG paths are present in the map
  const mapPaths = await page.locator('path.region').count();
  console.log('Map region paths:', mapPaths);

  // Scroll to 3D landscape
  await page.evaluate(() => window.scrollTo(0, 4200));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(DIR, 'C-landscape.png'), fullPage: false });

  // Scroll to comparison heatmap
  await page.evaluate(() => window.scrollTo(0, 6000));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(DIR, 'D-heatmap.png'), fullPage: false });

  // Check rect count in heatmap
  const heatmapRects = await page.locator('.heatmap-body rect.cell').count();
  console.log('Heatmap cells:', heatmapRects);

  if (errors.length > 0) console.log('ERRORS:', errors.join('\n'));
  else console.log('No errors');
});
