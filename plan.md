# Current Work: Phase 11 — Remaining Untapped Tables

**Phase 10 COMPLETE (2026-03-18):** `/nzqa-scholarship` live, 116 e2e tests passing.

**Goal:** Continue Track B — build pages for the two remaining untapped DB tables.

## Track B — Remaining Pages

| Page/Section | Data Source | Charts | Status |
|---|---|---|---|
| `/nzqa-scholarship` | `scholarship` table | ScholarshipTrendChart + ScholarshipBreakdownChart | ✅ DONE |
| `/nzqa-endorsement` | `qualification_endorsement` table — already seeded | Merit/Excellence rates by group + trend | ❌ todo |
| `/nzqa-literacy` | `literacy_numeracy` table — already seeded | Co-attainment rate by group + year-on-year | ❌ todo |

## Track A — Phase 8 Enrichment (lower priority)

| Item | Status |
|------|--------|
| Extract NMSSA 2013 + 2018 from S3 PDFs (poppler/pdftotext available) | ❌ todo |
| Add NMSSA trend chart (2013→2018→2022) to `/primary-maths` | ❌ todo |
| Demographic breakdowns for Curriculum Insights 2023–2024 (needs Claude Desktop browser) | ❌ todo |

## Phase 11 Completion Criteria
- `/nzqa-endorsement` live with real DB data, API route, e2e tests
- OR `/nzqa-literacy` live with real DB data, API route, e2e tests
- `npm run test:e2e` passes with new tests included

## Before starting any new page — inspect the DB table first:
```bash
npx tsx -e "
import Database from 'better-sqlite3';
const db = new Database('src/data/nzqa.db');
console.log(JSON.stringify(db.prepare('SELECT * FROM qualification_endorsement LIMIT 3').all(), null, 2));
console.log(JSON.stringify(db.prepare('PRAGMA table_info(qualification_endorsement)').all(), null, 2));
console.log(JSON.stringify(db.prepare('SELECT DISTINCT year FROM qualification_endorsement ORDER BY year').all(), null, 2));
"
```

---

# Future Work: Security Hardening (pre-launch, no urgency yet)

## Context
The API routes (`/api/nzqa/`, `/api/primary/`) are internal Next.js route handlers — not a standalone public API. All data served is publicly sourced (NZQA, TIMSS, NMSSA). All routes are read-only GET requests, no write operations. No user accounts or private data yet.

## Items to address before production launch

### 1. SQL Injection audit ⚠️ most important
Scan all API route handlers to confirm every user-supplied query param is passed through parameterised statements (prepared statements with `?` placeholders), not interpolated directly into SQL strings. better-sqlite3 supports prepared statements natively. This is the only meaningful attack surface given the read-only SQLite setup.
- Files to audit: `src/app/api/nzqa/*/route.ts`, `src/app/api/primary/*/route.ts`
- Use Shannon (`/shannon` skill) or manual review
- Fix any raw string interpolation found

### 2. Rate limiting
Add rate limiting to API routes before going public to prevent abuse/scraping. Options:
- Next.js middleware with an in-memory store (simple, no infra)
- Upstash Redis + `@upstash/ratelimit` (production-grade, stateless)
- Vercel's built-in rate limiting if deploying to Vercel
- Not urgent until the app is publicly deployed and indexed

### 3. Auth / login (revisit later)
No user accounts exist yet. When auth is added (likely NextAuth.js or Clerk):
- Revisit which API routes (if any) should be protected
- Add CSRF protection if mutating state
- Currently N/A — note to check back when auth work begins

---

# Previous Work: Phase 9 — Diagnostic E2E Testing & Fixes ✅ COMPLETE (2026-03-18)

**All 91 e2e tests passing.** Bug found and fixed (TIMSSTrendChart invalid D3 CSS selector). `e2e/primary-maths.spec.ts` written (26 tests). All `nzqa-maths.spec.ts` timeouts fixed. See `test-todo.md` for full findings.

---

# Previous Work: Phase 8 — Primary School Maths Feature ✅ COMPLETE (2026-03-17)

