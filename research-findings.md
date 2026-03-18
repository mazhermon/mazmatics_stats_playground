# NZ Primary & Intermediate School Data — Research Findings

> **Status:** Research COMPLETE — all priority sources checked.
> **Date completed:** 2026-03-17
> Status: ⬜ not checked | ✅ checked — data found | ⚠️ checked — limited/no usable data | ❌ checked — dead end

---

## Source 1 — Education Counts: NMSSA Overview
**URL:** https://www.educationcounts.govt.nz/statistics/schooling/nmssa
**Status:** ⚠️ checked — 403 (bot-blocked), found via alternative sources

**Findings:** Page exists but blocks automated requests. NMSSA data was found via the Curriculum Insights website and direct S3 PDF links instead. Education Counts hosts NMSSA publications but is inaccessible without a browser.

**Browser assist needed:** Yes — use Claude Desktop to visit this page for the full list of interactive data window links.

---

## Source 2 — NMSSA Website / Curriculum Insights (Primary Data Host)
**URL:** https://curriculuminsights.otago.ac.nz / formerly nmssa.otago.ac.nz (redirects)
**Status:** ✅ checked — data found

**Findings:**
- Curriculum Insights is the **successor to NMSSA** (launched 2023, built on NMSSA 2011-2022 and NEMP 1995-2010)
- Annual study: ~160 schools, ~6,000 students, English-medium state/integrated schools
- Subjects assessed: Reading, Writing, Maths (Foundation Areas) + Learning Areas rotated yearly
- Year levels: **Years 3, 6, and 8** (changed from NMSSA which used **Years 4 and 8**)
- Publicly available: **PDF dashboard reports** and **interactive data windows** (no direct CSV download)
- Raw data: available to researchers via **formal request** (biannual review: May/November)
- Contact: curriculuminsights@otago.ac.nz

**Maths data years available:**
| Year | Study | Year levels | Metric |
|------|-------|-------------|--------|
| 2013 | NMSSA Cycle 1 | Year 4, Year 8 | MS Scale Score |
| 2018 | NMSSA Cycle 2 | Year 4, Year 8 | MS Scale Score |
| 2022 | NMSSA Cycle 2 | Year 4, Year 8 | MS Scale Score |
| 2023 | Curriculum Insights | Year 3, Year 6, Year 8 | % meeting provisional benchmarks |
| 2024 | Curriculum Insights | Year 3, Year 6, Year 8 | % meeting provisional benchmarks |

**⚠️ CRITICAL: Scale changed in 2023.** NMSSA used Mean Scale Score (MS units); Curriculum Insights uses % meeting provisional benchmarks. Year levels also changed (Y4→Y3, added Y6). Not directly comparable without additional bridging work.

---

## Source 3 — NMSSA Reports (PDF Data — Extracted)
**URLs:**
- `https://nmssa-production.s3.amazonaws.com/documents/NMSSA_2022_Mathematics_Achievement_Report.pdf`
- `https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf`
- `https://nmssa-production.s3.amazonaws.com/documents/2024_National_Maths.pdf`
- `https://nmssa-production.s3.amazonaws.com/documents/2023_Y8_National_Maths.pdf`

**Status:** ✅ checked — data found and extracted

### NMSSA 2022 Maths — COMPLETE DATA (Report 30, extracted via pdftotext)

**Table A2.1: Year 4 Mean Scale Score (MS units)**
| Group | n | Mean | 95% CI | SD |
|-------|---|------|--------|----|
| All | 2064 | **84.0** | 83.0–85.0 | 18.8 |
| Girls | 1060 | 82.4 | 81.1–83.7 | 18.0 |
| Boys | 1004 | 85.7 | 84.3–87.1 | 19.4 |
| Māori | 448 | 75.3 | 73.5–77.1 | 16.3 |
| Pacific | 269 | 72.9 | 70.6–75.2 | 16.3 |
| Asian | 413 | 94.0 | 91.8–96.2 | 18.6 |
| NZ European | 955 | 86.2 | 84.9–87.5 | 17.5 |
| Low decile | 437 | 72.8 | 70.9–74.7 | 16.6 |
| Mid decile | 817 | 84.1 | 82.6–85.6 | 17.9 |
| High decile | 810 | 89.9 | 88.4–91.4 | 18.1 |

