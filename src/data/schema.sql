-- Mazmatics Stats — Supabase Postgres Schema
-- Run this in the Supabase SQL editor before seeding.
-- All tables mirror the SQLite schema exactly.

-- ─── NZQA Tables ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subject_attainment (
  id                    SERIAL PRIMARY KEY,
  year                  INTEGER NOT NULL,
  level                 INTEGER,
  subject               TEXT NOT NULL,
  not_achieved_rate     FLOAT8,
  achieved_rate         FLOAT8,
  merit_rate            FLOAT8,
  excellence_rate       FLOAT8,
  assessed_count        INTEGER,
  not_achieved_count    INTEGER,
  achieved_count        INTEGER,
  merit_count           INTEGER,
  excellence_count      INTEGER,
  students_1plus_count  INTEGER,
  students_14plus_count INTEGER,
  provider_count        INTEGER,
  gender                TEXT,
  ethnicity             TEXT,
  equity_index_group    TEXT,
  region                TEXT,
  UNIQUE (year, level, subject, gender, ethnicity, equity_index_group, region)
);

CREATE TABLE IF NOT EXISTS qualification_attainment (
  id                         SERIAL PRIMARY KEY,
  year                       INTEGER NOT NULL,
  year_level                 INTEGER,
  qualification              TEXT NOT NULL,
  basis                      TEXT NOT NULL,
  cumulative_attainment_rate FLOAT8,
  current_attainment_rate    FLOAT8,
  cumulative_attainment      INTEGER,
  current_attainment         INTEGER,
  total_count                INTEGER,
  gender                     TEXT,
  ethnicity                  TEXT,
  equity_index_group         TEXT,
  region                     TEXT,
  UNIQUE (year, year_level, qualification, basis, gender, ethnicity, equity_index_group, region)
);

CREATE TABLE IF NOT EXISTS literacy_numeracy (
  id                         SERIAL PRIMARY KEY,
  year                       INTEGER NOT NULL,
  year_level                 INTEGER,
  area                       TEXT NOT NULL,
  cumulative_attainment_rate FLOAT8,
  current_attainment_rate    FLOAT8,
  cumulative_attainment      INTEGER,
  current_attainment         INTEGER,
  total_count                INTEGER,
  gender                     TEXT,
  ethnicity                  TEXT,
  equity_index_group         TEXT,
  region                     TEXT,
  UNIQUE (year, year_level, area, gender, ethnicity, equity_index_group, region)
);

CREATE TABLE IF NOT EXISTS scholarship (
  id                   SERIAL PRIMARY KEY,
  year                 INTEGER NOT NULL,
  subject              TEXT,
  outstanding_rate     FLOAT8,
  scholarship_rate     FLOAT8,
  no_award_rate        FLOAT8,
  outstanding_count    INTEGER,
  scholarship_count    INTEGER,
  no_award_count       INTEGER,
  total_assessed       INTEGER,
  total_students       INTEGER,
  gender               TEXT,
  ethnicity            TEXT,
  equity_index_group   TEXT,
  region               TEXT,
  UNIQUE (year, subject, gender, ethnicity, equity_index_group, region)
);

CREATE TABLE IF NOT EXISTS qualification_endorsement (
  id                    SERIAL PRIMARY KEY,
  year                  INTEGER NOT NULL,
  year_level            INTEGER,
  qualification         TEXT NOT NULL,
  excellence_rate       FLOAT8,
  merit_rate            FLOAT8,
  no_endorsement_rate   FLOAT8,
  excellence_count      INTEGER,
  merit_count           INTEGER,
  no_endorsement_count  INTEGER,
  total_attainment      INTEGER,
  total_count           INTEGER,
  gender                TEXT,
  ethnicity             TEXT,
  equity_index_group    TEXT,
  region                TEXT,
  UNIQUE (year, year_level, qualification, gender, ethnicity, equity_index_group, region)
);

-- ─── Primary School Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timss_nz_yr5 (
  id          SERIAL PRIMARY KEY,
  year        INTEGER NOT NULL,
  group_type  TEXT NOT NULL,
  group_value TEXT,
  mean_score  FLOAT8 NOT NULL,
  se          FLOAT8,
  intl_avg    FLOAT8
);

CREATE TABLE IF NOT EXISTS timss_intl_2023 (
  id         SERIAL PRIMARY KEY,
  country    TEXT NOT NULL,
  mean_score FLOAT8 NOT NULL,
  se         FLOAT8,
  is_nz      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS nmssa_maths (
  id                      SERIAL PRIMARY KEY,
  year                    INTEGER NOT NULL,
  year_level              INTEGER NOT NULL,
  group_type              TEXT NOT NULL,
  group_value             TEXT,
  mean_score              FLOAT8,
  ci_lower                FLOAT8,
  ci_upper                FLOAT8,
  sd                      FLOAT8,
  n                       INTEGER,
  pct_at_curriculum_level FLOAT8
);

CREATE TABLE IF NOT EXISTS curriculum_insights_maths (
  id           SERIAL PRIMARY KEY,
  year         INTEGER NOT NULL,
  year_level   INTEGER NOT NULL,
  group_type   TEXT NOT NULL,
  group_value  TEXT,
  pct_meeting  FLOAT8,
  pct_less_1yr FLOAT8,
  pct_more_1yr FLOAT8
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_subject_attainment_year ON subject_attainment (year);
CREATE INDEX IF NOT EXISTS idx_subject_attainment_subject ON subject_attainment (subject);
CREATE INDEX IF NOT EXISTS idx_qualification_attainment_year ON qualification_attainment (year);
CREATE INDEX IF NOT EXISTS idx_literacy_numeracy_year ON literacy_numeracy (year);
CREATE INDEX IF NOT EXISTS idx_scholarship_year ON scholarship (year);
CREATE INDEX IF NOT EXISTS idx_qualification_endorsement_year ON qualification_endorsement (year);
CREATE INDEX IF NOT EXISTS idx_nmssa_year_level ON nmssa_maths (year, year_level);
