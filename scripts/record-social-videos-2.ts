/**
 * Social media video recorder — Round 2 (10 videos, MP4 output)
 * Records 10 short Playwright clips at mobile viewport, converts to H.264 MP4.
 *
 * Run with: npm run record:social2
 * Requires: dev server running on localhost:3001
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = 'e2e/social-videos';
const VIEWPORT = { width: 390, height: 844 };

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
    recordVideo: {
      dir: OUTPUT_DIR,
      size: VIEWPORT,
    },
  });
}

function convertToMp4(webmPath: string, mp4Path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(webmPath)
      .videoCodec('libx264')
      .outputOptions(['-preset slow', '-crf 22', '-pix_fmt yuv420p'])
      .output(mp4Path)
      .on('end', () => {
        fs.unlinkSync(webmPath);
        resolve();
      })
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
    console.log(`  → Converting to MP4...`);
    await convertToMp4(webmPath, mp4Path);
    console.log(`  ✓ Saved: ${mp4Path}`);
  } else {
    console.warn(`  ⚠ Video path not found for ${targetName}`);
  }
}

/** Wait for an SVG to contain rendered data elements (not just an empty svg shell) */
async function waitForSvgData(page: Page, timeout = 15000): Promise<void> {
  await page.waitForFunction(
    () => {
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
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

/** Smooth scroll to a Y position and wait for it to settle */
async function smoothScrollTo(page: Page, y: number, waitMs = 1200): Promise<void> {
  await page.evaluate((scrollY: number) => window.scrollTo({ top: scrollY, behavior: 'smooth' }), y);
  await page.waitForTimeout(waitMs);
}

/** Click a button by text and wait for chart to re-render */
async function clickFilterBtn(page: Page, label: RegExp | string, settleMs = 1800): Promise<void> {
  const btn = page.locator('button').filter({ hasText: label }).first();
  // Wait up to 15s for lazy-loaded components to mount and become visible
  const visible = await btn.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
  if (visible) {
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(settleMs);
  } else {
    console.warn(`  ⚠ Button not found: ${label}`);
  }
}

/**
 * Navigate to a URL and wait for h1 to appear.
 * - nzqa-maths: SSR works when page.js is compiled → h1 appears fast
 * - primary-maths: SSR returns 500 but React CSR still renders → h1 appears in ~5–20s
 * Retries up to 3x with reload on failure. Never throws — logs warning and continues.
 */
async function goToAndWait(page: Page, url: string, settleMs: number): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`  ↻ Reloading (attempt ${attempt + 1})...`);
      await page.reload({ waitUntil: 'domcontentloaded' });
    } else {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    }
    const found = await page.waitForSelector('h1', { timeout: 45000 }).catch(() => null);
    if (found) {
      await page.waitForTimeout(settleMs);
      return;
    }
  }
  console.warn('  ⚠ h1 not found after 3 attempts, proceeding with blank video');
  await page.waitForTimeout(3000);
}

/**
 * Poll via HTTP until the nzqa-maths page returns 200.
 * Triggers Next.js SSR compilation on first request; polls until the page.js is compiled.
 * Not needed for primary-maths (CSR renders fine even when server returns 500).
 */
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
  // Don't throw — just warn and proceed; CSR may still render
  console.warn('  ⚠ nzqa-maths HTTP warmup timed out — proceeding anyway');
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

/**
 * Warm up both pages to trigger Next.js dynamic import compilation.
 * Charts use dynamic() with ssr: false — first browser visit compiles the chunk.
 * We must wait for actual chart content (not just h1) to confirm compilation is done.
 */
