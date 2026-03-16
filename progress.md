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

## Ready for next session

**Suggested next focus: P5 — Untapped DB tables**
- `scholarship` table — ethnicity/equity/region breakdown of NZ's top academic award
- `qualification_endorsement` — Merit/Excellence endorsement of full NCEA qualifications
- `literacy_numeracy` — co-attainment of literacy/numeracy co-requisite

See `summary.md` → "What's Next" for full details.
