# Session Start — Phase 10: NZQA Secondary Untapped Tables

## What's done so far
- **Phase 7** — NZQA secondary data explorer (`/nzqa-maths`) — 65 tests, complete
- **Phase 8** — Primary school explorer (`/primary-maths`) — 4 charts, complete
- **Phase 9** — Diagnostic E2E testing — 91 tests passing, all bugs fixed

## Current DB state

### nzqa.db — already seeded, untouched tables
- `scholarship` — Outstanding/Scholarship/No Award rates by ethnicity, equity, region, year
- `qualification_endorsement` — Merit/Excellence endorsement of full NCEA qualifications
- `literacy_numeracy` — Co-attainment of literacy/numeracy co-requisite alongside maths

### primary.db — seeded, live
- `timss_nz_yr5`, `timss_intl_2023`, `nmssa_maths`, `curriculum_insights_maths`

## Read before doing anything
1. `nzqa-data-research` skill — DB schema, CSV sources, data structure facts (CRITICAL: no cross-tabulation)
2. `e2e-testing` skill — timeout rules, test patterns
3. `plan.md` — Phase 10 goals and tracks
4. `CLAUDE.md` — project conventions, SSR rules

## Phase 10 Task

### Track B — Build a new NZQA secondary page (start here)

Pick the most compelling untapped table. **Scholarship** is the recommended starting point:
- It shows who earns NZ's highest academic award — a natural "top of the pipeline" story
- Data already in DB: `scholarship` table
- Builds on existing NZQA narrative established in `/nzqa-maths`

**Steps:**
1. Read `nzqa-data-research` skill to understand `scholarship` table schema
2. Inspect the `scholarship` table: `npx tsx -e "import Database from 'better-sqlite3'; const db = new Database('src/data/nzqa.db'); console.log(db.prepare('SELECT * FROM scholarship LIMIT 5').all()); console.log(db.prepare('SELECT DISTINCT year FROM scholarship').all()); console.log(db.prepare('SELECT DISTINCT group_type FROM scholarship').all());"`
3. Design and build API route at `/api/nzqa/scholarship`
4. Build the page at `/nzqa-scholarship` — similar structure to `/nzqa-maths`:
   - Hero with compelling stat (e.g. "X% of Scholarship awards go to the top decile")
   - Chart 1: Scholarship rate trend by ethnicity
   - Chart 2: Equity breakdown (high/mid/low decile)
   - Chart 3: Regional breakdown (if data available)
5. Add nav card on home page
6. Write `e2e/nzqa-scholarship.spec.ts` — API health + page load + chart renders
7. Run `npm run test:e2e` — all tests must pass

### Track A — Phase 8 Enrichment (do after Track B)
- Extract NMSSA 2013 + 2018 PDFs with pdftotext (poppler installed)
- Add NMSSA trend chart to `/primary-maths`
- Curriculum Insights demographic breakdowns via Claude Desktop browser

## Data constraints (always apply to NZQA secondary data)
- No cross-tabulation — each breakdown is single-dimension only
- Scholarship data: `Outstanding Award` / `Scholarship Award` / `No Award` bands
- `achieved_rate` ≠ pass rate for scholarship (use the award rate columns directly)
- Equity data may be 2019–2024 only (check actual years in DB)

## Completion Promise
<promise>PHASE_10_COMPLETE</promise>

## After Phase 10 — Future Work
- `qualification_endorsement` page — Merit/Excellence for full NCEA qualifications
- `literacy_numeracy` page — co-attainment of literacy+numeracy alongside maths
- Phase 8 NMSSA trend chart (Track A above)
- Curriculum Insights demographic breakdowns