**Table A2.2: Year 8 Mean Scale Score (MS units)**
| Group | n | Mean | 95% CI | SD |
|-------|---|------|--------|----|
| All | 1960 | **115.8** | 114.7–116.9 | 21.3 |
| Girls | 955 | 113.3 | 111.8–114.8 | 20.3 |
| Boys | 1005 | 118.1 | 116.5–119.7 | 21.9 |
| Māori | 423 | 105.0 | 103.0–107.0 | 17.1 |
| Pacific | 283 | 101.2 | 98.9–103.5 | 16.6 |
| Asian | 308 | 129.5 | 126.6–132.4 | 21.8 |
| NZ European | 1025 | 119.0 | 117.6–120.4 | 19.7 |
| Low decile | 409 | 103.1 | 101.0–105.2 | 17.8 |
| Mid decile | 930 | 115.5 | 113.9–117.1 | 20.7 |
| High decile | 621 | 124.5 | 122.6–126.4 | 20.0 |

**Table A2.3: Curriculum Level Achievement (%)**
| | Year 4 | Year 8 |
|--|--------|--------|
| All | 81.8% at Level 2+ | 41.5% at Level 4+ |
| Girls | 81.1% | 36.7% |
| Boys | 82.6% | ~46% |

**Key trends:**
- Y4→Y8 gap: 31.8 MS units = ~4 years of progress (8 units/year annualised)
- No significant change Y4 2018→2022
- Y8: significant declines for girls, Māori, Pacific between 2018 and 2022
- Decile gap Y8: 21.4 units = 2.5 years of progress between high and low decile schools

### NMSSA 2018 Key Findings (Report 19, extracted)
- Y8 average increased 3 MS units from 2013 to 2018 (significant); Y4 increased 1 unit (not significant)
- 2018: 45% Year 8 at Level 4+, 81% Year 4 at Level 2+
- Māori gap: -11 units at both Y4 and Y8
- Pacific gap: -15 Y4, -13 Y8
- Asian premium: +9 Y4, +11 Y8
- Decile gap: 20 units Y4, 18 units Y8 (2018)

### Back-calculated 2013 estimates (MS scale baseline year):
- Y4 ≈ 83 MS units (84 - ~1 change)
- Y8 ≈ 113 MS units (115.8 - 3 from 2018, ≈ 112.8)
- Scale was designed with combined mean = 100 at 2013 baseline ✓

### Curriculum Insights 2024 (% meeting provisional benchmarks at Year 3, 6, 8)
| Year Level | Meeting expectations | < 1 year behind | > 1 year behind |
|------------|---------------------|-----------------|-----------------|
| Year 3 | 22% | ~35% | ~43% |
| Year 6 | 30% | ~16% | ~53% |
| Year 8 | 23% | 15% | 62% |

- No statistically significant change from 2023 to 2024
- Māori and Pacific students scored lower than non-Māori/non-Pacific at all year levels
- Boys scored higher than girls at all year levels
- Students at lower socioeconomic schools scored lower at all year levels

### Curriculum Insights 2023 (% meeting provisional benchmarks)
| Year Level | Meeting expectations |
|------------|---------------------|
| Year 3 | 20% |
| Year 6 | 28% |
| Year 8 | 22% |

---

## Source 4 — Education Counts: Maths Statistics
**URL:** https://www.educationcounts.govt.nz/statistics/math
**Status:** ⚠️ checked — 403 (bot-blocked)

**Findings:** Returns 403. Page likely contains the NMSSA/Curriculum Insights publications list. Data found via direct S3 PDF links above.

---

## Source 5 — Education Counts: National Standards (2010–2017)
**URL:** https://www.educationcounts.govt.nz/statistics/schooling/national-standards
**Status:** ⚠️ checked — 403 (bot-blocked), limited data via web search

**Findings via web search:**
- National Standards monitoring project ran 2010–2013 (school sample)
- Aggregate data published by MoE for each year
- Data "available in CSV format" according to one search result
- Discontinued 2017 due to reliability concerns (self-reported by schools)
- Pages exist on Education Counts but blocked by bot protection

**Browser assist needed:** To get the actual CSV data files from the monitoring project.
**Assessment:** Lower priority than NMSSA — data quality issues and discontinued.

---

## Source 6 — Education Counts: School Rolls & Demographics
**URL:** https://www.educationcounts.govt.nz/statistics/schooling/student-numbers
**Status:** ⚠️ checked — 403 (bot-blocked)

**Findings:** Roll data exists. Can support equity analysis cross-referenced with NMSSA. Not needed for core maths achievement charts but useful for context.

