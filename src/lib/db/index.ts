import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'src/data/nzqa.db');
    db = new Database(dbPath, { readonly: true });
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export type SubjectRow = {
  id: number;
  year: number;
  level: number | null;
  subject: string;
  not_achieved_rate: number | null;
  achieved_rate: number | null;
  merit_rate: number | null;
  excellence_rate: number | null;
  assessed_count: number | null;
  not_achieved_count: number | null;
  achieved_count: number | null;
  merit_count: number | null;
  excellence_count: number | null;
  students_1plus_count: number | null;
  students_14plus_count: number | null;
  provider_count: number | null;
  gender: string | null;
  ethnicity: string | null;
  equity_index_group: string | null;
  region: string | null;
};

export type QualRow = {
  id: number;
  year: number;
  year_level: number | null;
  qualification: string;
  basis: string;
  cumulative_attainment_rate: number | null;
  current_attainment_rate: number | null;
  cumulative_attainment: number | null;
  current_attainment: number | null;
  total_count: number | null;
  gender: string | null;
  ethnicity: string | null;
  equity_index_group: string | null;
  region: string | null;
};

export type LitNumRow = {
  id: number;
  year: number;
  year_level: number | null;
  area: string;
  cumulative_attainment_rate: number | null;
  current_attainment_rate: number | null;
  cumulative_attainment: number | null;
  current_attainment: number | null;
  total_count: number | null;
  gender: string | null;
  ethnicity: string | null;
  equity_index_group: string | null;
  region: string | null;
};

export type ScholarshipRow = {
  id: number;
  year: number;
  subject: string | null;
  outstanding_rate: number | null;
  scholarship_rate: number | null;
  no_award_rate: number | null;
  outstanding_count: number | null;
  scholarship_count: number | null;
  no_award_count: number | null;
  total_assessed: number | null;
  total_students: number | null;
  gender: string | null;
  ethnicity: string | null;
  equity_index_group: string | null;
  region: string | null;
};

export type EndorsementRow = {
  id: number;
  year: number;
  year_level: number | null;
  qualification: string;
  excellence_rate: number | null;
  merit_rate: number | null;
  no_endorsement_rate: number | null;
  excellence_count: number | null;
  merit_count: number | null;
  no_endorsement_count: number | null;
  total_attainment: number | null;
  total_count: number | null;
  gender: string | null;
  ethnicity: string | null;
  equity_index_group: string | null;
  region: string | null;
};
