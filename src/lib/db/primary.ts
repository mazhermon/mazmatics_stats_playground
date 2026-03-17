import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getPrimaryDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'src/data/primary.db');
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

export interface TimssNzRow {
  id: number;
  year: number;
  group_type: string;
  group_value: string | null;
  mean_score: number;
  se: number | null;
  intl_avg: number | null;
}

export interface TimssIntlRow {
  id: number;
  country: string;
  mean_score: number;
  se: number | null;
  is_nz: number;
}

export interface NmssaRow {
  id: number;
  year: number;
  year_level: number;
  group_type: string;
  group_value: string | null;
  mean_score: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  sd: number | null;
  n: number | null;
  pct_at_curriculum_level: number | null;
}

export interface CurriculumInsightsRow {
  id: number;
  year: number;
  year_level: number;
  group_type: string;
  group_value: string | null;
  pct_meeting: number | null;
  pct_less_1yr: number | null;
  pct_more_1yr: number | null;
}