---

## Source 7 — Education Counts: Attendance Data
**URL:** https://www.educationcounts.govt.nz/statistics/schooling/attendance
**Status:** ⚠️ checked — 403 (bot-blocked)

**Findings:** Attendance data exists. Not directly relevant to maths achievement charts. Skip for now.

---

## Source 8 — Education Counts: School Directory
**URL:** https://www.educationcounts.govt.nz/find-school/schoolreport.php
**Status:** ⚠️ checked — 403 (bot-blocked)

**Findings:** Not relevant for the maths achievement feature. Skip.

---

## Source 9 — TIMSS: NZ Year 5 Results
**URL:** https://timss2023.org, https://www.educationcounts.govt.nz/publications/series/2571
**Status:** ✅ checked — data found and extracted from TIMSS Excel files

### NZ TIMSS Grade 4 (Year 5) Maths — COMPLETE HISTORICAL DATA

**Data extracted from:** `1-1-10_ach-g4m-trend-table.xlsx` and `1-1-1_ach-g4m-dist.xlsx`

| Year | NZ Score | Girls | Boys | International Average |
|------|----------|-------|------|-----------------------|
| 1995 | 469 | 474 | 465 | ~529 |
| 2003 | 493 | 493 | 494 | ~495 |
| 2007 | 492 | 492 | 493 | ~473 |
| 2011 | 486 | 486 | 486 | ~491 |
| 2015 | 491 | 489 | 492 | ~493 |
| 2019 | 487 | 484 | 490 | ~502 |
| 2023 | **490** | 479 | 501 | **503** |

Note: International averages are approximate from search results and may vary. NZ 2023 rank: ~40th out of 58 countries.

**2023 Key comparisons:**
| Country | Score |
|---------|-------|
| Singapore | 615 |
| England | 552 |
| Australia | 525 |
| USA | 517 |
| International avg | 503 |
| **New Zealand** | **490** |
| France | 484 |

**Key trend:** NZ improved from 469 (1995) to ~490 (stable since ~2003). NZ has never been above international average.

---

## Source 10 — MoE TIMSS 2023 Landing Page
**URL:** https://www.educationcounts.govt.nz/publications/series/2571/timss-trends-in-international-mathematics-and-science-study-2023
**Status:** ⚠️ checked — 403 (bot-blocked)

**Findings:** TIMSS 2023 NZ report exists. Data obtained from timss2023.org instead.

---

## Source 11 — Stats NZ: Education Statistics
**URL:** https://www.stats.govt.nz/topics/education
**Status:** ⚠️ checked — page loaded but contains only analytics code (no content accessible)

**Findings:** Stats NZ education page likely has census-based education data. Not directly relevant to primary maths achievement. The NMSSA and TIMSS data is more relevant.

---

## Source 12 — data.govt.nz: Education Datasets
**URL:** https://catalogue.data.govt.nz/dataset?groups=education
**Status:** ❌ checked — bot-blocked (Incapsula security)

**Findings:** Could not access. Education data portal blocked.

---

## Source 13 — Education Counts: Progress and Consistency Tool (PaCT)
**URL:** https://www.educationcounts.govt.nz/statistics/schooling/pact
**Status:** ⚠️ checked — 403 (bot-blocked)

**Findings:** PaCT replaced National Standards as the teacher OTJ tool after 2017. Aggregate published data status unknown. Lower priority since NMSSA provides better-quality data.

---

## Summary & Recommendations

### Best Datasets Found ✅

**PRIORITY 1 — TIMSS (immediately buildable):**
- NZ Year 5 (Grade 4) maths scores 1995–2023 from TIMSS Excel files
- Already extracted: 7 data points, by gender, with international comparisons
- Available at: `timss2023.org/wp-content/uploads/2024/11/`
- **Build-ready: YES** — can seed DB directly

**PRIORITY 2 — NMSSA 2022/2018/2013 — COMPLETE (Phase 13):**
- All 3 cycles now seeded in `primary.db` → `nmssa_maths` (60 rows)
- 2022: from Report 30 Tables A2.1/A2.2
- 2018: extracted from Report 19 Tables A1.1/A1.2 (PDF downloaded from S3)
- 2013: back-calculated from 2018 linked-scale reconstruction (Report 19 Table 3.1 diffs)
  - Note: 2013 CIs are approximated from 2018 standard errors (similar sample sizes ~2000/yr level)
  - Note: 2013_NMSSA_MATHEMATICS.pdf URL returns AccessDenied — 2018 PDF contains the linked 2013 stats
