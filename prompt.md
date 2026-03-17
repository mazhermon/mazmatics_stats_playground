# Session Start — Phase 11: Remaining Untapped Tables

## What's done so far
- **Phase 7** — NZQA secondary data explorer (`/nzqa-maths`) — 7 charts, complete
- **Phase 8** — Primary school explorer (`/primary-maths`) — 4 charts, 26 e2e tests, complete
- **Phase 9** — Diagnostic E2E testing — all bugs fixed
- **Phase 10** — NZQA Scholarship explorer (`/nzqa-scholarship`) — 2 charts, 24 e2e tests, 116 total passing ✅

## Current DB state

### nzqa.db — untouched tables remaining
- `qualification_endorsement` — Merit/Excellence endorsement of full NCEA qualifications
- `literacy_numeracy` — Co-attainment of literacy/numeracy co-requisite alongside maths

### nzqa.db — live (wired to UI)
- `subject_attainment` — `/nzqa-maths` + creative pages
- `scholarship` — `/nzqa-scholarship` ✅

### primary.db — seeded, live
- `timss_nz_yr5`, `timss_intl_2023`, `nmssa_maths`, `curriculum_insights_maths`

## Read before doing anything
1. `nzqa-data-research` skill — DB schema, CSV sources, data structure facts (CRITICAL: no cross-tabulation)
2. `e2e-testing` skill — timeout rules, test patterns
3. `plan.md` — Phase 11 goals and tracks
4. `summary.md` — complete current state, all APIs, test counts
5. `CLAUDE.md` — project conventions, SSR rules

## Phase 11 Task

### Track B — Build the next NZQA secondary page

Pick one of the two remaining tables. **Qualification Endorsement** is the recommended next:
- Shows Merit/Excellence for full NCEA qualifications — the "quality" story to complement the pass/fail story
- Data in DB: `qualification_endorsement` table — already seeded

**Steps:**
1. Read `nzqa-data-research` skill + `summary.md` for context
2. Inspect the table:
```bash
npx tsx -e "
import Database from 'better-sqlite3';
const db = new Database('src/data/nzqa.db');
console.log(JSON.stringify(db.prepare('PRAGMA table_info(qualification_endorsement)').all(), null, 2));
console.log(JSON.stringify(db.prepare('SELECT * FROM qualification_endorsement LIMIT 5').all(), null, 2));
console.log(JSON.stringify(db.prepare('SELECT DISTINCT year FROM qualification_endorsement ORDER BY year').all(), null, 2));
console.log(JSON.stringify(db.prepare('SELECT DISTINCT qualification FROM qualification_endorsement').all(), null, 2));
console.log(JSON.stringify(db.prepare('SELECT DISTINCT ethnicity FROM qualification_endorsement WHERE ethnicity IS NOT NULL').all(), null, 2));
"
```
3. Design and build API route at `/api/nzqa/endorsement`
4. Build the page at `/nzqa-endorsement` — similar structure to `/nzqa-scholarship`:
   - Hero with compelling stat
   - Chart 1: Endorsement rate trend over time (national + by group)
   - Chart 2: Breakdown by ethnicity/equity/gender for selected year
5. Add nav card on home page
6. Write `e2e/nzqa-endorsement.spec.ts` — API health + page load + chart renders
7. Run `npm run test:e2e` — all tests must pass

### Reference: how `/nzqa-scholarship` was built (follow same pattern)
- API route: `src/app/api/nzqa/scholarship/route.ts` — groupBy pattern, allowlist validation
- Charts: `src/components/charts/ScholarshipTrendChart.tsx` + `ScholarshipBreakdownChart.tsx`
- Client wrapper: `src/app/nzqa-scholarship/NzqaScholarshipClient.tsx`
- Page: `src/app/nzqa-scholarship/page.tsx`

## Data constraints (always apply)
- No cross-tabulation — each breakdown is single-dimension only
- Equity data 2019–2024 only — always show a note when equity is selected
- `ssr: false` mandatory for all D3 chart imports

## Completion Promise
<promise>PHASE_11_COMPLETE</promise>

## After Phase 11 — Future Work
- `literacy_numeracy` page — co-attainment of literacy+numeracy alongside maths
- Phase 8 Track A: NMSSA trend chart (2013→2018→2022)
- Curriculum Insights demographic breakdowns (needs Claude Desktop browser)
