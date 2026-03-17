/**
 * E2E tests for /nzqa-scholarship — Phase 10 Scholarship Explorer
 *
 * Covers:
 * - API /api/nzqa/scholarship health (national, ethnicity, equity, region, gender)
 * - Page load without errors
 * - Hero section present
 * - Section headings visible
 * - SVG charts render
 * - Chart controls (subject toggle, groupBy, year)
 */
import { test, expect } from '@playwright/test';

// ─── API tests ─────────────────────────────────────────────────────────────────

test.describe('/api/nzqa/scholarship', () => {
  test('national Calculus returns valid data', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    // Check shape
    const first = json.data[0] as Record<string, unknown>;
    expect(first).toHaveProperty('year');
    expect(first).toHaveProperty('outstanding_rate');
    expect(first).toHaveProperty('scholarship_rate');
    expect(first).toHaveProperty('no_award_rate');
    expect(first).toHaveProperty('total_assessed');
  });

  test('national Statistics returns valid data', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Statistics&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    expect((json.data[0] as Record<string, unknown>)).toHaveProperty('outstanding_rate');
  });

  test('ethnicity groupBy returns group_label', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=ethnicity');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    const first = json.data[0] as Record<string, unknown>;
    expect(first).toHaveProperty('group_label');
    expect(typeof first.group_label).toBe('string');
    expect(json.groupBy).toBe('ethnicity');
  });

  test('equity groupBy returns results', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=equity_index_group&yearFrom=2022&yearTo=2024');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  test('region groupBy returns results', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=region&yearFrom=2024&yearTo=2024');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    const labels = (json.data as Array<{ group_label: string }>).map((d) => d.group_label);
    expect(labels).toContain('Auckland');
  });

  test('gender groupBy returns Female and Male', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=gender');
    expect(res.status()).toBe(200);
    const json = await res.json();
    const labels = (json.data as Array<{ group_label: string }>).map((d) => d.group_label);
    const hasGenders = labels.includes('Female') || labels.includes('Male');
    expect(hasGenders).toBe(true);
  });

  test('yearFrom/yearTo filtering works', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=national&yearFrom=2020&yearTo=2022');
    expect(res.status()).toBe(200);
    const json = await res.json();
    const years = (json.data as Array<{ year: number }>).map((d) => d.year);
    expect(years.every((y) => y >= 2020 && y <= 2022)).toBe(true);
    expect(years.length).toBe(3);
  });

  test('invalid subject returns 400', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Biology&groupBy=national');
    expect(res.status()).toBe(400);
  });

  test('invalid groupBy returns 400', async ({ request }) => {
    const res = await request.get('/api/nzqa/scholarship?subject=Calculus&groupBy=invalid');
    expect(res.status()).toBe(400);
  });
});

// ─── Page-level ───────────────────────────────────────────────────────────────

test.describe('/nzqa-scholarship page', () => {
  test('loads without console errors', async ({ page }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    const api404s: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('response', (r) => {
      if (r.status() === 404 && !r.url().includes('/_next/')) api404s.push(r.url());
    });

    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForTimeout(5000);

    const appErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('net::ERR_') &&
        !e.includes('ERR_ABORTED') &&
        !e.includes('Failed to load resource')
    );
    expect(api404s, `API 404s:\n${api404s.join('\n')}`).toHaveLength(0);
    expect(appErrors, `Console errors:\n${appErrors.join('\n')}`).toHaveLength(0);
  });

  test('hero heading is visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=top academic award').first()).toBeVisible();
  });

  test('section headings are present', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=Award rates over time').first()).toBeVisible();
    await expect(page.locator('text=Who earns the award').first()).toBeVisible();
  });

  test('at least 1 SVG chart renders after load', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    // Wait for client-side JS to load and chart to render
    await page.waitForSelector('svg', { timeout: 20000 });

    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('stat cards are visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForTimeout(2000);

    await expect(page.locator('text=~25%').first()).toBeVisible();
    await expect(page.locator('text=10 yrs').first()).toBeVisible();
  });
});

// ─── ScholarshipTrendChart ─────────────────────────────────────────────────────

test.describe('ScholarshipTrendChart', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    // Wait for chart client component to mount (buttons appear)
    await page.waitForSelector('button:has-text("Calculus")', { timeout: 20000 });
  });

  test('Calculus/Statistics subject toggle is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Calculus")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Statistics")').first()).toBeVisible();
  });

  test('switching to Statistics subject works', async ({ page }) => {
    await page.locator('button:has-text("Statistics")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('By Ethnicity view toggle is visible and clickable', async ({ page }) => {
    await expect(page.locator('button:has-text("By Ethnicity")').first()).toBeVisible();
    await page.locator('button:has-text("By Ethnicity")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('By Gender view toggle works', async ({ page }) => {
    await page.locator('button:has-text("By Gender")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ─── ScholarshipBreakdownChart ─────────────────────────────────────────────────

test.describe('ScholarshipBreakdownChart', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/nzqa-scholarship');
    await page.waitForSelector('h1', { timeout: 20000 });
    // Wait for both chart components to mount
    await page.waitForSelector('button:has-text("Equity")', { timeout: 20000 });
  });

  test('Equity groupBy toggle exists', async ({ page }) => {
    await expect(page.locator('button:has-text("Equity")').first()).toBeVisible({ timeout: 5000 });
  });

  test('Region groupBy toggle exists', async ({ page }) => {
    await expect(page.locator('button:has-text("Region")').first()).toBeVisible({ timeout: 5000 });
  });

  test('Gender groupBy toggle exists', async ({ page }) => {
    await expect(page.locator('button:has-text("Gender")').first()).toBeVisible({ timeout: 5000 });
  });

  test('year selector dropdown exists', async ({ page }) => {
    await expect(page.locator('select').first()).toBeVisible({ timeout: 5000 });
  });
});

// ─── Home page nav card ────────────────────────────────────────────────────────

test.describe('Home page scholarship nav card', () => {
  test('scholarship nav card is visible', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('text=NZ Scholarship Explorer').first()).toBeVisible();
  });

  test('scholarship nav card links to /nzqa-scholarship', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    const link = page.locator('a[href="/nzqa-scholarship"]').first();
    await expect(link).toBeVisible();
  });
});
