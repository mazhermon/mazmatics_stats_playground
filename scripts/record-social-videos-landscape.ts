/**
 * Social media video recorder — Landscape edition (iPad horizontal)
 * Records all 15 videos at 1024×768 (iPad landscape) and saves as H.264 MP4.
 *
 * Run with: npm run record:social:landscape
 * Requires: dev server running on localhost:3001
 * Output: e2e/social-videos/landscape/
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = 'e2e/social-videos/landscape';
const VIEWPORT = { width: 1024, height: 768 };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ensureOutputDir(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function createContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: { dir: OUTPUT_DIR, size: VIEWPORT },
  });
}

function convertToMp4(webmPath: string, mp4Path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(webmPath)
      .videoCodec('libx264')
      .outputOptions(['-preset slow', '-crf 22', '-pix_fmt yuv420p'])
      .output(mp4Path)
      .on('end', () => { fs.unlinkSync(webmPath); resolve(); })
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

async function finishVideo(page: Page, context: BrowserContext, targetName: string): Promise<void> {
  const webmPath = await page.video()?.path();
  await page.close();
  await context.close();
  if (webmPath && fs.existsSync(webmPath)) {
    const mp4Path = path.join(OUTPUT_DIR, targetName);
    process.stdout.write('  → Converting to MP4...');
    await convertToMp4(webmPath, mp4Path);
    console.log(` ✓ ${mp4Path}`);
  } else {
    console.warn(`  ⚠ Video path not found for ${targetName}`);
  }
}

/** Wait for any SVG to contain rendered data elements */
async function waitForSvgData(page: Page, timeout = 15000): Promise<void> {
  await page.waitForFunction(
    () => {
      for (const svg of document.querySelectorAll('svg')) {
        if (
          svg.querySelectorAll('circle').length > 0 ||
          svg.querySelectorAll('rect').length > 2 ||
          svg.querySelectorAll('path[d]').length > 0
        ) return true;
      }
      return false;
    },
    { timeout }
  ).catch(() => console.warn('  ⚠ SVG data wait timed out'));
}

/** Smooth scroll and wait for it to settle */
async function smoothScrollTo(page: Page, y: number, waitMs = 1000): Promise<void> {
  await page.evaluate((scrollY: number) => window.scrollTo({ top: scrollY, behavior: 'smooth' }), y);
  await page.waitForTimeout(waitMs);
}

/** Click a button by text, scroll it into view, wait for chart to re-render */
async function clickFilterBtn(page: Page, label: RegExp | string, settleMs = 1800): Promise<void> {
  const btn = page.locator('button').filter({ hasText: label }).first();
  const visible = await btn.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
  if (visible) {
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(settleMs);
  } else {
    console.warn(`  ⚠ Button not found: ${label}`);
  }
}

/** Navigate and wait for h1 — retries on failure */
async function goToAndWait(page: Page, url: string, settleMs: number): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`  ↻ Reloading (attempt ${attempt + 1})...`);
      await page.reload({ waitUntil: 'domcontentloaded' });
    } else {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    }
    const found = await page.waitForSelector('h1', { timeout: 45000 }).catch(() => null);
    if (found) { await page.waitForTimeout(settleMs); return; }
  }
  console.warn('  ⚠ h1 not found after 3 attempts, proceeding anyway');
  await page.waitForTimeout(3000);
}

/** Poll HTTP until nzqa-maths returns 200 (triggers SSR compilation) */
async function waitForNzqaHttpReady(maxMs = 90000): Promise<void> {
  const url = `${BASE_URL}/nzqa-maths`;
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const status = await new Promise<number>((resolve) => {
      http.get(url, (res) => { res.destroy(); resolve(res.statusCode ?? 0); })
        .on('error', () => resolve(0));
    });
    if (status === 200) return;
    await new Promise<void>((r) => setTimeout(r, 2000));
  }
  console.warn('  ⚠ nzqa-maths HTTP warmup timed out');
}

