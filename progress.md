# Progress

## Phase 7 — Data Explorer Enhancements ✅ COMPLETE

- [x] TASK-1: BUG-1 RegionalMap fix (subjects API → timeline API)
- [x] TASK-2: EquityGapVisualizer metric fix (default to not_achieved_rate + metric selector)
- [x] TASK-3/4/5: TimelineExplorer full rebuild (metric + year range + groupBy + series toggle)
- [x] TASK-6: GradeStackChart new component (stacked grade bands)
- [x] TASK-7/8: RegionalMap enhancements (year/metric/ranking panel/drilldown)
- [x] TASK-9: DeltaChart new component (year-on-year diverging bar)
- [x] TASK-10: Labels + narratives + page sections wired up

## Phase 7 Test Coverage ✅ COMPLETE

- [x] TASK-A: Update nzqa-strings unit test (narrative accuracy + equityGroups + display names)
- [x] TASK-B: Add subjects API unit test
- [x] TASK-C: Add metric computation unit tests
- [x] TASK-D: Create /nzqa-maths Playwright e2e test file (36 tests passing)
- [x] TASK-E: Verify all existing tests pass (87 unit + 29 e2e regression — all green)

## E2E Test Fixes ✅ COMPLETE (2026-03-17)

- [x] Scoped playwright.config.ts to chromium only (firefox/webkit not installed)
- [x] Added `testIgnore: ['**/visual/**']` — visual tests only run via test:visual
- [x] Fixed networkidle timeouts for /nzqa-maths (90s test, 75s networkidle)
- [x] Removed diagnostic2.spec.ts (no assertions — not a real test)
- [x] Updated diagnostic.spec.ts section names to Phase 7 headings
- [x] Updated diagnostic.spec.ts API health check to use correct endpoints
- [x] Fixed ridgeline level selector test (explicit visibility check + 5s assertion timeout)
- [x] Updated nzqa-patterns visual snapshot
- [x] Created e2e-testing skill with all patterns and maintenance rules
- [x] Created e2e-learnings.md with root cause analysis

**Final result: 65/65 e2e + 87 unit + 5 visual — all green**

---

## Phase 8 — Primary School Maths Feature ✅ COMPLETE (2026-03-17)

### Build tasks

- [x] DB schema + seed script (`scripts/seed-primary.ts`) → `src/data/primary.db`
  - 4 tables: timss_nz_yr5 (21 rows), timss_intl_2023 (21 rows), nmssa_maths (20 rows), curriculum_insights_maths (6 rows)
- [x] DB accessor: `src/lib/db/primary.ts` + TypeScript types
- [x] API route: `src/app/api/primary/timss/route.ts` (type=trend|intl)
- [x] API route: `src/app/api/primary/nmssa/route.ts` (yearLevel, groupType params)
- [x] API route: `src/app/api/primary/curriculum-insights/route.ts`
- [x] Chart: `TIMSSTrendChart.tsx` — D3 line, NZ 1995–2023, AUS/ENG context lines, gender toggle
- [x] Chart: `TIMSSWorldRanking.tsx` — horizontal bar, 21 countries, NZ highlighted, intl avg line
- [x] Chart: `NMSSAEquityGaps.tsx` — grouped bars Y4 vs Y8, ethnicity/decile/gender, CI error bars
- [x] Chart: `CurriculumInsightsPipeline.tsx` — stacked bar % meeting/behind at Y3/Y6/Y8, 2023/2024 toggle
- [x] Client wrapper: `src/app/primary-maths/PrimaryMathsClient.tsx` (ssr: false dynamic imports)
- [x] Page: `src/app/primary-maths/page.tsx` (4 sections, hero stats, cross-link to secondary)
- [x] Landing page updated: `src/app/page.tsx` — primary-maths nav card added

### Quality checks

- [x] `tsc --noEmit` — clean
- [x] `npm run lint` — clean
- [x] All 3 APIs verified returning correct data via curl

### What's NOT done yet (Phase 8 optional / Phase 9)

- E2E tests for /primary-maths (not yet written)
- NMSSA 2013 + 2018 full tables (PDFs available, need pdftotext extraction)
- Curriculum Insights ethnicity/gender breakdowns (needs Claude Desktop browser)
- Visual regression snapshots for primary-maths

---

## Ready for next session

**Suggested next focus — choose one:**

**A) Phase 8 tests** — Add Playwright e2e tests for /primary-maths (4 API endpoints + 4 charts)

**B) Phase 8 data enrichment** — Extract NMSSA 2013/2018 from PDFs; use Claude Desktop for CI ethnicity breakdowns; add NMSSA trend chart (2013→2018→2022)

**C) Phase 9 — NZQA secondary untapped tables:**
- `scholarship` table — ethnicity/equity/region breakdown of NZ's top academic award
- `qualification_endorsement` — Merit/Excellence endorsement of full NCEA qualifications
- `literacy_numeracy` — co-attainment of literacy/numeracy co-requisite

See `summary.md` for full context of all existing features.