async function warmupPages(browser: Browser): Promise<void> {
  console.log('🔥 Warming up pages (compiling dynamic chart chunks)...');
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const pg = await ctx.newPage();

  // nzqa-maths: also ensure HTTP SSR is compiled first
  process.stdout.write('   /nzqa-maths SSR ...');
  await waitForNzqaHttpReady(90000);
  console.log(' ok');

  // Load nzqa-maths and wait for TimelineExplorer buttons (confirms chunk compiled)
  process.stdout.write('   /nzqa-maths charts ...');
  await pg.goto(`${BASE_URL}/nzqa-maths`, { waitUntil: 'domcontentloaded' });
  await pg.evaluate(() => window.scrollTo({ top: 1400 }));
  const nzqaOk = await waitForButtonText(pg, 'Fail rate', 90000);
  console.log(nzqaOk ? ' ready' : ' (timeout — proceeding)');

  // primary-maths: wait for NMSSA equity buttons (confirms NMSSAEquityGaps compiled)
  process.stdout.write('   /primary-maths charts ...');
  await pg.goto(`${BASE_URL}/primary-maths`, { waitUntil: 'domcontentloaded' });
  await pg.evaluate(() => window.scrollTo({ top: 2300 }));
  const primaryOk = await waitForButtonText(pg, 'By ethnicity', 90000);
  console.log(primaryOk ? ' ready' : ' (timeout — proceeding)');

  await ctx.close();
  console.log('');
}

