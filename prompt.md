# Task: Build the /about Page — Phase 15

## Context
Read `brand.md` before writing any code. It contains the exact brand colours, fonts, tone of voice, design patterns, and implementation notes for this project.

The about page bridges two worlds:
- **Mazmatics** (the kids book — playful, warm, purple/blue gradient, graph-paper grid)
- **Mazmatics Stats** (this site — dark mode, data journalism, parents and academics)

The page audience is adults (parents, educators, academics) — NOT children. Tone is warm and conversational, never childish or corporate.

---

## Steps

### Step 1 — Read existing code before touching anything
Read these files first:
- `src/app/layout.tsx` — understand nav structure
- `src/components/layout/` — check for nav component (use Glob to find all files in this dir)
- `src/app/page.tsx` — understand home page card layout

Do NOT edit any file until you have read it.

### Step 2 — Check public/ for existing assets
Run: `ls public/` and `ls public/images/ 2>/dev/null || echo "no images dir"` to see what image assets exist. If a book cover image exists, use it. If not, use a styled placeholder div instead of a broken image.

### Step 3 — Build `src/app/about/page.tsx`

A **Server Component** (no `'use client'`). No D3, no Three.js, no dynamic imports needed.

#### Page sections (in order):

**1. Hero**
- Large `<h1>` with Mazmatics gradient text:
  `style={{ background: 'linear-gradient(to left, #BA90FF, #47A5F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}`
- Heading text: "About Mazmatics"
- Subheading (`text-slate-300 text-xl`): "Helping New Zealand kids — and the adults who care about them — say 'I like maths.'"
- Hero background: subtle graph-paper grid using CSS background-image with faint purple grid lines on slate-950. Apply via inline style on the hero section div:
  ```
  backgroundImage: 'linear-gradient(rgba(186,144,255,0.07) 1px, transparent 1px), linear-gradient(to right, rgba(186,144,255,0.07) 1px, transparent 1px)',
  backgroundSize: '32px 32px'
  ```
- A decorative row of 3 small diagonal-stripe SVG blocks below the subheading. Each block is an inline SVG (~80×40px) with 4 diagonal lines, stroke `#BA90FF` at 20% opacity. Apply a slow CSS drift animation (translateX 0→8px, 8s ease-in-out infinite alternate) via a `<style>` tag. Wrap in `@media (prefers-reduced-motion: no-preference)`.

**2. Stat callout row**
Three cards in a row (`grid grid-cols-1 sm:grid-cols-3 gap-4`):
- Card 1: Label "Based in" / Value "Wellington, NZ"
- Card 2: Label "Parent of" / Value "Two kids"
- Card 3: Label "Background" / Value "Web developer"

Card styles: `bg-slate-800/50 rounded-xl p-6` with `style={{ borderLeft: '4px solid #BA90FF' }}`
Label: `text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 block`
Value: `text-2xl font-bold text-white`

**3. The Book section**
- `<h2>` gradient text: "Where it all started"
- Two-column layout on md+: `grid md:grid-cols-2 gap-12 items-center`
- **Left — text:**
  - Para 1: Maz (a Wellington dad with a web developer background) wrote the book to help his two drawing-mad kids develop a positive attitude toward maths. It started as scribbles on paper and grew into a proper book.
  - Para 2: "Fun Math 4 Kids, Volume 1" is an activity and story book for ages 6+. It combines maths exercises with drawing, code-cracking, and a fantasy adventure featuring a character called Lindy on a quest. It's designed for home play, not homework — no answer pages, no pressure, no performance anxiety.
  - Para 3: The core belief: maths anxiety is learned, not innate. Kids who feel capable and curious about numbers carry that confidence into secondary school and beyond.
  - CTA: `<a href="https://mazmatics.com/get-the-book" target="_blank" rel="noopener noreferrer">Get the book →</a>` — styled as `inline-flex items-center gap-2 px-4 py-2 rounded-sm border text-sm font-medium transition-colors duration-200 cursor-pointer` with `style={{ borderColor: '#BA90FF', color: '#BA90FF' }}`. Add a hover class for background fill via Tailwind `hover:bg-[#BA90FF] hover:text-slate-950`.
