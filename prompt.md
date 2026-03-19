# Task: Phase 18 — Social Media Videos

## Context

Create short Instagram Reels-style video clips of the Mazmatics Stats site's best interactive charts at mobile size. Each clip shows real chart interactions (toggling between ethnicity, gender, decile breakdowns) to demonstrate the dynamic nature of the data explorer. The goal: recruit beta testers by showing what the site can do.

**Approach:** Playwright built-in video recording (`.webm` output — no ffmpeg required). Record at 390×844 (iPhone 14 Pro viewport). Each video is a scripted Playwright interaction sequence. Deliverables: `.webm` files in `e2e/social-videos/` + `socialpost.md` with Instagram post copy for each clip.

**Before starting:** Read `CLAUDE.md`. Check that the dev server is running on `localhost:3000`.

---

## Videos to Create

Create a Playwright script `scripts/record-social-videos.ts` (run with `npx ts-node scripts/record-social-videos.ts`) that records 5 videos. Each video should be 15–30 seconds.

### Video 1 — "How NZ Kids Compare to the World" (TIMSS)

**Page:** `/primary-maths` → TIMSS World Ranking section
**Viewport:** 390×844
**Interaction sequence:**
1. Navigate to `/primary-maths`
2. Scroll down to the TIMSS World Ranking chart (scroll ~1500px)
3. Wait 3s for chart to render (NZ highlighted in amber)
4. Scroll slowly up to TIMSS Trend Chart section
5. Wait 3s — NZ trend line visible, 1995–2023
6. Hold 4s to let the story sink in

**Story:** NZ was top-10 in 1995. We've slipped. Here's the data.

---

### Video 2 — "The Gap That Shouldn't Exist" (NMSSA Equity)

**Page:** `/primary-maths` → NMSSA Equity Gaps section
**Interaction sequence:**
1. Navigate to `/primary-maths`
2. Scroll to NMSSAEquityGaps chart (~2500px)
3. Wait 3s — "By ethnicity" shown by default (Year 4 vs Year 8)
4. Click "Gender" button — chart animates to gender breakdown
5. Wait 2s
6. Click "Decile" button — chart animates to decile breakdown
7. Wait 3s
8. Scroll to NMSSA Trend Chart
9. Wait 4s — show the trend lines declining

**Story:** It's not just one group. The gaps show up across ethnicity, gender, and school decile.

---

### Video 3 — "Year 8: Going Backwards" (NMSSA Trend)

**Page:** `/primary-maths` → NMSSA Trend Chart section
**Interaction sequence:**
1. Navigate to `/primary-maths`
2. Scroll to NMSSATrendChart section (~3200px)
3. Wait 3s — National trend visible, Y4 tab selected
4. Click "Year 8" tab
5. Wait 2s — Y8 decline from 2018→2022 highlighted
6. Click "By ethnicity" tab (if available)
7. Wait 3s — ethnicity lines diverging
8. Scroll up slightly to frame the chart
9. Hold 4s

**Story:** Year 8 national scores dropped from 2018 to 2022. Some groups more than others.

---

### Video 4 — "NZCEA: Not All Students Reach the Line" (NZQA Timeline)

**Page:** `/nzqa-maths` → TimelineExplorer section
**Interaction sequence:**
1. Navigate to `/nzqa-maths`
2. Wait for page to load (waitForSelector `h1`, then 8s settle time)
3. Scroll to TimelineExplorer section (~1800px)
4. Wait 3s — default metric visible (national trend)
5. Click "Ethnicity" group button (if visible in groupBy selector)
6. Wait 3s — multiple ethnicity lines appear
7. Click "Gender" group button
8. Wait 2s — gender split visible
9. Hold 4s

**Story:** NCEA maths achievement over time. Toggle by ethnicity and gender — the gaps are consistent.

---

### Video 5 — "Where in NZ?" (Regional Map)

**Page:** `/nzqa-maths` → Regional Map section
**Interaction sequence:**
1. Navigate to `/nzqa-maths`
2. Wait for page load + 8s settle
3. Scroll to RegionalMap section (~3500px)
4. Wait for `path.region` to be present
5. Wait 3s — NZ regions coloured by achievement rate
6. Hover over Auckland region (approximately x:195, y:400)
7. Wait 2s — tooltip shown
8. Hover over Northland (approximately x:195, y:330)
9. Wait 2s
10. Hover over Canterbury (approximately x:195, y:600)
11. Wait 3s
12. Hold 2s

**Story:** Achievement rates differ across New Zealand regions. Hover to explore.

---

## Implementation Details

### Playwright Video Config

```ts
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2, // retina
  recordVideo: {
    dir: 'e2e/social-videos/',
    size: { width: 390, height: 844 },
  },
});
```

### Output

Save videos as:
- `e2e/social-videos/video-1-timss-world.webm`
- `e2e/social-videos/video-2-nmssa-equity.webm`
- `e2e/social-videos/video-3-nmssa-trend.webm`
- `e2e/social-videos/video-4-nzqa-timeline.webm`
- `e2e/social-videos/video-5-regional-map.webm`

After `context.close()`, Playwright finalises the `.webm` file. Rename the auto-generated hash file to the correct name using `fs.renameSync`.

### Package.json script

Add: `"record:social": "npx ts-node --project tsconfig.node.json scripts/record-social-videos.ts"`

---

## socialpost.md

Create `socialpost.md` at the project root with 5 entries, one per video. Each entry:

```markdown
## Video N — [Title]

**File:** `e2e/social-videos/video-N-name.webm`
**Duration:** ~20s
**Text overlay suggestion:** (what to add in CapCut or DaVinci before posting)

**Instagram caption:**
[2–4 lines of NZ English copy, conversational, data-forward]
[Hashtags: #NZEducation #MathsNZ #OpenData #BetaTester #Mazmatics]

**CTA:** "Link in bio to explore the data yourself — we're in early beta and want your feedback 🙌"
```

---

## Acceptance Criteria

- [ ] `scripts/record-social-videos.ts` exists and is runnable
- [ ] `npm run record:social` is added to `package.json`
- [ ] 5 `.webm` files generated in `e2e/social-videos/` when script runs against live dev server
- [ ] Each video is 15–30 seconds long
- [ ] Videos recorded at 390×844 (mobile viewport)
- [ ] `socialpost.md` exists with 5 entries, one per video
- [ ] Each `socialpost.md` entry has: file path, text overlay suggestion, Instagram caption, CTA
- [ ] Script exits cleanly (no hanging processes)
- [ ] `tsc --noEmit` clean
- [ ] `npm run lint` clean

## Completion Promise

When all acceptance criteria are met, output the exact text:

<promise>SOCIAL_VIDEOS_COMPLETE</promise>