- NMSSATrendChart built and live on /primary-maths

**PRIORITY 3 — Curriculum Insights 2023–2024 (build-ready for % data):**
- % meeting provisional benchmarks for Year 3, 6, and 8
- 2023: Y3 20%, Y6 28%, Y8 22%
- 2024: Y3 22%, Y6 30%, Y8 23%
- Detailed ethnicity/gender breakdown in interactive data windows only (needs browser assist)
- **Build-ready: YES for headline %** — needs browser for demographic breakdowns

### Data Limitations & Caveats

1. **Scale discontinuity 2022→2023:** NMSSA used MS units; Curriculum Insights uses % benchmarks. Not directly comparable on same chart without bridging.
2. **Year level change:** NMSSA measured Y4 and Y8. Curriculum Insights measures Y3, Y6, and Y8.
3. **TIMSS only every 4 years** — sparse longitudinal data
4. **No per-school data** for primary (unlike NZQA which has school-level NCEA data)
5. **Education Counts bot-blocked** — interactive NMSSA data windows and National Standards data require Claude Desktop browser access
6. **No direct CSV downloads** from NMSSA/Curriculum Insights — PDF extraction required for detailed tables

### Recommended Data Pipeline

```
Step 1: TIMSS (immediate)
  → Extract from Excel files already downloaded
  → Seed new table: timss_grade4
  → 7 rows per year (national + gender × year)

Step 2: NMSSA 2022 (immediate — data already extracted above)
  → Seed new table: nmssa_maths
  → Rows: (year, year_level, group_type, group_value, mean_score, ci_lower, ci_upper, sd, n)
  → 2022: Y4 and Y8, all group breakdowns above

Step 3: NMSSA 2013 and 2018 — COMPLETE (Phase 13)
  → nmssa_maths table now has 60 rows across 2013/2018/2022
  → 2013 URL (nmssa-production S3) returns AccessDenied — use 2018 report Table 3.1 diffs to back-calculate

Step 4: Curriculum Insights 2023–2024 (headline % data)
  → Seed: curriculum_insights_maths table
  → Rows: (year, year_level, pct_meeting, pct_less_than_1yr, pct_more_than_1yr)
  → Ethnicity breakdowns via Claude Desktop browser

Step 5 (optional): National Standards 2010–2017
  → Lower priority, reliability caveats
  → Requires browser access to Education Counts
```

### Recommended Visualisations

**Chart A: TIMSS International Trend Line** ← Build first, cleanest data
- NZ Year 5 maths trend 1995–2023 (line chart)
- With international average as reference line
- Comparison countries (Australia, England, Singapore) as context lines
- Gender split toggle (Girls vs Boys)

**Chart B: TIMSS 2023 International Comparison** ← Easy companion chart
- Horizontal bar chart, all 58 countries
- NZ highlighted, comparable English-speaking countries labelled
- Note NZ rank and position vs international average

**Chart C: NMSSA Achievement Gap** ← Most compelling for parents/educators
- Side-by-side comparison of mean scores by ethnicity (2022)
- Year 4 vs Year 8 split
- Show gap vs NZ European benchmark
- Decile band comparison (equity story)

**Chart D: Primary School Pipeline** ← Narrative chart
- Connects primary (NMSSA % at level) → secondary (NCEA pass rates)
- "Of students meeting expectations at Year 8, what % go on to pass NCEA Level 1 maths?"
- Requires careful data matching (NMSSA 2022 Y8 → NCEA 2024 cohort ~5 years later)

**Chart E: Curriculum Insights % Meeting Benchmarks** ← Simple but powerful
- Bar chart: Year 3, 6, 8 × 2023, 2024
- Shows where students are in the pipeline
- Simple: only ~6 data points but very readable

### Blockers / Limitations
- **PDF reading** needed for NMSSA 2013 and 2018 full tables (poppler installed ✓)
- **Claude Desktop browser** needed for NMSSA/Curriculum Insights interactive data window (ethnicity/gender % breakdowns for 2023–2024)
- **Education Counts 403** blocks all automated access to TIMSS detail pages, National Standards data, school roll data
- **No NMSSA data 2014–2017** (maths wasn't assessed in those NMSSA years — cycle rotated)
- **No NMSSA 2019–2021** (maths not assessed: Technology 2021, English 2019)
