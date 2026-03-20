/**
 * Social media video recorder for Mazmatics Stats
 * Records 5 short Playwright video clips of interactive charts at mobile viewport.
 *
 * Run with: npm run record:social
 * Requires: dev server running on localhost:3001
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = 'e2e/social-videos';
const VIEWPORT = { width: 390, height: 844 };

async function ensureOutputDir(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function createContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: VIEWPORT,
    },
  });
}

async function finishVideo(page: Page, context: BrowserContext, targetName: string): Promise<void> {
  const videoPath = await page.video()?.path();
  await page.close();
  await context.close();
  if (videoPath && fs.existsSync(videoPath)) {
    const target = path.join(OUTPUT_DIR, targetName);
    fs.renameSync(videoPath, target);
    console.log(`  ✓ Saved: ${target}`);
  } else {
    console.warn(`  ⚠ Video path not found for ${targetName}`);
  }
}

// ---------------------------------------------------------------------------
// Video 1 — "How NZ Kids Compare to the World" (TIMSS)
// ---------------------------------------------------------------------------
async function recordVideo1(browser: Browser): Promise<void> {
  console.log('\n📹 Video 1 — How NZ Kids Compare to the World (TIMSS)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/primary-maths`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Scroll down to TIMSS World Ranking section
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'smooth' }));
  await page.waitForTimeout(3000);

  // Scroll up slowly to TIMSS Trend Chart
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(3000);

  // Hold on trend chart
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-1-timss-world.webm');
}

// ---------------------------------------------------------------------------
// Video 2 — "The Gap That Shouldn't Exist" (NMSSA Equity)
// ---------------------------------------------------------------------------
async function recordVideo2(browser: Browser): Promise<void> {
  console.log('\n📹 Video 2 — The Gap That Shouldn\'t Exist (NMSSA Equity)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/primary-maths`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Scroll to NMSSA Equity section
  await page.evaluate(() => window.scrollTo({ top: 2500, behavior: 'smooth' }));
  await page.waitForTimeout(3000);

  // Click Gender button
  const genderBtn = page.getByRole('button', { name: /gender/i }).first();
  if (await genderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await genderBtn.click();
    await page.waitForTimeout(2000);
  }

  // Click Decile button
  const decileBtn = page.getByRole('button', { name: /decile/i }).first();
  if (await decileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await decileBtn.click();
    await page.waitForTimeout(3000);
  }

  // Scroll to NMSSA Trend Chart
  await page.evaluate(() => window.scrollTo({ top: 3200, behavior: 'smooth' }));
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-2-nmssa-equity.webm');
}

// ---------------------------------------------------------------------------
// Video 3 — "Year 8: Going Backwards" (NMSSA Trend)
// ---------------------------------------------------------------------------
async function recordVideo3(browser: Browser): Promise<void> {
  console.log('\n📹 Video 3 — Year 8: Going Backwards (NMSSA Trend)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/primary-maths`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Scroll to NMSSA Trend section
  await page.evaluate(() => window.scrollTo({ top: 3200, behavior: 'smooth' }));
  await page.waitForTimeout(3000);

  // Click Year 8 tab
  const yr8Tab = page.getByRole('button', { name: /year 8/i }).first();
  if (await yr8Tab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await yr8Tab.click();
    await page.waitForTimeout(2000);
  }

  // Click By ethnicity tab if available
  const ethnicityTab = page.getByRole('button', { name: /ethnicity/i }).first();
  if (await ethnicityTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ethnicityTab.click();
    await page.waitForTimeout(3000);
  }

  // Scroll up slightly to frame chart
  await page.evaluate((y: number) => window.scrollTo({ top: y, behavior: 'smooth' }), 2900);
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-3-nmssa-trend.webm');
}

// ---------------------------------------------------------------------------
// Video 4 — "NZCEA: Not All Students Reach the Line" (NZQA Timeline)
// ---------------------------------------------------------------------------
async function recordVideo4(browser: Browser): Promise<void> {
  console.log('\n📹 Video 4 — NZCEA: Not All Students Reach the Line (NZQA Timeline)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/nzqa-maths`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 20000 });
  // Allow data fetches to settle
  await page.waitForTimeout(8000);

  // Scroll to TimelineExplorer section
  await page.evaluate(() => window.scrollTo({ top: 1800, behavior: 'smooth' }));
  await page.waitForTimeout(3000);

  // Click Ethnicity group button
  const ethnicityBtn = page.getByRole('button', { name: /ethnicity/i }).first();
  if (await ethnicityBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ethnicityBtn.click();
    await page.waitForTimeout(3000);
  }

  // Click Gender group button
  const genderBtn = page.getByRole('button', { name: /gender/i }).first();
  if (await genderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await genderBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-4-nzqa-timeline.webm');
}

// ---------------------------------------------------------------------------
// Video 5 — "Where in NZ?" (Regional Map)
// ---------------------------------------------------------------------------
async function recordVideo5(browser: Browser): Promise<void> {
  console.log('\n📹 Video 5 — Where in NZ? (Regional Map)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/nzqa-maths`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 20000 });
  await page.waitForTimeout(8000);

  // Scroll to Regional Map section
  await page.evaluate(() => window.scrollTo({ top: 3500, behavior: 'smooth' }));

  // Wait for map paths to be present
  await page.waitForSelector('path.region', { timeout: 15000 }).catch(() => {
    console.warn('  ⚠ path.region not found, continuing anyway');
  });
  await page.waitForTimeout(3000);

  // Hover over Auckland
  await page.mouse.move(195, 400);
  await page.waitForTimeout(2000);

  // Hover over Northland
  await page.mouse.move(195, 330);
  await page.waitForTimeout(2000);

  // Hover over Canterbury
  await page.mouse.move(195, 600);
  await page.waitForTimeout(3000);

  await page.waitForTimeout(2000);

  await finishVideo(page, context, 'video-5-regional-map.webm');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  await ensureOutputDir();

  console.log('🎬 Mazmatics Social Video Recorder');
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @2x\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    await recordVideo1(browser);
    await recordVideo2(browser);
    await recordVideo3(browser);
    await recordVideo4(browser);
    await recordVideo5(browser);
  } finally {
    await browser.close();
  }

  console.log('\n✅ All 5 videos recorded successfully');
  console.log(`   Find them in: ${OUTPUT_DIR}/`);
}

main().catch((err: unknown) => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
