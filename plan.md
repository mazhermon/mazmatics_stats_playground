# Data Explorer Enhancement Plan

## Current State / What We Know

### What the data actually contains

| Breakdown | Years | Groups |
|---|---|---|
| Ethnicity | 2015–2024 | Asian, European, Māori, Pacific Peoples, MELAA |
| Equity group | 2019–2024 | Fewer / Moderate / More (resources) |
| Region | All years | 16 NZ regions + Pacific Islands |
| Gender | All years | Female / Male |
| Overall (no breakdown) | All years | National aggregate |

**No cross-tabulation** — every row has exactly ONE non-null breakdown column. You cannot filter by ethnicity AND equity simultaneously (the data doesn't exist).

Note: "European" in the raw data = NZ European / Pākehā. MELAA = Middle Eastern / Latin American / African.

### Critical metric misunderstanding (must fix first)

`achieved_rate` ≠ "overall pass rate". It means students who got the **Achieved grade only** (the minimum pass band). Students who got Merit or Excellence are NOT counted in `achieved_rate`. This means:

- **Asian students appear to have the lowest achievement** in the current chart (35.8%) because they mostly get Merit/Excellence
- **Māori/Pacific appear highest** (49–51%) because when they pass, they tend to pass at the Achieved grade

The correct metrics to show the equity gap:
- `not_achieved_rate` — fail rate (most direct)
- `merit_rate + excellence_rate` — top-of-grade-distribution rate (most striking)
- `1 - not_achieved_rate` — overall pass rate

Actual picture at NCEA Level 1 (10-year average):
| Ethnicity | Fail rate | Overall pass | Merit+Excellence |
|---|---|---|---|
| Asian | 14% | **86%** | 51% |
| European | 16% | **84%** | 42% |
| MELAA | 19% | **81%** | 38% |
| Māori | 24% | **76%** | 26% |
| Pacific Peoples | 25% | **75%** | 24% |

### Equity group data notes

- Equity data starts 2019 only (6 years, not the full 10)
- "Fewer resources" = schools serving lower socioeconomic communities (old low-decile equivalent)
- "More resources" = schools serving wealthier communities (old high-decile equivalent)
- Pattern: "Fewer resources" schools have the WORST outcomes — highest fail rate, lowest Merit+Excellence
- 2024 spike: fail rates jumped 5–10pp across all equity groups — likely NCEA reform impact
- Equity groups replaced decile bands in 2023; pre-2023 rows use mapped equivalents

---

## Planned Changes

### P0 — Fix the broken narrative (do first, small change)

**Problem:** The equity section text says "Māori/Pacific achieve at lower rates" but the chart shows `achieved_rate` (Achieved-grade-only), which makes Māori appear to OUTPERFORM Asian students. This is actively misleading.

**Fix in `EquityGapVisualizer`:**
- Change default metric to `not_achieved_rate` (fail rate)
- Add computed metric options: "Pass rate", "Merit + Excellence rate"
- Update metric labels in controls to be explicit: "Fail rate (Not Achieved)", "Merit + Excellence", "Overall pass rate"
- Add a small explanatory note: "'Achieved only' = minimum pass grade. Does not include Merit or Excellence."

---

### P1 — Māori vs non-Māori grouping

**Where:** Add a toggle to `TimelineExplorer` and `EquityGapVisualizer` alongside "By ethnicity"

**How:** No new API endpoint needed. Client-side computation:
- "Māori" = keep as-is from existing ethnicity data
- "Non-Māori" = weighted average of all other ethnicities using `assessed_count` as weight

This framing is standard in NZ education policy and makes the gap far clearer than 5 separate lines.

---

### P2 — School equity group charts (new section)

Add a section "Achievement by school resources" to `/nzqa-maths`, below the existing equity section.

**Chart 2a: Equity Group Timeline** (line chart, matches existing style)
- Lines: Fewer / Moderate / More resources over 2019–2024
- Default metric: `not_achieved_rate`
- Annotate 2024 spike
- Note that equity data starts 2019

**Chart 2b: Stacked Grade Distribution by Equity Group** (stacked bar)
- For a selected year and level, show 4 stacked grade bands per equity group
- Bands: Not Achieved / Achieved / Merit / Excellence
- This is where the equity story is most visually striking — the Merit+Excellence stack shrinks dramatically from "Fewer" to "More" resources schools

**API needed:** Extend `/api/nzqa/timeline` to support `metric=all` returning all 4 grade columns, or add `/api/nzqa/breakdown` endpoint.

---

### P3 — Fail rate / grade distribution chart (new, uses existing API)

**Chart: "Where do students land?" — stacked area by year**

For a selected group, show the full grade distribution across time:
- Stacked layers: Not Achieved → Achieved → Merit → Excellence
- X axis: year
- Makes all of the following visible at once:
  - 2020 COVID effect (fail rates dropped, possible grade leniency)
  - 2024 NCEA reform shock (fail rates spiked, Merit+Excellence compressed)
  - Long-term trends per group

**Implementation:** New `GradeStackChart` component. Uses D3 `stack()` with `stackOffsetNone`. Existing timeline API can be extended with `metric=all`.

---

### P4 — Year-on-year change (delta) chart

Show the change in fail rate or pass rate vs the previous year, by group. A diverging bar chart (positive = improved, negative = regressed) per year.

Surfaces:
- Which groups benefited most from COVID leniency (2020–2021)
- Which groups were hit hardest by 2024 reform
- Whether the Māori/Pacific gap is narrowing or widening (spoiler: it is largely stable over 10 years)

---

### P5 — Untapped tables (new explorations)

Three tables in the DB are completely unused:

**Scholarship table** (`scholarship`)
- Outstanding/Scholarship/No Award rates by ethnicity, equity, region, year
- Shows the "top of the pipeline" — who gets NZ's highest academic award
- The ethnicity gap here will be even more stark than NCEA achievement

**Qualification Endorsement table** (`qualification_endorsement`)
- Excellence/Merit endorsement of full NCEA qualifications (different from individual subject grades)
- Shows who gets Merit/Excellence for their entire qualification — a higher bar

**Literacy & Numeracy table** (`literacy_numeracy`)
- Co-attainment of the literacy/numeracy co-requisite alongside maths
- Do students strong in maths also meet the literacy co-req? Does this vary by group?

Each of these could be a new page or a new section on `/nzqa-maths`.

---

### P6 — Correlation ideas

All feasible with existing data (no cross-tab needed — each is a single-dimension analysis):

1. **Gender gap by level** — Female vs Male achievement across L1/L2/L3. Does the gap widen or narrow at higher levels?
2. **Level progression** — National pass rates at L1 vs L2 vs L3 over time. How much does the cohort thin at each level?
3. **Regional variance** — Which regions have the widest spread between their best and worst year? Most volatile = most affected by 2024 reform?
4. **Equity × level interaction** — Does the equity gap widen or narrow at L2/L3 vs L1?
5. **Scholarship by ethnicity** — Comparing who sits vs who succeeds at Scholarship level. Proportion of students even attempting scholarship may be as interesting as the success rate.

---

### P7 — Labels, annotation and narrative fixes

- Rename `European` → `NZ European / Pākehā` consistently across all charts
- Add year annotation markers on all timeline charts: 2020 (COVID), 2023 (equity groups introduced), 2024 (NCEA reform)
- Clarify equity group labels: "Fewer resources (low decile equivalent)" etc.
- Update the equity section narrative to reference the correct metric once P0 is done

---

## Suggested Build Order

| Priority | Change | Effort |
|---|---|---|
| P0 | Fix metric bug in EquityGapVisualizer | ~30 min |
| P1 | Māori vs non-Māori toggle | ~1 hr |
| P3 | Stacked grade distribution chart | ~2 hrs |
| P2 | Equity group section + API change | ~3 hrs |
| P4 | YoY delta chart | ~2 hrs |
| P7 | Labels and annotations | ~1 hr |
| P5 | Scholarship + endorsement pages | ~4 hrs |
| P6 | Correlation explorer | ~4 hrs |

---

## Data Constraints to Remember

- No cross-tab: ethnicity × equity, ethnicity × region, etc. — always returns empty
- Equity data: 2019–2024 only (not the full 10 years)
- `achieved_rate` = Achieved grade only, NOT overall pass rate
- Overall pass rate = `1 - not_achieved_rate`
- Merit+Excellence rate = `merit_rate + excellence_rate`
- `assessed_count` = population denominator — use for weighted averages when merging groups
- Regional breakdown has no gender/ethnicity sub-breakdown