/** Wait for a button with given text to appear anywhere on the page */
async function waitForButtonText(page: Page, text: string, timeout = 60000): Promise<boolean> {
  return page.waitForFunction(
    (t: string) => {
      for (const btn of document.querySelectorAll('button')) {
        if ((btn.textContent ?? '').includes(t)) return true;
      }
      return false;
    },
    text,
    { timeout }
  ).then(() => true).catch(() => false);
}

/** Warm up both pages — compiles dynamic chart chunks via real browser visit */
async function warmupPages(browser: Browser): Promise<void> {
  console.log('🔥 Warming up pages (compiling dynamic chart chunks)...');
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const pg = await ctx.newPage();

  process.stdout.write('   /nzqa-maths SSR ...');
  await waitForNzqaHttpReady(90000);
  console.log(' ok');

  process.stdout.write('   /nzqa-maths charts ...');
  await pg.goto(`${BASE_URL}/nzqa-maths`, { waitUntil: 'domcontentloaded' });
  await pg.evaluate(() => window.scrollTo({ top: 800 }));
  const nzqaOk = await waitForButtonText(pg, 'Fail rate', 90000);
  console.log(nzqaOk ? ' ready' : ' (timeout — proceeding)');

  process.stdout.write('   /primary-maths charts ...');
  await pg.goto(`${BASE_URL}/primary-maths`, { waitUntil: 'domcontentloaded' });
  await pg.evaluate(() => window.scrollTo({ top: 1200 }));
  const primaryOk = await waitForButtonText(pg, 'By ethnicity', 90000);
  console.log(primaryOk ? ' ready' : ' (timeout — proceeding)');

  await ctx.close();
  console.log('');
}

// ===========================================================================
// ROUND 1 VIDEOS (1–5) — landscape versions
// ===========================================================================

// ---------------------------------------------------------------------------
// Video 1 — "How NZ Kids Compare to the World" (TIMSS)
// At 1024px wide the page is ~40–60% as tall as mobile — halve scroll offsets
// ---------------------------------------------------------------------------
async function recordVideo1(browser: Browser): Promise<void> {
  console.log('\n📹 Video 1 — How NZ Kids Compare to the World (TIMSS)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 2000);

  // Scroll to TIMSS World Ranking
  await smoothScrollTo(page, 700, 3000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2000);

  // Scroll up to TIMSS Trend Chart
  await smoothScrollTo(page, 200, 2000);
  await page.waitForTimeout(3000);
  await smoothScrollTo(page, 0, 1000);
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-1-timss-world.mp4');
}

// ---------------------------------------------------------------------------
// Video 2 — "The Gap That Shouldn't Exist" (NMSSA Equity)
// ---------------------------------------------------------------------------
async function recordVideo2(browser: Browser): Promise<void> {
  console.log('\n📹 Video 2 — The Gap That Shouldn\'t Exist (NMSSA Equity)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 2000);

  await smoothScrollTo(page, 1200, 3000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /by ethnicity/i, 2000);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by gender/i, 2000);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by decile/i, 2500);
  await page.waitForTimeout(2500);

  // Scroll to NMSSA Trend
  await smoothScrollTo(page, 1700, 1800);
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-2-nmssa-equity.mp4');
}

// ---------------------------------------------------------------------------
// Video 3 — "Year 8: Going Backwards" (NMSSA Trend)
// ---------------------------------------------------------------------------
async function recordVideo3(browser: Browser): Promise<void> {
  console.log('\n📹 Video 3 — Year 8: Going Backwards (NMSSA Trend)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 2000);

  await smoothScrollTo(page, 1600, 2000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /^year 4$/i, 2000);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /^year 8$/i, 2000);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by ethnicity/i, 2500);
  await page.waitForTimeout(3000);

  await smoothScrollTo(page, 1400, 1200);
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-3-nmssa-trend.mp4');
}