- **Right — image:**
  - Check public/ first. If book cover image exists use `<Image>`. If not, use a styled placeholder:
    `<div className="bg-slate-800 rounded-xl w-[280px] h-[360px] mx-auto flex items-center justify-center text-slate-500 font-mono text-sm">Book cover</div>`
  - Either way, apply offset shadow: `style={{ boxShadow: '#BA90FF 12px 12px 0px 0px, #47A5F1 -12px -12px 0px 0px' }}`

**4. Why this data site? section**
- `<h2>` gradient text: "From a story book to a data story"
- 3 paragraphs, NZ English, honest and warm (not preachy):
  - Para 1: Writing the book started conversations with other parents and teachers. A recurring question came up: "How are NZ kids actually doing in maths?" The answer was surprisingly hard to find. The data exists — NZQA publishes it, TIMSS tracks it internationally — but it's buried in spreadsheets and PDFs.
  - Para 2: This site pulls that public data together and makes it explorable. Which groups of students are falling behind? How does New Zealand compare internationally? What changed after the 2024 NCEA reform? These questions matter for real kids in real classrooms.
  - Para 3: It's not an official government resource. It's one person's attempt to make important public data legible. If you find it useful — or find something wrong — please get in touch.

**5. The data section**
- `<h2>` gradient text: "The data behind the charts"
- One paragraph: "Everything on this site comes from public NZ government and international research datasets. Here's where it comes from:"
- 2×2 grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`), one card per source:
  - **NZQA Secondary Statistics** — "NCEA attainment by ethnicity, region, equity group, and gender. 2015–2024." Link: `https://www.nzqa.govt.nz/about-us/publications/statistics/`
  - **TIMSS International Study** — "NZ Year 5 maths scores since 1995. International comparison across 58 countries." Link: `https://timss2023.org`
  - **NMSSA Reports** — "National monitoring of Year 4 and Year 8 students. 2013, 2018, 2022." Link: `https://nmssa.otago.ac.nz`
  - **Curriculum Insights** — "Percentage meeting curriculum benchmarks at Year 3, 6, and 8. 2023–2024." Link: `https://curriculuminsights.otago.ac.nz`

  Card: `bg-slate-800/40 rounded-xl p-5 border border-slate-700/50`
  Name: `text-white text-sm font-semibold`
  Description: `text-slate-400 text-sm mt-1`
  Link: `style={{ color: '#47A5F1' }}` `text-xs font-mono mt-3 flex items-center gap-1 hover:color-[#BA90FF] transition-colors cursor-pointer` — open in new tab with rel="noopener noreferrer"

- Below grid: `<Link href="/data-sources">Full methodology & data notes →</Link>` in `style={{ color: '#47A5F1' }}` with hover to `#BA90FF`

**6. Contact section**
- `py-16 border-t border-slate-800`
- `<h2>` plain `text-white` (no gradient — quiet close): "Get in touch"
- `text-slate-400` paragraph: "Built and maintained by Maz Hermon. Questions, corrections, or just want to say hi?"
- Three contact links in a `flex flex-wrap gap-6`:
  - `import { Mail, Instagram, Facebook } from 'lucide-react'` — BUT this needs `'use client'` if using Lucide in a Server Component... Actually Lucide React works in Server Components. Import at top of file.
  - Email: `<a href="mailto:hellomazmatics@gmail.com" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#BA90FF] transition-colors duration-200 text-sm cursor-pointer"><Mail size={16} />hellomazmatics@gmail.com</a>`
  - Instagram: `<a href="https://www.instagram.com/mazmaticsfun4kids" target="_blank" rel="noopener noreferrer" ...><Instagram size={16} />@mazmaticsfun4kids</a>`
  - Facebook: `<a href="https://www.facebook.com/mazmatics" target="_blank" rel="noopener noreferrer" ...><Facebook size={16} />Mazmatics</a>`

#### Overarching design rules:
- Page wrapper: `className="bg-slate-950 min-h-screen"`
- All `<h2>` gradient text: same inline style as `<h1>`
- Section padding: `py-20 md:py-24 px-6` with `max-w-4xl mx-auto` inner container
- Hover transitions: `duration-200` everywhere
- No emoji — Lucide icons only
- NZ English: colour, recognise, maths (not math), whānau (with macron where used)
- WCAG AA contrast on all text

