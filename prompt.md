# Session Start — Phase 9

## What's happened
- **Phase 7** (NZQA secondary data explorer) — complete
- **Phase 8** (`/primary-maths` feature) — complete (2026-03-17)

## What exists now

### `/primary-maths` (Phase 8 — new)
4 D3 charts: TIMSSTrendChart, TIMSSWorldRanking, NMSSAEquityGaps, CurriculumInsightsPipeline
DB: `src/data/primary.db` — 4 tables, seeded via `scripts/seed-primary.ts`
APIs: `/api/primary/timss`, `/api/primary/nmssa`, `/api/primary/curriculum-insights`
tsc clean · lint clean · no e2e tests yet

### `/nzqa-maths` (Phase 7 — complete, tested)
7 charts — all e2e tested (65/65 passing)
87 unit tests · 5 visual snapshots

## Read before doing anything
1. `summary.md` — complete picture of all features built
2. `plan.md` — current phase notes
3. `CLAUDE.md` — project conventions, SSR rules, stack facts

## Suggested next focus — pick one

### A) Phase 8 e2e tests
Write Playwright tests for `/primary-maths` — API health checks + page load + 4 chart sections.
Pattern: see `e2e/nzqa-maths.spec.ts` and read `e2e-testing` skill first.

### B) Phase 8 data enrichment
- Extract NMSSA 2013 + 2018 from S3 PDFs (poppler installed, pdftotext available)
- Add NMSSA trend chart (2013→2018→2022) — 3 data points per group
- Demographic breakdowns for Curriculum Insights 2023–2024 (needs Claude Desktop browser)

### C) Phase 9 — NZQA secondary untapped tables
Add new pages/sections using already-seeded DB tables:
- `scholarship` — who earns NZ's highest academic award, by ethnicity/equity/region
- `qualification_endorsement` — Merit/Excellence for full NCEA qualifications
- `literacy_numeracy` — co-attainment of literacy+numeracy co-requisite alongside maths
