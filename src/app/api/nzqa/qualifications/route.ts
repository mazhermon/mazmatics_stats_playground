import { NextRequest, NextResponse } from 'next/server';
import { getDb, type QualRow } from '@/lib/db';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');
  const year = searchParams.get('year');
  const yearLevel = searchParams.get('yearLevel');
  const qualification = searchParams.get('qualification');
  const basis = searchParams.get('basis');
  const ethnicity = searchParams.get('ethnicity');
  const gender = searchParams.get('gender');
  const equityGroup = searchParams.get('equityGroup');
  const region = searchParams.get('region');

  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (year) {
    conditions.push('year = @year');
    params.year = parseInt(year, 10);
  } else {
    if (yearFrom) { conditions.push('year >= @yearFrom'); params.yearFrom = parseInt(yearFrom, 10); }
    if (yearTo) { conditions.push('year <= @yearTo'); params.yearTo = parseInt(yearTo, 10); }
  }
  if (yearLevel) { conditions.push('year_level = @yearLevel'); params.yearLevel = parseInt(yearLevel, 10); }
  if (qualification) { conditions.push('qualification LIKE @qualification'); params.qualification = `%${qualification}%`; }
  if (basis) { conditions.push('basis = @basis'); params.basis = basis; }

  if (ethnicity === 'null') {
    conditions.push('ethnicity IS NULL');
  } else if (ethnicity) {
    conditions.push('ethnicity = @ethnicity'); params.ethnicity = ethnicity;
  }

  if (gender === 'null') {
    conditions.push('gender IS NULL');
  } else if (gender) {
    conditions.push('gender = @gender'); params.gender = gender;
  }

  if (equityGroup === 'null') {
    conditions.push('equity_index_group IS NULL');
  } else if (equityGroup) {
    conditions.push('equity_index_group = @equityGroup'); params.equityGroup = equityGroup;
  }

  if (region === 'null') {
    conditions.push('region IS NULL');
  } else if (region) {
    conditions.push('region = @region'); params.region = region;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM qualification_attainment ${where} ORDER BY year, year_level, qualification`;

  try {
    const db = getDb();
    const rows = db.prepare(sql).all(params) as QualRow[];
    return NextResponse.json({ data: rows, count: rows.length });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
