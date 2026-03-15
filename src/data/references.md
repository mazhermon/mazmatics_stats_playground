# Data References — Mazmatics Stats Playground

This file documents every data source used in this application. All sources are official New Zealand government statistics, freely available to the public. This page exists so users and researchers can verify the data, access the originals, and understand how the data has been processed.

---

## 1. NZQA Secondary School Statistics — Subject Attainment (2015–2024)

**Publisher:** New Zealand Qualifications Authority (NZQA)
**Homepage:** https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/
**Licence:** New Zealand Government Open Access and Licensing (NZGOAL) — freely reusable with attribution
**Format:** CSV
**Last retrieved:** 2 March 2025 (as indicated by the `20250302` datestamp in filenames)

### What data was used

The `subject_attainment` table in the application database (`src/data/nzqa.db`) is built entirely from these CSV files. Only rows where `Secondary Subject` is **Mathematics** or **Mathematics - Statistics** were imported. The database contains **834 rows** covering years 2015–2024.

Each row records, for a given year, NCEA level, and breakdown dimension:

| Field | Description |
|-------|-------------|
| `year` | Academic year (2015–2024) |
| `level` | NCEA Level (1, 2, or 3) |
| `subject` | `Mathematics - Statistics` |
| `not_achieved_rate` | % of assessed students who did not achieve |
| `achieved_rate` | % who received the **Achieved** grade band only (does NOT include Merit or Excellence) |
| `merit_rate` | % who received Merit |
| `excellence_rate` | % who received Excellence |
| `assessed_count` | Total number of students assessed |
| `ethnicity` | Ethnicity breakdown dimension (null = national aggregate) |
| `gender` | Gender breakdown dimension (null = national aggregate) |
| `equity_index_group` | School Equity Index Group dimension (null = national aggregate) |
| `region` | NZQA region dimension (null = national aggregate) |

> **Important note on `achieved_rate`:** This field represents only the "Achieved" NCEA grade band — students who passed but did not reach Merit or Excellence. It is NOT the total pass rate. Total pass rate = `achieved_rate + merit_rate + excellence_rate`.

> **Important note on dimensions:** Each CSV contains a single breakdown dimension. No row has more than one non-null dimension column. Cross-tabulations (e.g. ethnicity × region) are not available in the source data.

### Source CSV files (2024 consolidated set)

All files are prefixed with:
```
https://www2.nzqa.govt.nz/assets/Qualifications-standards/Secondary-school-statistics/
```

| Breakdown | Filename |
|-----------|----------|
| National aggregate | `2024/Subject/Subject-Attainment-Statistics-National-2024-20250302.csv` |
| By gender | `2024/Subject/Subject-Attainment-Statistics-National-Gender-2024-20250302.csv` |
| By ethnicity | `2024/Subject/Subject-Attainment-Statistics-National-Ethnicity-2024-20250302.csv` |
| By school equity index group | `2024/Subject/Subject-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv` |
| By region | `2024/Subject/Subject-Attainment-Statistics-National-Region-2024-20250302.csv` |

These 2024 consolidated files each contain ~10 years of historical data (back to approximately 2015), which is why only the 2024 vintage was needed.

### Older-vintage files (2018 legacy data)

Eight additional legacy CSV files from the 2018 vintage are stored in `src/data/raw/nzqa/` for reference. These cover NCEA qualification attainment and literacy/numeracy using the older School Decile Band breakdown (before the School Equity Index replaced deciles in 2023).

| File | Content |
|------|---------|
| `NCEA-Qual-Attainment-2018-National.csv` | National NCEA qualification attainment |
| `NCEA-Qual-Attainment-2018-Ethnicity.csv` | By ethnicity |
| `NCEA-Qual-Attainment-2018-Gender.csv` | By gender |
| `NCEA-Qual-Attainment-2018-School-Decile-Band.csv` | By school decile band (pre-equity-index era) |
| `LitNum-2018-National.csv` | National literacy & numeracy attainment |
| `LitNum-2018-Ethnicity.csv` | By ethnicity |
| `LitNum-2018-Gender.csv` | By gender |
| `LitNum-2018-School-Decile-Band.csv` | By school decile band |

---

## 2. NZQA Secondary School Statistics — Qualification Attainment

**Publisher:** NZQA
**Homepage:** https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/
**Format:** CSV
**Last retrieved:** 2 March 2025

### What data was used

Two qualification attainment CSV sets were downloaded for context and future visualisations. The application seed script imports these into the `qual_attainment` table.

- **Participation-based** (Year 11 students / NCEA Level 1): tracks whether Year 11 students attained NCEA Level 1 in the current or a prior year
- **Enrolment-based** (Years 12–13 / NCEA Levels 2, 3, and University Entrance): tracks attainment for enrolled Year 12–13 students

Each set has five breakdowns: national, gender, ethnicity, equity index group, region.

| Breakdown | Participation file | Enrolment file |
|-----------|-------------------|----------------|
| National | `2024/Participation/Participation-Qualification-Attainment-Statistics-National-2024-20250302.csv` | `2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-2024-20250302.csv` |
| Gender | `...National-Gender-2024-20250302.csv` | `...National-Gender-2024-20250302.csv` |
| Ethnicity | `...National-Ethnicity-2024-20250302.csv` | `...National-Ethnicity-2024-20250302.csv` |
| Equity index group | `...National-School-Equity-Index-Group-2024-20250302.csv` | `...National-School-Equity-Index-Group-2024-20250302.csv` |
| Region | `...National-Region-2024-20250302.csv` | `...National-Region-2024-20250302.csv` |