**Built.** `/primary-maths` page live with 4 charts, 3 API routes, primary.db seeded.
See `summary.md` for full details of what was built.
Read `nz-primary-school-research` skill before any primary school feature work.

---

## Phase 8 Build Plan: `/primary-maths` Feature

### Data available and ready to build with:

**Dataset A — TIMSS (NZ Year 5, Grade 4, 1995–2023)**
- NZ scores: 469 (1995), 493 (2003), 492 (2007), 486 (2011), 491 (2015), 487 (2019), 490 (2023)
- Gender split: Boys/Girls across all 7 cycles
- 2023 international comparison: NZ 490 vs intl avg 503, Australia 525, England 552, Singapore 615
- Source: Downloaded Excel files from timss2023.org ✅

**Dataset B — NMSSA 2022 (Year 4 and Year 8, complete tables)**
- Full mean scale scores by ethnicity (Māori 75.3/105, Pacific 72.9/101.2, Asian 94/129.5, NZE 86.2/119)
- By gender (Girls 82.4/113.3, Boys 85.7/118.1)
- By decile (Low 72.8/103.1, Mid 84.1/115.5, High 89.9/124.5)
- Curriculum level achievement: Year 4 81.8% at Level 2+, Year 8 41.5% at Level 4+
- Source: Extracted from NMSSA PDF ✅

**Dataset C — Curriculum Insights 2023–2024 (Years 3, 6, 8)**
- % meeting provisional benchmarks: Y3 20%/22%, Y6 28%/30%, Y8 22%/23%
- No statistically significant change 2023→2024
- Detailed ethnicity/gender available only via interactive data windows (needs browser)
- Source: PDF extraction ✅ (headline) + browser needed for breakdown

### DB Schema (new tables in `src/data/primary.db`)

```sql
-- TIMSS NZ Year 5 maths (Grade 4)
CREATE TABLE timss_nz_yr5 (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,         -- 1995, 2003, 2007, 2011, 2015, 2019, 2023
  group_type TEXT NOT NULL,      -- 'national', 'gender'
  group_value TEXT,              -- NULL (national), 'Girls', 'Boys'
  mean_score REAL NOT NULL,      -- TIMSS scale score (international avg ~500)
  se REAL,                       -- standard error
  intl_avg REAL                  -- international average that year (for comparison)
);

-- TIMSS 2023 international comparison
CREATE TABLE timss_intl_2023 (
  id INTEGER PRIMARY KEY,
  country TEXT NOT NULL,
  mean_score REAL NOT NULL,
  se REAL,
  is_nz INTEGER DEFAULT 0        -- 1 for NZ row
);

-- NMSSA mean scale scores (2013, 2018, 2022)
CREATE TABLE nmssa_maths (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,          -- 2013, 2018, 2022
  year_level INTEGER NOT NULL,    -- 4 or 8
  group_type TEXT NOT NULL,       -- 'national', 'gender', 'ethnicity', 'decile'
  group_value TEXT,               -- NULL, 'Girls', 'Boys', 'Māori', 'Pacific', 'Asian', 'NZE', 'Low', 'Mid', 'High'
  mean_score REAL,                -- MS scale score
  ci_lower REAL,
  ci_upper REAL,
  sd REAL,
  n INTEGER,
  pct_at_curriculum_level REAL    -- % at Level 2+ (Y4) or Level 4+ (Y8) — optional
);

-- Curriculum Insights % meeting benchmarks (2023, 2024)
CREATE TABLE curriculum_insights_maths (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,          -- 2023, 2024
  year_level INTEGER NOT NULL,    -- 3, 6, or 8
  group_type TEXT NOT NULL,       -- 'national', 'gender', 'ethnicity', 'sei'
  group_value TEXT,               -- NULL, 'Girls', 'Boys', 'Māori', 'Pacific', etc.
  pct_meeting REAL,               -- % meeting provisional benchmark
  pct_less_1yr REAL,              -- % less than 1 year behind
  pct_more_1yr REAL               -- % more than 1 year behind
);
```

### Visualisations to Build

