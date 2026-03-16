# Ready for next session

All Phase 7 work is complete. See `summary.md` for full context.

---

## Future Work

### P5 — Untapped DB tables (new pages or sections)

Three tables in the DB are completely unused:

**Scholarship** (`scholarship` table)
- Outstanding/Scholarship/No Award rates by ethnicity, equity, region, year
- Shows "top of the pipeline" — who earns NZ's highest academic award
- Ethnicity gap here will be more stark than NCEA achievement

**Qualification Endorsement** (`qualification_endorsement` table)
- Merit/Excellence endorsement of full NCEA qualifications (a higher bar than individual subject grades)
- Shows who earns Merit/Excellence for their entire qualification

**Literacy & Numeracy** (`literacy_numeracy` table)
- Co-attainment of the literacy/numeracy co-requisite alongside maths
- Do students strong in maths also meet the literacy co-req? Does this vary by group?

Each could be a new page or a new section on `/nzqa-maths`.

---

### P6 — Correlation ideas (all feasible with single-dimension data)

1. **Gender gap by level** — Female vs Male across L1/L2/L3. Does the gap widen at higher levels?
2. **Level progression** — National pass rates at L1 vs L2 vs L3 over time. Cohort thinning?
3. **Regional variance** — Which regions are most volatile post-2024 reform?
4. **Equity × level** — Does the equity gap widen or narrow at L2/L3 vs L1?
5. **Scholarship by ethnicity** — Who attempts vs who succeeds. Proportion even attempting may be as interesting as success rate.

---

## Data Constraints (always remember)

- No cross-tabulation — single-dimension breakdowns only
- Equity data 2019–2024 only
- `achieved_rate` ≠ pass rate (it's Achieved-grade-only band)
- Pass rate = `1 - not_achieved_rate`
- Merit+Excellence = `merit_rate + excellence_rate`
- Regional data: use timeline API `groupBy=region`, NOT subjects API with `region=null`
