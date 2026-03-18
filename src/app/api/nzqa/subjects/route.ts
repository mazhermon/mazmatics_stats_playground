import { NextRequest, NextResponse } from 'next/server';
import { getDb, type SubjectRow } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');
  const year = searchParams.get('year');
  const level = searchParams.get('level');
  const ethnicity = searchParams.get('ethnicity');
  const gender = searchParams.get('gender');
  const equityGroup = searchParams.get('equityGroup');
  const region = searchParams.get('region');
  const subject = searchParams.get('subject');

  const conditions: string[] = [];
  const params: (string | number | null)[] = [];
  let p = 1;

  if (year) {
    conditions.push(`year = $${p++}`);
    params.push(parseInt(year, 10));
  } else {
    if (yearFrom) { conditions.push(`year >= $${p++}`); params.push(parseInt(yearFrom, 10)); }
    if (yearTo) { conditions.push(`year <= $${p++}`); params.push(parseInt(yearTo, 10)); }
  }
  if (level) { conditions.push(`level = $${p++}`); params.push(parseInt(level, 10)); }
  if (subject) { conditions.push(`subject ILIKE $${p++}`); params.push(`%${subject}%`); }

  if (ethnicity === 'null') {
    conditions.push('ethnicity IS NULL');
  } else if (ethnicity) {
    conditions.push(`ethnicity = $${p++}`); params.push(ethnicity);
  }

  if (gender === 'null') {
    conditions.push('gender IS NULL');
  } else if (gender) {
    conditions.push(`gender = $${p++}`); params.push(gender);
  }

  if (equityGroup === 'null') {
    conditions.push('equity_index_group IS NULL');
  } else if (equityGroup) {
    conditions.push(`equity_index_group = $${p++}`); params.push(equityGroup);
  }

  if (region === 'null') {
    conditions.push('region IS NULL');
  } else if (region) {
    conditions.push(`region = $${p++}`); params.push(region);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const queryStr = `SELECT * FROM subject_attainment ${where} ORDER BY year, level, subject`;

  try {
    const sql = getDb();
    const rows = await sql.unsafe(queryStr, params) as SubjectRow[];
    return NextResponse.json({ data: rows, count: rows.length });
  } catch (error) {
    console.error('[/api/nzqa/subjects]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