---

### Step 4 — Add /about to navigation

Read the nav component carefully. Add an "About" link to `/about`. Match existing nav link styles exactly. Do not change anything else.

### Step 5 — Add to home page

Read `src/app/page.tsx`. Add an About entry matching the existing card pattern. Place it after the data-sources entry.

### Step 6 — TypeScript + lint check
```bash
npx tsc --noEmit
npm run lint
```
Fix all errors. Both must be clean before continuing.

### Step 7 — Write `e2e/about.spec.ts`

Follow patterns in `.claude/skills/e2e-testing/SKILL.md`. Tests:
1. Page loads (200, no console errors — filter resource 404s)
2. h1 "About Mazmatics" visible
3. "Where it all started" h2 visible
4. "From a story book to a data story" h2 visible
5. "The data behind the charts" h2 visible
6. "Get in touch" h2 visible
7. "Wellington, NZ" stat card text visible
8. "Two kids" stat card text visible
9. "Web developer" stat card text visible
10. Book section external link (mazmatics.com) has rel="noopener noreferrer"
11. /data-sources link is present and navigates correctly
12. mailto:hellomazmatics@gmail.com link present
13. Nav "About" link present and navigates to /about

Use `test.setTimeout(30000)`. Wait: `page.waitForSelector('h1', { timeout: 10000 })`.

### Step 8 — Run e2e tests
```bash
npm run test:e2e -- e2e/about.spec.ts --project=chromium --reporter=list
```
Fix failures. Re-run until all pass.

### Step 9 — Run full suite
```bash
npm run test:e2e -- --project=chromium --reporter=list
npm test
```
All must pass (190+ e2e, 175 unit). Fix any regressions.

### Step 10 — Update docs
- `summary.md`: Add Phase 15 section
- `plan.md`: Mark Phase 15 complete, update future work
- `progress.md`: Add Phase 15 checklist as complete

---

## Acceptance Criteria
- `/about` loads without errors
- All 6 sections rendered
- Gradient on h1 and all h2 headings
- Offset colour-block shadow on book card
- Graph-paper grid texture in hero
- Animated diagonal stripe SVG decoration (static if prefers-reduced-motion)
- Stat cards with `#BA90FF` left-border
- External links with `rel="noopener noreferrer"`
- Nav has /about link
- Home page has About entry
- `tsc --noEmit` clean
- `npm run lint` clean
- `e2e/about.spec.ts` all 13 tests passing
- Full suite: 203+ e2e, 175 unit — all green
- Docs updated

---

## Completion Promise
<promise>ABOUT_PAGE_COMPLETE</promise>

---

# [ARCHIVED] Phase 14: Data Sources Page (`/data-sources`)

## Goal
Build a `/data-sources` page that documents every data source used across Mazmatics Stats. Link to it from every chart section across all pages so users can verify the data they're reading.

## Progress Tracking

| Step | Status | Description |
|------|--------|-------------|
| 1 | ✅ done | Build `/data-sources` page (Server Component, no interactivity) |
| 2 | ✅ done | Add source links to `/nzqa-maths` chart captions |
| 3 | ✅ done | Add source links to `/nzqa-scholarship` chart captions |
| 4 | ✅ done | Add source links to `/primary-maths` chart captions |
| 5 | ✅ done | Add nav card to home page (`/`) |
| 6 | ✅ done | Add footer link to all pages |
| 7 | ✅ done | Write e2e tests |
| 8 | ✅ done | Run full test suite — all tests must pass |

Update this table as each step completes: ⬜ todo → 🔄 in progress → ✅ done

---

## Step 1 — Build `/data-sources` page

### Route
`src/app/data-sources/page.tsx` — Server Component (no `'use client'`)

### Page structure
Header section: "About the data" — short intro (2–3 sentences): all data is publicly sourced from NZ government bodies and international research organisations; links let users verify the numbers independently.

Then one `<section>` per data source, each with an anchor id for deep-linking.

### Sources to include — in this order

---

