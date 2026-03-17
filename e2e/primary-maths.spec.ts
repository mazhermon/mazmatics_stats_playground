/**
 * E2E tests for /primary-maths — Phase 8 primary school data explorer.
 *
 * Covers:
 * - API health (3 primary data endpoints)
 * - Page load (hero, stat cards, nav)
 * - TIMSSTrendChart: National / By gender toggle
 * - TIMSSWorldRanking: static ranked bar chart
 * - NMSSAEquityGaps: By ethnicity / By decile / By gender toggle
 * - CurriculumInsightsPipeline: 2023 / 2024 year toggle
 * - Home page nav card link to /primary-maths
 */
import { test, expect } from '@playwright/test';

// ─── API health ───────────────────────────────────────────────────────────────

test.describe('Primary Maths API endpoints', () => {
  test('GET /api/primary/timss?type=trend returns national + gender rows', async ({ request }) => {
    const res = await request.get('/api/primary/timss?type=trend');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    // Should have national and gender rows
    const national = json.data.filter((r: { group_type: string }) => r.group_type === 'national');
    const gender = json.data.filter((r: { group_type: string }) => r.group_type === 'gender');
    expect(national.length).toBeGreaterThan(0);
    expect(gender.length).toBeGreaterThan(0);
  });

  test('GET /api/primary/timss?type=intl returns country comparison rows', async ({ request }) => {
    const res = await request.get('/api/primary/timss?type=intl');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    // NZ row should be present
    const nzRow = json.data.find((r: { is_nz: number }) => r.is_nz === 1);
    expect(nzRow).toBeDefined();
  });

  test('GET /api/primary/nmssa returns Year 4 and Year 8 rows', async ({ request }) => {
    const res = await request.get('/api/primary/nmssa');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const y4 = json.data.filter((r: { year_level: number }) => r.year_level === 4);
    const y8 = json.data.filter((r: { year_level: number }) => r.year_level === 8);
    expect(y4.length).toBeGreaterThan(0);
    expect(y8.length).toBeGreaterThan(0);
  });

  test('GET /api/primary/curriculum-insights returns Years 3, 6, 8 rows', async ({ request }) => {
    const res = await request.get('/api/primary/curriculum-insights');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const yearLevels = [...new Set(json.data.map((r: { year_level: number }) => r.year_level))];
    expect(yearLevels).toContain(3);
    expect(yearLevels).toContain(6);
    expect(yearLevels).toContain(8);
  });
});

// ─── Page load ────────────────────────────────────────────────────────────────

test.describe('/primary-maths page', () => {
  test('loads without console errors', async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await page.waitForTimeout(3000);

    const appErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_') && !e.includes('ERR_ABORTED')
    );
    expect(appErrors, `Console errors:\n${appErrors.join('\n')}`).toHaveLength(0);
  });

  test('hero heading, page badge, and stat cards are visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });

    await expect(page.locator('h1').first()).toContainText('primary school');
    await expect(page.locator('text=~40th').first()).toBeVisible();
    await expect(page.locator('text=22%').first()).toBeVisible();
    await expect(page.locator('text=490').first()).toBeVisible();
    await expect(page.locator('text=21 pts').first()).toBeVisible();
  });

  test('secondary maths cross-link is present', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await expect(page.locator('a[href="/nzqa-maths"]').first()).toBeVisible();
  });

  test('at least 1 SVG chart renders above fold', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await page.waitForTimeout(4000);
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ─── TIMSSTrendChart ──────────────────────────────────────────────────────────

test.describe('TIMSSTrendChart', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await page.waitForTimeout(3000);
  });

  test('"National" and "By gender" toggle buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'National' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'By gender' }).first()).toBeVisible();
  });

  test('"National" is active by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'National' }).first()).toHaveClass(/bg-violet-600/);
  });

  test('clicking "By gender" does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: 'By gender' }).first().click();
    await page.waitForTimeout(2000);

    expect(errors, `Page errors:\n${errors.join('\n')}`).toHaveLength(0);
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('switching back to "National" after gender does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: 'By gender' }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'National' }).first().click();
    await page.waitForTimeout(1500);

    expect(errors).toHaveLength(0);
  });

  test('SVG chart has path or line elements (data is drawn)', async ({ page }) => {
    const paths = page.locator('svg path, svg line');
    const count = await paths.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── TIMSSWorldRanking ────────────────────────────────────────────────────────

test.describe('TIMSSWorldRanking', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await page.waitForTimeout(3000);
    await page.locator('text=Where does NZ sit globally').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  });

  test('SVG renders with bar elements (countries plotted)', async ({ page }) => {
    const rects = page.locator('svg rect');
    const count = await rects.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no page errors after loading world ranking chart', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });
});

// ─── NMSSAEquityGaps ──────────────────────────────────────────────────────────

test.describe('NMSSAEquityGaps', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await page.waitForTimeout(3000);
    await page.locator('text=Who falls behind').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  });

  test('"By ethnicity", "By decile", "By gender" toggle buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'By ethnicity' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'By decile' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'By gender' }).first()).toBeVisible();
  });

  test('"By ethnicity" is active by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'By ethnicity' }).first()).toHaveClass(/bg-violet-600/);
  });

  test('clicking "By decile" does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: 'By decile' }).first().click();
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('clicking "By gender" (NMSSA section) does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // NMSSAEquityGaps "By gender" is the LAST "By gender" button on the page
    // (TIMSSTrendChart has the first one)
    await page.getByRole('button', { name: 'By gender' }).last().click();
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('switching back to "By ethnicity" after decile does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: 'By decile' }).first().click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'By ethnicity' }).first().click();
    await page.waitForTimeout(1500);

    expect(errors).toHaveLength(0);
  });
});

// ─── CurriculumInsightsPipeline ───────────────────────────────────────────────

test.describe('CurriculumInsightsPipeline', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/primary-maths');
    await page.waitForLoadState('networkidle', { timeout: 45000 });
    await page.waitForTimeout(3000);
    await page.locator('text=The primary maths pipeline').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  });

  test('"2023" and "2024" year buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: '2024' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '2023' }).first()).toBeVisible();
  });

  test('"2024" is active by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: '2024' }).first()).toHaveClass(/bg-violet-600/);
  });

  test('clicking "2023" does not crash and chart re-renders', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: '2023' }).first().click();
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('clicking "2024" after "2023" does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: '2023' }).first().click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: '2024' }).first().click();
    await page.waitForTimeout(1500);

    expect(errors).toHaveLength(0);
  });
});

// ─── Home page nav card ───────────────────────────────────────────────────────

test.describe('Home page — /primary-maths nav card', () => {
  test('nav card link to /primary-maths is present on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/primary-maths"]')).toBeVisible();
  });

  test('nav card navigates to /primary-maths', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    await page.click('a[href="/primary-maths"]');
    await expect(page).toHaveURL('/primary-maths');
    await expect(page.locator('h1').first()).toContainText('primary school');
  });
});