**Chart 1: TIMSS NZ Trend (1995–2023)** — `/primary-maths` hero chart
- D3 line chart, NZ score across 7 cycles
- Reference: international average line (dashed)
- Comparison: Australia, England as ghost lines
- Toggle: gender split (Girls vs Boys)
- Note: First time in a decade NZ didn't decline (2023)

**Chart 2: TIMSS 2023 World Ranking** — companion chart
- Horizontal bar chart, ~20 selected countries
- NZ highlighted, English-speaking countries labelled
- Shows NZ vs comparable nations

**Chart 3: NMSSA Equity Gaps** — most compelling for parents
- Grouped bar chart: Year 4 vs Year 8 side-by-side
- Groups: Māori, Pacific, Asian, NZE, Low decile, Mid decile, High decile
- Show actual score AND gap from national average
- Key message: Decile gap at Y8 = 2.5 years of learning

**Chart 4: Primary Maths Pipeline** — narrative chart
- Shows progression from Y3→Y6→Y8→NCEA L1 maths
- % meeting expectations at each stage
- Connects to existing NZQA data (linking the two datasets)
- Key message: 22% meeting Y8 expectations vs ~65% passing NCEA L1 maths?
  (note: the %s use different scales but tells a story)

### Route: `/primary-maths`
- New page, similar structure to `/nzqa-maths`
- Hero: "How are NZ primary school students doing in maths?"
- Section 1: TIMSS international context
- Section 2: NMSSA domestic equity gaps
- Section 3: Pipeline to secondary

### Optional (Phase 9 - after browser data collection):
- Ethnicity breakdowns for 2023–2024 Curriculum Insights (via Claude Desktop browser)
- NMSSA 2013 and 2018 full tables (from S3 PDFs, poppler available)
- NMSSA trend chart (2013 → 2018 → 2022 MS scale changes)

---

## Browser Assist Instructions (when needed)

If you need data from the Curriculum Insights interactive data windows or Education Counts pages, use Claude Desktop with the browser plugin.

**Prompt to give Claude Desktop:**
> Visit https://curriculuminsights.otago.ac.nz/nmssa-data/ in your browser. Click on the Maths data windows for 2023 and 2024. For each year level (Year 3, Year 6, Year 8) and each demographic breakdown (Ethnicity, Gender), screenshot or copy the exact percentages shown. Write all values to `/Users/mazhermon/Sites/mazmaticsClaudeProjects/mazmaticsStats_001/research-raw-browser.md`

---

# Previous Work: Phase 7 Complete

All Phase 7 (NZQA secondary data explorer) work is complete. See `summary.md` for full context.

---

## Future Work (P5, P6 — NZQA secondary feature enhancements)

### P5 — Untapped DB tables (new pages or sections)

**Scholarship** (`scholarship` table)
- Outstanding/Scholarship/No Award rates by ethnicity, equity, region, year
- Shows "top of the pipeline" — who earns NZ's highest academic award

**Qualification Endorsement** (`qualification_endorsement` table)
- Merit/Excellence endorsement of full NCEA qualifications

**Literacy & Numeracy** (`literacy_numeracy` table)
- Co-attainment of the literacy/numeracy co-requisite alongside maths

---

### P6 — Correlation ideas (all feasible with single-dimension data)

1. **Gender gap by level** — Female vs Male across L1/L2/L3
2. **Level progression** — National pass rates at L1 vs L2 vs L3 over time
3. **Regional variance** — Which regions are most volatile post-2024 reform?
4. **Equity × level** — Does the equity gap widen or narrow at L2/L3 vs L1?
5. **Scholarship by ethnicity** — Who attempts vs who succeeds

---

## Data Constraints (NZQA secondary — always remember)

- No cross-tabulation — single-dimension breakdowns only
- Equity data 2019–2024 only
- `achieved_rate` ≠ pass rate (it's Achieved-grade-only band)
- Pass rate = `1 - not_achieved_rate`
- Merit+Excellence = `merit_rate + excellence_rate`
- Regional data: use timeline API `groupBy=region`, NOT subjects API with `region=null`