#### `#source-nzqa` — NZQA Secondary School Statistics
- **Full title:** New Zealand Qualifications Authority — Secondary School Statistics
- **Publisher:** New Zealand Qualifications Authority (NZQA)
- **URL:** `https://www.nzqa.govt.nz/about-us/publications/statistics/`
- **Years:** 2015–2024
- **What we use:** Subject attainment rates (Not Achieved / Achieved / Merit / Excellence) for NCEA Levels 1, 2, and 3, broken down by ethnicity, gender, school equity group, and region. Also scholarship attainment (Outstanding / Scholarship / No Award) for Calculus and Statistics.
- **Coverage:** English-medium secondary schools. Reported at national level and by 16 NZ regions.
- **Key caveats:**
  - `achieved_rate` is the Achieved-grade-only band — NOT the overall pass rate. Pass rate = `1 − not_achieved_rate`.
  - Equity group data (Q1–Q5) is available from 2019 onwards only.
  - Each breakdown is single-dimensional — ethnicity, gender, and region data cannot be cross-tabulated.
  - Scholarship `Maori` appears without macron in source data.
- **Used on:** `/nzqa-maths`, `/nzqa-scholarship`

---

#### `#source-timss` — TIMSS International Maths Study
- **Full title:** Trends in International Mathematics and Science Study (TIMSS) 2023 — International Results in Mathematics at Grade 4
- **Publisher:** IEA (International Association for the Evaluation of Educational Achievement)
- **URL:** `https://timss2023.org`
- **Years:** 1995, 2003, 2007, 2011, 2015, 2019, 2023 (every 4 years)
- **What we use:** NZ Grade 4 (Year 5, age ~9) maths scale scores 1995–2023, by gender. 2023 international country comparison (~58 countries).
- **Coverage:** Nationally representative sample of Year 5 students in English-medium schools. Tested in February each year.
- **Key caveats:**
  - International average is recalculated each cycle based on participating countries — not directly comparable across years.
  - TIMSS scale is NOT the same as NMSSA MS scale. These are completely separate measurement systems.
  - AUS/ENG comparison lines are approximate from published reports; exact values may vary slightly by rounding.
- **Used on:** `/primary-maths`

---

#### `#source-nmssa` — NMSSA Maths Achievement Reports
- **Full title:** National Monitoring Study of Student Achievement — Mathematics and Statistics
  - Report 19: Mathematics and Statistics 2018
  - Report 30: Mathematics and Statistics 2022
- **Publisher:** University of Otago / NZCER on behalf of the Ministry of Education
- **URLs:**
  - 2022: `https://nmssa-production.s3.amazonaws.com/documents/NMSSA_2022_Mathematics_Achievement_Report.pdf`
  - 2018: `https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf`
- **Years:** 2013, 2018, 2022 (3 cycles)
- **What we use:** Mean Scale Score (MS units) for Year 4 and Year 8 students, by ethnicity, gender, and school decile band.
- **Coverage:** ~2,000 students per year level, English-medium state and integrated schools. Stratified sample by decile, region, and school size.
- **Key caveats:**
  - MS scale is designed so the combined 2013 average ≈ 100 with SD ≈ 20. Year 4 and Year 8 are NOT on the same sub-scale — a score of 84 at Y4 is not comparable to 84 at Y8.
  - 2013 values in our data are reconstructed on the 2018 MS scale via a linking exercise (NMSSA Report 19, Appendix 6). They differ from the original 2013 report figures.
  - 95% confidence intervals for 2013 are approximated from 2018 standard errors (similar sample sizes). Treat 2013 CIs as indicative.
  - NMSSA assessed at Year 4 and Year 8; the successor programme (Curriculum Insights) assesses at Year 3, Year 6, and Year 8.
- **Used on:** `/primary-maths`

---

#### `#source-curriculum-insights` — Curriculum Insights Dashboard
- **Full title:** Curriculum Insights Dashboard Reports 2023 and 2024
- **Publisher:** University of Otago / NZCER on behalf of the Ministry of Education
- **URL:** `https://curriculuminsights.otago.ac.nz`
- **Years:** 2023, 2024
- **What we use:** Percentage of students meeting / approaching / behind provisional NZ Curriculum benchmarks, at Year 3, Year 6, and Year 8.
- **Coverage:** Nationally representative sample of Year 3, Year 6, and Year 8 students. Successor to NMSSA (launched 2023).
- **Key caveats:**
  - Uses % meeting benchmarks — NOT the MS scale score used by NMSSA. These two datasets cannot be compared on the same chart.
  - Year levels changed: NMSSA measured Year 4 + Year 8; Curriculum Insights measures Year 3 + Year 6 + Year 8.
  - No statistically significant change was observed between 2023 and 2024 at any year level.
  - Demographic breakdowns (ethnicity, gender) are available in interactive data windows only — not included in our database.
