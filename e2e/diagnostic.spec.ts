/**
 * Diagnostic test — visits each page, captures screenshots, and reports
 * all console errors / visible error messages for debugging.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

async function collectConsoleErrors(page: ReturnType<typeof import('@playwright/test').test.info>) {
  const errors: string[] = [];
  // @ts-expect-error page type
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  // @ts-expect-error page type
  page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));
  return errors;
}

test.describe('Page diagnostics', () => {
  test('Home page — no console errors, renders correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png'), fullPage: true });

    if (errors.length > 0) {
      console.log('HOME ERRORS:\n' + errors.join('\n'));
    }
    expect(errors, `Home page console errors:\n${errors.join('\n')}`).toHaveLength(0);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('NZQA Maths page — loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

    await page.goto('/nzqa-maths');
    await page.waitForLoadState('networkidle');

    // Screenshot immediately after load
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-nzqa-maths-load.png'), fullPage: false });

    // Wait for the Timeline chart skeleton to resolve (up to 10s)
    await page.waitForSelector('svg', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000); // allow D3 animations to start

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-nzqa-maths-charts.png'), fullPage: true });

    if (errors.length > 0) {
      console.log('NZQA MATHS ERRORS:\n' + errors.join('\n'));
    }
    expect(errors, `NZQA Maths console errors:\n${errors.join('\n')}`).toHaveLength(0);
  });

  test('NZQA Maths — Timeline section renders SVG', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

    await page.goto('/nzqa-maths');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // Check each section has rendered (SVGs present for D3 charts)
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();
    console.log(`SVG count: ${svgCount}`);

    // Check for visible error text on page
    const errorText = await page.locator('text=/error|Error|failed|Failed/').count();
    console.log(`Visible error text count: ${errorText}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-nzqa-timeline.png'), fullPage: false });
    expect(svgCount).toBeGreaterThan(0);

    if (errors.length > 0) {
      console.log('ERRORS:\n' + errors.join('\n'));
    }
  });

  test('NZQA Maths — scroll through all sections and screenshot', async ({ page }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

    await page.goto('/nzqa-maths');
    await page.waitForLoadState('networkidle', { timeout: 75000 });
    await page.waitForTimeout(3000);

    // Scroll to each section heading and screenshot (Phase 7: 7 sections)
    const sections = [
      { name: '05-section-timeline', text: 'A decade of maths achievement' },
      { name: '06-section-gradestack', text: 'Where do students land' },
      { name: '07-section-delta', text: 'Year-on-year change' },
      { name: '08-section-equity', text: 'Not every student starts from the same place' },
      { name: '09-section-map', text: 'Where you live matters' },
    ];

    for (const section of sections) {
      try {
        const el = page.locator(`text=/${section.text}/i`).first();
        if (await el.count() > 0) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${section.name}.png`) });
        }
      } catch {
        // Section might not be found, skip
      }
    }

    console.log(`Total errors collected: ${errors.length}`);
    if (errors.length > 0) {
      console.log('ALL ERRORS:\n' + errors.join('\n'));
    }

    // Fail the test if there were console errors so we see them in output
    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0);
  });

  test('API endpoints — return valid data', async ({ request }) => {
    const endpoints = [
      '/api/nzqa/timeline?metric=not_achieved_rate&groupBy=national',
      '/api/nzqa/timeline?metric=not_achieved_rate&groupBy=ethnicity&level=1',
      '/api/nzqa/timeline?metric=not_achieved_rate&groupBy=region&level=1&yearFrom=2024&yearTo=2024',
      '/api/nzqa/subjects?year=2024&region=Auckland&ethnicity=null&gender=null&equityGroup=null',
    ];

    for (const url of endpoints) {
      const res = await request.get(url);
      expect(res.status(), `${url} → ${res.status()}`).toBe(200);
      const json = await res.json();
      expect(json.data, `${url} returned no data`).toBeDefined();
      console.log(`${url} → ${json.data.length} rows`);
    }
  });
});