// ---------------------------------------------------------------------------
// Video 6 — "10 Years of Failing" (NZQA Timeline — Fail Rate + Ethnicity)
// ---------------------------------------------------------------------------
async function recordVideo6(browser: Browser): Promise<void> {
  console.log('\n📹 Video 6 — 10 Years of Failing (NZQA Timeline)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);

  // Scroll to just above TimelineExplorer so controls + chart are in view
  await smoothScrollTo(page, 1400, 2000);
  await waitForSvgData(page, 15000);
  await page.waitForTimeout(2000);

  // Fail rate is default — explicitly click to confirm, then switch views
  await clickFilterBtn(page, /fail rate/i, 2000);
  await clickFilterBtn(page, /by ethnicity/i, 3000);
  await clickFilterBtn(page, /māori \/ non/i, 3000);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-6-fail-rate-ethnicity.mp4');
}

// ---------------------------------------------------------------------------
// Video 7 — "Who Gets Merit & Excellence?" (NZQA Timeline — top achievement)
// ---------------------------------------------------------------------------
async function recordVideo7(browser: Browser): Promise<void> {
  console.log('\n📹 Video 7 — Who Gets Merit & Excellence? (NZQA Timeline)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);

  await smoothScrollTo(page, 1400, 2000);
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

// ---------------------------------------------------------------------------
// Video 8 — "The Gender Gap in NZ Maths" (TIMSS By gender → NMSSA By gender)
// ---------------------------------------------------------------------------
async function recordVideo8(browser: Browser): Promise<void> {
  console.log('\n📹 Video 8 — The Gender Gap in NZ Maths');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);

  // TIMSS Trend chart at top of page
  await smoothScrollTo(page, 200, 1500);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(1500);

  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(2000);

  // NMSSA Equity Gaps
  await smoothScrollTo(page, 2300, 2000);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(2500);

  // NMSSA Trend
  await smoothScrollTo(page, 3000, 1800);
  await clickFilterBtn(page, /by gender/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-8-gender-gap.mp4');
}

// ---------------------------------------------------------------------------
// Video 9 — "The Decile Divide" (NMSSA Equity Gaps — By decile focus)
// ---------------------------------------------------------------------------
async function recordVideo9(browser: Browser): Promise<void> {
  console.log('\n📹 Video 9 — The Decile Divide (NMSSA Equity)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);

  await smoothScrollTo(page, 2300, 2000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2000);

  await clickFilterBtn(page, /by ethnicity/i, 2500);
  await page.waitForTimeout(2000);
  await clickFilterBtn(page, /by decile/i, 3000);
  await page.waitForTimeout(4000);

  await smoothScrollTo(page, 3000, 1800);
  await page.waitForTimeout(1500);
  await clickFilterBtn(page, /by decile/i, 2500);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-9-decile-divide.mp4');
}

// ---------------------------------------------------------------------------
// Video 10 — "The 3D Achievement Landscape" (AchievementLandscape Three.js)
// ---------------------------------------------------------------------------
async function recordVideo10(browser: Browser): Promise<void> {
  console.log('\n📹 Video 10 — The 3D Achievement Landscape (Three.js)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);

  // Scroll to AchievementLandscape section (Three.js canvas)
  await smoothScrollTo(page, 4800, 2000);

  // Wait for canvas to appear
  await page.waitForSelector('canvas', { timeout: 15000 }).catch(() =>
    console.warn('  ⚠ canvas not found')
  );
  await page.waitForTimeout(3000); // let 3D scene initialise + bars animate

  // Slow drag to rotate the scene
  const canvasEl = page.locator('canvas').first();
  const box = await canvasEl.boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // Drag left to rotate
    await page.mouse.move(cx + 80, cy);
    await page.mouse.down();
    await page.waitForTimeout(200);
    for (let i = 0; i < 60; i++) {
      await page.mouse.move(cx + 80 - i * 2.5, cy, { steps: 1 });
      await page.waitForTimeout(50);
    }
    await page.mouse.up();
    await page.waitForTimeout(2000);
    // Drag up slightly to see from above
    await page.mouse.move(cx, cy + 60);
    await page.mouse.down();
    await page.waitForTimeout(200);
    for (let i = 0; i < 30; i++) {
      await page.mouse.move(cx, cy + 60 - i * 2, { steps: 1 });
      await page.waitForTimeout(50);
    }
    await page.mouse.up();
  }
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-10-3d-landscape.mp4');
}

// ---------------------------------------------------------------------------
// Video 11 — "Year 4 to Year 8: What Happens?" (NMSSA Trend comparison)
// ---------------------------------------------------------------------------
async function recordVideo11(browser: Browser): Promise<void> {
  console.log('\n📹 Video 11 — Year 4 to Year 8: What Happens?');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);

  await smoothScrollTo(page, 3000, 2000);
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

// ---------------------------------------------------------------------------
// Video 12 — "Where Do Students Land?" (GradeStackChart — by ethnicity)
// ---------------------------------------------------------------------------
async function recordVideo12(browser: Browser): Promise<void> {
  console.log('\n📹 Video 12 — Where Do Students Land? (NZQA Grade Stack)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);

  await smoothScrollTo(page, 2600, 2000);
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

// ---------------------------------------------------------------------------
// Video 13 — "Year-on-Year: Who's Gaining, Who's Not?" (DeltaChart)
// ---------------------------------------------------------------------------
async function recordVideo13(browser: Browser): Promise<void> {
  console.log('\n📹 Video 13 — Year-on-Year Change (NZQA Delta Chart)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);

  await smoothScrollTo(page, 3400, 2000);
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

// ---------------------------------------------------------------------------
// Video 14 — "The Primary Pipeline" (CurriculumInsightsPipeline 2023→2024)
// ---------------------------------------------------------------------------
async function recordVideo14(browser: Browser): Promise<void> {
  console.log('\n📹 Video 14 — The Primary Pipeline (Curriculum Insights)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/primary-maths`, 3000);

  await smoothScrollTo(page, 3800, 2000);
  await waitForSvgData(page, 12000);
  await page.waitForTimeout(2500);

  await clickFilterBtn(page, /2023/i, 2500);
  await page.waitForTimeout(2500);
  await clickFilterBtn(page, /2024/i, 3000);
  await page.waitForTimeout(3000);

  await smoothScrollTo(page, 3600, 1200);
  await page.waitForTimeout(3000);

  await finishVideo(page, context, 'video-14-curriculum-pipeline.mp4');
}

// ---------------------------------------------------------------------------
// Video 15 — "Compare Groups: The Heatmap" (ComparisonDashboard)
// ---------------------------------------------------------------------------
async function recordVideo15(browser: Browser): Promise<void> {
  console.log('\n📹 Video 15 — Compare Groups: The Heatmap (NZQA Dashboard)');
  const context = await createContext(browser);
  const page = await context.newPage();

  await goToAndWait(page, `${BASE_URL}/nzqa-maths`, 10000);

  // ComparisonDashboard is near the bottom — scroll deep
  await smoothScrollTo(page, 6000, 2000);
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  await ensureOutputDir();

  console.log('🎬 Mazmatics Social Video Recorder — Round 2');
  console.log(`   Target:   ${BASE_URL}`);
  console.log(`   Output:   ${OUTPUT_DIR}`);
  console.log(`   Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @2x`);
  console.log(`   Format:   H.264 MP4 (via ffmpeg-static)\n`);

  const browser = await chromium.launch({ headless: true });

  const recordings = [
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

  console.log(`\n${passed === 10 ? '✅' : '⚠'} ${passed}/10 videos recorded`);
  if (failed > 0) console.log(`   ${failed} failed — check warnings above`);
  console.log(`   Find them in: ${OUTPUT_DIR}/`);
}

main().catch((err: unknown) => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
