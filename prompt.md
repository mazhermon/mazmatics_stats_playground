# Session Start — Phase 8: Build `/primary-maths` Feature

## What's happening
Phase 7 (NZQA secondary data explorer) is complete. Phase 8 is building a new `/primary-maths`
page with NZ primary and intermediate school maths achievement data.

Research is done. Data is ready. This session: build the feature.

## Read before doing anything
1. `plan.md` — full build plan, DB schema, chart designs, browser-assist instructions
2. `research-findings.md` — all extracted data tables (TIMSS, NMSSA 2022, Curriculum Insights)
3. `nz-primary-school-research` skill — source context and data caveats
4. `CLAUDE.md` — project conventions, SSR rules, stack facts
5. `summary.md` — existing feature state (so you don't break anything)

## Data ready to use

### TIMSS NZ Year 5 Maths (Grade 4) — 1995–2023
| Year | NZ | Girls | Boys | Intl avg |
|------|-----|-------|------|----------|
| 1995 | 469 | 474 | 465 | ~529 |
| 2003 | 493 | 493 | 494 | ~495 |
| 2007 | 492 | 492 | 493 | ~473 |
| 2011 | 486 | 486 | 486 | ~491 |
| 2015 | 491 | 489 | 492 | ~493 |
| 2019 | 487 | 484 | 490 | ~502 |
| 2023 | 490 | 479 | 501 | 503 |

2023 international: Singapore 615, England 552, Australia 525, USA 517, NZ 490 (~40th of 58)

### NMSSA 2022 Mean Scale Score (MS units)
Year 4 — All: 84.0 | Girls: 82.4 | Boys: 85.7 | Māori: 75.3 | Pacific: 72.9 | Asian: 94.0 | NZE: 86.2 | Low: 72.8 | Mid: 84.1 | High: 89.9
Year 8 — All: 115.8 | Girls: 113.3 | Boys: 118.1 | Māori: 105.0 | Pacific: 101.2 | Asian: 129.5 | NZE: 119.0 | Low: 103.1 | Mid: 115.5 | High: 124.5

Curriculum level achievement: Year 4 → 81.8% at Level 2+ | Year 8 → 41.5% at Level 4+
Decile gap at Year 8 = 21 units = 2.5 years of learning.
Year 8 decline for girls, Māori, Pacific between 2018 and 2022.

### Curriculum Insights 2023–2024 (% meeting provisional benchmarks)
| Year | Y3 | Y6 | Y8 |
|------|----|----|-----|
| 2023 | 20% | 28% | 22% |
| 2024 | 22% | 30% | 23% |
No statistically significant change 2023→2024.

## What to build
New route: `src/app/primary-maths/` — similar pattern to `/nzqa-maths`
New DB: `src/data/primary.db` — 4 tables (schema in `plan.md`)
New seed script: `scripts/seed-primary.ts`

### Charts (in priority order)
1. **TIMSS Trend** — D3 line chart, NZ 1995–2023, intl avg reference, AU/ENG/SIN comparison, gender toggle
2. **TIMSS 2023 World Ranking** — horizontal bar chart, ~20 key countries, NZ highlighted
3. **NMSSA Equity Gaps** — grouped bar chart, Year 4 vs Year 8, all ethnic/decile groups
4. **Curriculum Insights Pipeline** — simple bar/step chart, Y3→Y6→Y8 % meeting benchmarks + link to NCEA data

## Important data caveats
- NMSSA (2013–2022) uses MS Scale Score; Curriculum Insights (2023+) uses % benchmarks — NOT the same scale
- Year levels changed: NMSSA measured Y4 and Y8; Curriculum Insights uses Y3, Y6, Y8
- No per-school primary data exists (unlike NZQA which has school-level NCEA data)
- NMSSA maths only in 2013, 2018, 2022 (rotated study — not every year)
- `ssr: false` mandatory for all D3 chart components (Next.js 15 rule)

## Completion Promise

<promise>PRIMARY_MATHS_FEATURE_COMPLETE</promise>
