import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/nzqa/scholarship
 *   ?subject=Calculus          ← Calculus | Statistics (default: Calculus)
 *   &groupBy=national          ← national | ethnicity | equity_index_group | region | gender
 *   &yearFrom=2015
 *   &yearTo=2024
 *
 * Returns scholarship award data from the `scholarship` table.
 * Equity data available from 2019 only.
 */
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const subject = searchParams.get('subject') ?? 'Calculus';
  const groupBy = searchParams.get('groupBy') ?? 'national';
  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');

  const allowedSubjects = ['Calculus', 'Statistics'];
  if (!allowedSubjects.includes(subject)) {
    return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
  }

  const allowedGroupBy = ['national', 'ethnicity', 'equity_index_group', 'region', 'gender'];
  if (!allowedGroupBy.includes(groupBy)) {
    return NextResponse.json({ error: 'Invalid groupBy' }, { status: 400 });
  }

  const conditions: string[] = ['subject = @subject'];
  const params: Record<string, string | number> = { subject };

  if (yearFrom) {
    const yf = parseInt(yearFrom, 10);
    if (isNaN(yf)) return NextResponse.json({ error: 'Invalid yearFrom' }, { status: 400 });
    conditions.push('year >= @yearFrom');
    params.yearFrom = yf;
  }
  if (yearTo) {
    const yt = parseInt(yearTo, 10);
    if (isNaN(yt)) return NextResponse.json({ error: 'Invalid yearTo' }, { status: 400 });
    conditions.push('year <= @yearTo');
    params.yearTo = yt;
  }

  try {
    const db = getDb();
    let rows: unknown[];

    if (groupBy === 'national') {
      const sql = `
        SELECT year, outstanding_rate, scholarship_rate, no_award_rate,
               outstanding_count, scholarship_count, no_award_count, total_assessed
        FROM scholarship
        WHERE ${conditions.join(' AND ')}
          AND gender IS NULL AND ethnicity IS NULL AND equity_index_group IS NULL AND region IS NULL
        ORDER BY year
      `;
      rows = db.prepare(sql).all(params);
    } else {
      const dimConditions = [...conditions];

      if (groupBy === 'ethnicity') {
        dimConditions.push('ethnicity IS NOT NULL');
        dimConditions.push('gender IS NULL');
        dimConditions.push('equity_index_group IS NULL');
        dimConditions.push('region IS NULL');
      } else if (groupBy === 'equity_index_group') {
        dimConditions.push('equity_index_group IS NOT NULL');
        dimConditions.push('gender IS NULL');
        dimConditions.push('ethnicity IS NULL');
        dimConditions.push('region IS NULL');
      } else if (groupBy === 'region') {
        dimConditions.push('region IS NOT NULL');
        dimConditions.push('gender IS NULL');
        dimConditions.push('ethnicity IS NULL');
        dimConditions.push('equity_index_group IS NULL');
      } else if (groupBy === 'gender') {
        dimConditions.push('gender IS NOT NULL');
        dimConditions.push('ethnicity IS NULL');
        dimConditions.push('equity_index_group IS NULL');
        dimConditions.push('region IS NULL');
      }

      // groupBy is allowlist-validated above — safe to interpolate as column name
      const sql = `
        SELECT year, ${groupBy} as group_label,
               outstanding_rate, scholarship_rate, no_award_rate,
               outstanding_count, scholarship_count, no_award_count, total_assessed
        FROM scholarship
        WHERE ${dimConditions.join(' AND ')}
        ORDER BY year, ${groupBy}
      `;
      rows = db.prepare(sql).all(params);
    }

    return NextResponse.json({ data: rows, subject, groupBy });
  } catch (error) {
    console.error('[/api/nzqa/scholarship]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