---

## 3. NZQA Secondary School Statistics — Level 1 Literacy and Numeracy

**Publisher:** NZQA
**Homepage:** https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/
**Format:** CSV
**Last retrieved:** 2 March 2025

### What data was used

These files track attainment of the Level 1 Literacy and Numeracy co-requisites introduced with the NCEA Change Programme. Imported into the `lit_num_attainment` table.

Files follow the same five-breakdown pattern:
```
2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-{variant}-2024-20250302.csv
```

---

## 4. NZQA Secondary School Statistics — Qualification Endorsement

**Publisher:** NZQA
**Homepage:** https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/
**Format:** CSV
**Last retrieved:** 2 March 2025

### What data was used

These files track the proportion of students who earned Merit Endorsement, Excellence Endorsement, or no endorsement on their NCEA qualification (separate from individual standard grades). Imported into the `qual_endorsement` table.

Files follow the same five-breakdown pattern:
```
2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-{variant}-2024-20250302.csv
```

---

## 5. NZQA Secondary School Statistics — Scholarship

**Publisher:** NZQA
**Homepage:** https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/
**Format:** CSV
**Last retrieved:** 2 March 2025

### What data was used

These files track the proportion of students who earned NZQA Scholarship and Outstanding Scholarship awards by subject. Imported into the `scholarship_attainment` table.

Files follow the same five-breakdown pattern:
```
2024/Scholarship/Scholarship-Attainment-Statistics-National-{variant}-2024-20250302.csv
```

---

## 6. New Zealand Map Geometry (TopoJSON)

**Publisher:** Statistics New Zealand (Stats NZ) / derived open data
**Format:** TopoJSON
**Used in:** RegionalMap component (`src/components/charts/RegionalMap.tsx`)

The NZ regional boundary data used to draw the choropleth map is sourced from publicly available TopoJSON files representing the 16 NZQA regional groupings aligned to Stats NZ regional boundaries.

> **Note:** The exact TopoJSON source URL should be confirmed and recorded here when the RegionalMap component is audited. Check the `fetch()` call or static import in `RegionalMap.tsx` for the precise URL.

---

## How the data was processed

1. **Downloaded** — CSV files were downloaded from the NZQA statistics pages listed above
2. **Stored locally** — raw files saved to `src/data/raw/nzqa/` (not committed to version control due to file size)
3. **Seeded to SQLite** — `npx tsx src/scripts/seed-nzqa.ts` parses all CSVs and loads rows into `src/data/nzqa.db`
4. **Filtered** — only rows where `Secondary Subject` is `Mathematics` or `Mathematics - Statistics` are imported into `subject_attainment`
5. **Macron fix** — source CSVs encode `Māori` as `M?ori` (encoding loss during download). After seeding, an SQL UPDATE corrects this in all ethnicity fields
6. **Served via API** — the Next.js API routes at `/api/nzqa/subjects` and `/api/nzqa/timeline` query the SQLite database and return JSON to the visualisation components

---

## NZQA regions in the data

The 16 regional groupings used by NZQA (aligned to Stats NZ regions):

Auckland, Bay of Plenty, Canterbury, Gisborne, Hawke's Bay, Manawatū-Whanganui, Marlborough, Nelson, Northland, Otago, Southland, Taranaki, Tasman, Waikato, Wellington, West Coast

---

## Ethnicity groupings in the data

NZQA uses the following ethnicity categories (prioritised classification — each student is counted once):

- Asian
- European/Pākehā
- Māori
- Middle Eastern/Latin American/African
- Pacific Peoples

---

## School equity index groups

Since 2023, NZQA replaced the former school decile system with the School Equity Index. The groups used in the data are:

| Group label in data | Meaning |
|--------------------|---------|
| `Fewer` | Schools with fewer equity-related needs |
| `Moderate` | Schools with moderate equity-related needs |
| `More` | Schools with greater equity-related needs |

Pre-2023 data uses the older decile band labels: `Decile 1-3`, `Decile 4-7`, `Decile 8-10`.

---

## Supplementary references (not yet used in the application)

These sources are available for future visualisations:

| Source | URL | Content |
|--------|-----|---------|
| Education Counts — 18-year-olds with NCEA Level 2+ | https://www.educationcounts.govt.nz/statistics/18-year-olds-with-level-2-or-equivalent | Excel/CSV 2011–2022, breakdowns by gender, ethnicity, region, school type |
| NZQA Annual Reports (NCEA & Scholarship data) | https://www2.nzqa.govt.nz/assets/NCEA/Secondary-school-and-NCEA/Annual-Reports-NCEA-Scholarship-Data/ | PDFs 2009–2024 — narrative context, policy changes, pre-2014 data points |
| NZQA statistics older years (2018–2023) | https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/{year}/ | Same CSV structure as 2024 consolidated files |

---

*Last updated: 16 March 2026*
*Maintained by: Mazmatics Stats Playground project*
