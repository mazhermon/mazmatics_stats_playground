/**
 * E2E tests for /nzqa-literacy-numeracy — Phase 12 Literacy & Numeracy Explorer
 *
 * Covers:
 * - API /api/nzqa/literacy-numeracy health (national, all dimensions, all year levels)
 * - Page load without errors
 * - Hero section and stat cards
 * - Section headings
 * - SVG charts render
 * - Chart controls (area, year level, rate type, groupBy, year)
 */
import { test, expect } from '@playwright/test';

// ─── API tests ──────────────────────────────────────────────────────────────────

test.describe('/api/nzqa/literacy-numeracy', () => {
  test('national numeracy Year 11 returns valid data', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const first = json.data[0] as Record<string, unknown>;
    expect(first).toHaveProperty('year');
    expect(first).toHaveProperty('current_attainment_rate');
    expect(first).toHaveProperty('cumulative_attainment_rate');
    expect(first).toHaveProperty('total_count');
  });

  test('national literacy Year 11 returns valid data', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=literacy&yearLevel=11&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  test('covers full 2009–2024 range', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    const years = (json.data as Array<{ year: number }>).map((d) => d.year);
    expect(years).toContain(2009);
    expect(years).toContain(2024);
    expect(years.length).toBeGreaterThanOrEqual(16);
  });

  test('Year 12 returns valid data', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=12&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.yearLevel).toBe(12);
  });

  test('Year 13 returns valid data', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=literacy&yearLevel=13&groupBy=national');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  test('ethnicity groupBy returns group_label', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=ethnicity');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    const first = json.data[0] as Record<string, unknown>;
    expect(first).toHaveProperty('group_label');
    expect(json.groupBy).toBe('ethnicity');
  });

  test('equity_index_group returns results', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=equity_index_group&yearFrom=2022&yearTo=2024');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  test('gender groupBy returns Female and Male', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=gender');
    expect(res.status()).toBe(200);
    const json = await res.json();
    const labels = (json.data as Array<{ group_label: string }>).map((d) => d.group_label);
    expect(labels.includes('Female') || labels.includes('Male')).toBe(true);
  });

  test('region groupBy returns Auckland', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=region&yearFrom=2024&yearTo=2024');
    expect(res.status()).toBe(200);
    const json = await res.json();
    const labels = (json.data as Array<{ group_label: string }>).map((d) => d.group_label);
    expect(labels).toContain('Auckland');
  });

  test('yearFrom/yearTo filtering works', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=national&yearFrom=2020&yearTo=2022');
    expect(res.status()).toBe(200);
    const json = await res.json();
    const years = (json.data as Array<{ year: number }>).map((d) => d.year);
    expect(years.every((y) => y >= 2020 && y <= 2022)).toBe(true);
    expect(years.length).toBe(3);
  });

  test('invalid area returns 400', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=science&yearLevel=11&groupBy=national');
    expect(res.status()).toBe(400);
  });

  test('invalid yearLevel returns 400', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=10&groupBy=national');
    expect(res.status()).toBe(400);
  });

  test('invalid groupBy returns 400', async ({ request }) => {
    const res = await request.get('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=invalid');
    expect(res.status()).toBe(400);
  });
});

// ─── Page-level ────────────────────────────────────────────────────────────────

test.describe('/nzqa-literacy-numeracy page', () => {
  test('loads without console errors', async ({ page }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    const api404s: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('response', (r) => {
      if (r.status() === 404 && !r.url().includes('/_next/')) api404s.push(r.url());
    });

    await page.goto('/nzqa-literacy-numeracy');
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
    await page.goto('/nzqa-literacy-numeracy');
    await page.waitForSelector('h1', { timeout: 20000 });
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=The floor is falling').first()).toBeVisible();
  });

  test('section headings are present', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-literacy-numeracy');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=16 years of literacy').first()).toBeVisible();
    await expect(page.locator('text=Who is being left behind').first()).toBeVisible();
  });

  test('at least 1 SVG chart renders after load', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-literacy-numeracy');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForSelector('svg', { timeout: 20000 });

    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('stat cards are visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/nzqa-literacy-numeracy');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForTimeout(2000);

    await expect(page.locator('text=56%').first()).toBeVisible();
    await expect(page.locator('text=16 yrs').first()).toBeVisible();
  });
});

// ─── LiteracyNumeracyTrendChart ────────────────────────────────────────────────

test.describe('LiteracyNumeracyTrendChart', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/nzqa-literacy-numeracy');
    await page.waitForSelector('h1', { timeout: 20000 });
    await page.waitForSelector('button:has-text("Both")', { timeout: 20000 });
  });

  test('Both/Literacy/Numeracy area toggles are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Both")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Literacy")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Numeracy")').first()).toBeVisible();
  });

  test('Year 11/12/13 toggles are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Year 11")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Year 12")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Year 13")').first()).toBeVisible();
  });

  test('Current year / Cumulative toggles are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Current year")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Cumulative")').first()).toBeVisible();
  });

  test('switching to Cumulative view works', async ({ page }) => {
    await page.locator('button:has-text("Cumulative")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('switching to Year 12 works', async ({ page }) => {
    await page.locator('button:has-text("Year 12")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('By Ethnicity view toggle works', async ({ page }) => {
    // First switch to Numeracy-only (required for group view)
    await page.locator('button:has-text("Numeracy")').first().click();
    await page.locator('button:has-text("By Ethnicity")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('By Gender view toggle works', async ({ page }) => {
    await page.locator('button:has-text("Numeracy")').first().click();
    await page.locator('button:has-text("By Gender")').first().click();
    await page.waitForSelector('svg', { timeout: 15000 });
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ─── LiteracyNumeracyBreakdownChart ────────────────────────────────────────────

test.describe('LiteracyNumeracyBreakdownChart', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/nzqa-literacy-numeracy');
    await page.waitForSelector('h1', { timeout: 20000 });
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

test.describe('Home page literacy-numeracy nav card', () => {
  test('nav card is visible', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('text=NZ Literacy & Numeracy Explorer').first()).toBeVisible();
  });

  test('nav card links to /nzqa-literacy-numeracy', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');
    await page.waitForSelector('h1', { timeout: 10000 });
    const link = page.locator('a[href="/nzqa-literacy-numeracy"]').first();
    await expect(link).toBeVisible();
  });
});