// ---------------------------------------------------------------------------
// Video 4 — "NZCEA: Not All Students Reach the Line" (NZQA Timeline)
// ---------------------------------------------------------------------------
async function recordVideo4(browser: Browser): Promise<void> {
  console.log('\n📹 Video 4 — NZCEA: Not All Students Reach the Line (NZQA Timeline)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 8000);

  await smoothScrollTo(page, 800, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await page.waitForTimeout(2500);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(2000);
  await page.waitForTimeout(4000);

  await finishVideo(page, context, 'video-4-nzqa-timeline.mp4');
}

// ---------------------------------------------------------------------------
// Video 5 — "Where in NZ?" (Regional Map)
// ---------------------------------------------------------------------------
async function recordVideo5(browser: Browser): Promise<void> {
  console.log('\n📹 Video 5 — Where in NZ? (Regional Map)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 8000);

  await smoothScrollTo(page, 2000, 2000);
  await page.waitForSelector('path.region', { timeout: 15000 }).catch(() =>
    console.warn('  ⚠ path.region not found')
  );
  await page.waitForTimeout(2500);

  // Hover over NZ regions — on landscape viewport the map is larger so coordinates shift
  await page.mouse.move(420, 320);
  await page.waitForTimeout(2000);
  await page.mouse.move(420, 260);
  await page.waitForTimeout(2000);
  await page.mouse.move(420, 480);
  await page.waitForTimeout(2500);
  await page.mouse.move(420, 380);
  await page.waitForTimeout(2000);
  await page.waitForTimeout(2000);

  await finishVideo(page, context, 'video-5-regional-map.mp4');
}

// ===========================================================================
// ROUND 2 VIDEOS (6–15) — landscape versions
// ===========================================================================

async function recordVideo6(browser: Browser): Promise<void> {
  console.log('\n📹 Video 6 — 10 Years of Failing (NZQA Timeline)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);
  await smoothScrollTo(page, 700, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2000);

  await clickFilterBtn(page, /fail rate/i, 2000);
  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await clickFilterBtn(page, /māori \/ non/i, 3000);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-6-fail-rate-ethnicity.mp4');
}

async function recordVideo7(browser: Browser): Promise<void> {
  console.log('\n📹 Video 7 — Who Gets Merit & Excellence?');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);
  await smoothScrollTo(page, 700, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2000);

  await clickFilterBtn(page, /merit.*excellence/i, 2500);
  await clickFilterBtn(page, /^national$/i, 2500);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await page.waitForTimeout(3000);
  await clickFilterBtn(page, /by equity/i, 3000);
  await page.waitForTimeout(2000);

  await finishVideo(page, context, 'video-7-merit-excellence-ethnicity.mp4');
}

async function recordVideo8(browser: Browser): Promise<void> {
  console.log('\n📹 Video 8 — The Gender Gap in NZ Maths');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);
  await smoothScrollTo(page, 100, 1500);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(1500);

  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(2000);

  await smoothScrollTo(page, 1200, 2000);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(2500);

  await smoothScrollTo(page, 1600, 1800);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-8-gender-gap.mp4');
}

async function recordVideo9(browser: Browser): Promise<void> {
  console.log('\n📹 Video 9 — The Decile Divide');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);
  await smoothScrollTo(page, 1200, 2000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2000);

  await clickFilterBtn(page, /by ethnicity/i, 2500);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by decile/i, 3000);
  await page.waitForTimeout(4000);

  await smoothScrollTo(page, 1600, 1800);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /by decile/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-9-decile-divide.mp4');
}

async function recordVideo10(browser: Browser): Promise<void> {
  console.log('\n📹 Video 10 — The 3D Achievement Landscape');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);
  await smoothScrollTo(page, 2800, 2000);
  await page.waitForSelector('canvas', { timeout: 15000 }).catch(() =>
    console.warn('  ⚠ canvas not found')
  );
  await page.waitForTimeout(3000);

  const canvasEl = page.locator('canvas').first();
  const box = await canvasEl.boundingBox().catch(() => null);
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx + 120, cy);
    await page.mouse.down();
    await page.waitForTimeout(200);
    for (let i = 0; i < 80; i++) {
      await page.mouse.move(cx + 120 - i * 2.5, cy, { steps: 1 });
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
    await page.waitForTimeout(2000);
    await page.mouse.move(cx, cy + 80);
    await page.mouse.down();
    await page.waitForTimeout(200);
    for (let i = 0; i < 30; i++) {
      await page.mouse.move(cx, cy + 80 - i * 2, { steps: 1 });
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
  }
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-10-3d-landscape.mp4');
}

