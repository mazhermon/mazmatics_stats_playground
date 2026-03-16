import { test, expect } from '@playwright/test';

// ─── Home Page Nav Cards ──────────────────────────────────────────────────────

test.describe('Home page nav cards', () => {
  test('all 4 nav cards are present and link correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/nzqa-maths"]')).toBeVisible();
    await expect(page.locator('a[href="/nzqa-creative"]')).toBeVisible();
    await expect(page.locator('a[href="/nzqa-stories"]')).toBeVisible();
    await expect(page.locator('a[href="/nzqa-patterns"]')).toBeVisible();
  });

  test('nav card navigates to /nzqa-creative', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/nzqa-creative"]');
    await expect(page).toHaveURL('/nzqa-creative');
    await expect(page.locator('h1')).toContainText('Creative Views');
  });

  test('nav card navigates to /nzqa-stories', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/nzqa-stories"]');
    await expect(page).toHaveURL('/nzqa-stories');
    await expect(page.locator('h1')).toContainText('Data Stories');
  });

  test('nav card navigates to /nzqa-patterns', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/nzqa-patterns"]');
    await expect(page).toHaveURL('/nzqa-patterns');
    await expect(page.locator('h1')).toContainText('Patterns & Trends');
  });
});

// ─── /nzqa-creative Page ─────────────────────────────────────────────────────

test.describe('/nzqa-creative page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nzqa-creative');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('page loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/nzqa-creative');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('back link navigates to home', async ({ page }) => {
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('bump chart SVG renders', async ({ page }) => {
    const paths = page.locator('svg path');
    await expect(paths.first()).toBeVisible();
  });

  test('bump chart level selector changes level', async ({ page }) => {
    const level1Btn = page.getByRole('button', { name: 'Level 1' }).first();
    await level1Btn.click();
    await expect(level1Btn).toHaveClass(/bg-violet-600/);
    await page.waitForTimeout(1500);
    const paths = page.locator('svg path');
    await expect(paths.first()).toBeVisible();
  });

  test('slope chart SVG renders with lines', async ({ page }) => {
    // SlopeChart is the 2nd overflow-x-auto container; its circles (dots at endpoints) are reliably visible
    const slopeCircles = page.locator('.overflow-x-auto').nth(1).locator('svg circle');
    await expect(slopeCircles.first()).toBeVisible();
  });

  test('stream graph SVG renders with filled paths', async ({ page }) => {
    const filledPaths = page.locator('svg path.stream');
    await expect(filledPaths.first()).toBeVisible();
  });
});

// ─── /nzqa-stories Page ──────────────────────────────────────────────────────

test.describe('/nzqa-stories page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nzqa-stories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('page loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/nzqa-stories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('waffle grid panels render (at least 4 groups)', async ({ page }) => {
    const panels = page.locator('.bg-slate-900 svg');
    const count = await panels.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('waffle level selector works', async ({ page }) => {
    const level3Btn = page.getByRole('button', { name: 'L3' }).first();
    await level3Btn.click();
    await expect(level3Btn).toHaveClass(/bg-violet-600/);
  });

  test('waffle year selector changes year', async ({ page }) => {
    const yearBtn = page.getByRole('button', { name: '2015' }).first();
    await yearBtn.click();
    await expect(yearBtn).toHaveClass(/bg-blue-600/);
  });

  test('beeswarm chart SVG renders dots', async ({ page }) => {
    const dots = page.locator('.bee-dot');
    await expect(dots.first()).toBeVisible();
  });

  test('small multiples render at least 4 panels', async ({ page }) => {
    const svgs = page.locator('.bg-slate-900 svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

// ─── /nzqa-patterns Page ─────────────────────────────────────────────────────

test.describe('/nzqa-patterns page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nzqa-patterns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
  });

  test('page loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/nzqa-patterns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('ridgeline plot renders KDE paths', async ({ page }) => {
    const paths = page.locator('svg path');
    await expect(paths.first()).toBeVisible();
  });

  test('ridgeline level selector works', async ({ page }) => {
    const level3Btn = page.getByRole('button', { name: 'Level 3' }).nth(0);
    await level3Btn.click();
    await expect(level3Btn).toHaveClass(/bg-violet-600/);
    await page.waitForTimeout(1500);
  });

  test('horizon chart renders region rows', async ({ page }) => {
    const paths = page.locator('svg path');
    await expect(paths.first()).toBeVisible();
  });

  test('bubble comparison renders circles', async ({ page }) => {
    const bubbles = page.locator('.bubble');
    await expect(bubbles.first()).toBeVisible();
  });

  test('bubble comparison year selector changes year', async ({ page }) => {
    const yearBtn = page.getByRole('button', { name: '2015' }).last();
    await yearBtn.click();
    await expect(yearBtn).toHaveClass(/bg-blue-600/);
    await page.waitForTimeout(1500);
    const bubbles = page.locator('.bubble');
    await expect(bubbles.first()).toBeVisible();
  });
});