- **Used on:** `/primary-maths`

---

### Design
- Dark background (`bg-slate-950`), matching existing pages
- Each source = a card (`bg-slate-900 rounded-xl p-6`) with:
  - Source name as `<h2>` with gradient text, id= anchor
  - Used-on chips: small `<span>` badges linking to the relevant page
  - Publisher / URL / Years as a small metadata row
  - "What we use" paragraph
  - Collapsible or always-visible caveats list
  - External link button to the original source

No interactivity required — Server Component. No dynamic imports needed.

---

## Step 2 — Add source links to `/nzqa-maths`

File: `src/app/nzqa-maths/page.tsx`

In the footer section (`{strings.dataNote}` paragraph), add a link:
```
Source: NZQA Secondary School Statistics 2015–2024.
<Link href="/data-sources#source-nzqa">About this data ↗</Link>
```

Keep the existing `{strings.dataNote}` and `{strings.decileNote}` — just append the link.

---

## Step 3 — Add source links to `/nzqa-scholarship`

File: `src/app/nzqa-scholarship/page.tsx`

Same pattern — add `<Link href="/data-sources#source-nzqa">About this data ↗</Link>` in the footer area.

---

## Step 4 — Add source links to `/primary-maths`

File: `src/app/primary-maths/page.tsx`

Three separate links to add, one per data source:
- TIMSS footer note → `<Link href="/data-sources#source-timss">About this data ↗</Link>`
- NMSSA footer note → `<Link href="/data-sources#source-nmssa">About this data ↗</Link>`
- Curriculum Insights footer note → `<Link href="/data-sources#source-curriculum-insights">About this data ↗</Link>`

---

## Step 5 — Add nav card to home page

File: `src/app/page.tsx`

Add a small card or link in the home page footer area (NOT a primary nav card — this is utility navigation). Something like:
```
All data is publicly sourced. <Link href="/data-sources">View data sources →</Link>
```

Or if there's a good place for a card, a compact one labelled "Data Sources & Methodology".

---

## Step 6 — Add footer link to all pages

Each page (`/nzqa-maths`, `/nzqa-scholarship`, `/primary-maths`) already has a footer. Add a small `<Link href="/data-sources">Data sources & methodology →</Link>` line at the bottom of each footer, styled like the existing `text-xs text-slate-600 font-mono` lines.

---

## Step 7 — E2E tests

File: `e2e/data-sources.spec.ts` (new file)

Tests:
- Page loads without console errors
- All 4 source section headings are visible (NZQA, TIMSS, NMSSA, Curriculum Insights)
- All 4 anchor ids are present in the DOM (`#source-nzqa`, `#source-timss`, `#source-nmssa`, `#source-curriculum-insights`)
- Deep link `GET /data-sources#source-timss` scrolls to TIMSS section (or at least the anchor exists)
- "About this data" links on `/nzqa-maths` and `/primary-maths` point to correct anchors
- External source links have `target="_blank"` and `rel="noopener noreferrer"`
- Nav link to `/data-sources` exists on home page

---

## Step 8 — Full test run

```bash
npm run test:e2e -- --reporter=list
npm test
```

All tests must pass before outputting the completion promise.

---

## Design reference

Follow the same dark theme as existing pages:
- Background: `#020617` with subtle grid
- Source card border: `border-slate-800`
- Heading gradient: `linear-gradient(to left, #47A5F1, #10b981)` (teal/blue, same as primary-maths)
- "Used on" chip: `bg-slate-800 text-slate-400 rounded-full px-2 py-0.5 text-xs font-mono`
- External link icon: ↗ (text, no icon library needed)
- Caveat items: `text-amber-500/80` for warnings, `text-slate-400` for info

---

## Completion Promise
<promise>PHASE_14_COMPLETE</promise>