async function recordVideo11(browser: Browser): Promise<void> {
  console.log('\n📹 Video 11 — Year 4 to Year 8: What Happens?');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);
  await smoothScrollTo(page, 1600, 2000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2000);

  await clickFilterBtn(page, /^year 4$/i, 2500);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /^year 8$/i, 2500);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await page.waitForTimeout(3000);
  await clickFilterBtn(page, /^year 4$/i, 2500);
  await page.waitForTimeout(2500);

  await finishVideo(page, context, 'video-11-year4-vs-year8.mp4');
}

async function recordVideo12(browser: Browser): Promise<void> {
  console.log('\n📹 Video 12 — Where Do Students Land? (Grade Stack)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);
  await smoothScrollTo(page, 1400, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /^national$/i, 2000);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await page.waitForTimeout(3000);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(3000);
  await clickFilterBtn(page, /by equity/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-12-grade-stack.mp4');
}

async function recordVideo13(browser: Browser): Promise<void> {
  console.log('\n📹 Video 13 — Year-on-Year Change (Delta Chart)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);
  await smoothScrollTo(page, 1800, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /^national$/i, 2000);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await page.waitForTimeout(3500);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-13-delta-chart.mp4');
}

async function recordVideo14(browser: Browser): Promise<void> {
  console.log('\n📹 Video 14 — The Primary Pipeline (Curriculum Insights)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);
  await smoothScrollTo(page, 2100, 2000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /2023/i, 2500);
  await page.waitForTimeout(2500);
  await clickFilterBtn(page, /2024/i, 3000);
  await page.waitForTimeout(3000);

  await smoothScrollTo(page, 1900, 1200);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-14-curriculum-pipeline.mp4');
}

async function recordVideo15(browser: Browser): Promise<void> {
  console.log('\n📹 Video 15 — Compare Groups: The Heatmap');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);
  await smoothScrollTo(page, 3400, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /ethnicity/i, 2500);
  await page.waitForTimeout(2500);
  await clickFilterBtn(page, /equity group/i, 2500);
  await page.waitForTimeout(2500);
  await clickFilterBtn(page, /gender/i, 2500);
  await page.waitForTimeout(2500);
  await clickFilterBtn(page, /region/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-15-comparison-heatmap.mp4');
}

// ===========================================================================
// Main
// ===========================================================================
async function main(): Promise<void> {
  await ensureOutputDir();

  console.log('🎬 Mazmatics Social Video Recorder — Landscape Edition');
  console.log(`   Target:   ${BASE_URL}`);
  console.log(`   Output:   ${OUTPUT_DIR}`);
  console.log(`   Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @2x (iPad landscape)`);
  console.log(`   Format:   H.264 MP4\n`);

  const browser = await chromium.launch({ headless: true });
  const recordings = [
    recordVideo1, recordVideo2, recordVideo3, recordVideo4, recordVideo5,
    recordVideo6, recordVideo7, recordVideo8, recordVideo9, recordVideo10,
    recordVideo11, recordVideo12, recordVideo13, recordVideo14, recordVideo15,
  ];
  let passed = 0;
  let failed = 0;

  try {
    await warmupPages(browser);
    for (const record of recordings) {
      try {
        await record(browser);
        passed++;
      } catch (err) {
        console.error(`  ❌ Video failed: ${(err as Error).message}`);
        failed++;
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${passed === 15 ? '✅' : '⚠'} ${passed}/15 videos recorded`);
  if (failed > 0) console.log(`   ${failed} failed — check warnings above`);
  console.log(`   Find them in: ${OUTPUT_DIR}/`);
}

main().catch((err: unknown) => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
