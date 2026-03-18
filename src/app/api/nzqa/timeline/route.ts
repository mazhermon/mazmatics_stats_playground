import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=1
 *
 * Returns time-series data grouped by the specified dimension.
 * Used by TimelineExplorer and EquityGapVisualizer.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const metric = searchParams.get('metric') ?? 'achieved_rate';
  const groupBy = searchParams.get('groupBy') ?? 'national'; // national | ethnicity | equity_index_group | region | gender
  const level = searchParams.get('level');
  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');

  // Validate metric to prevent SQL injection
  const allowedMetrics = [
    'achieved_rate', 'merit_rate', 'excellence_rate', 'not_achieved_rate',
    'assessed_count', 'achieved_count', 'merit_count', 'excellence_count',
    'students_1plus_count', 'students_14plus_count',
  ];
  if (!allowedMetrics.includes(metric)) {
    return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
  }

  // Validate groupBy
  const allowedGroupBy = ['national', 'ethnicity', 'equity_index_group', 'region', 'gender'];
  if (!allowedGroupBy.includes(groupBy)) {
    return NextResponse.json({ error: 'Invalid groupBy' }, { status: 400 });
  }

  const conditions: string[] = [`subject ILIKE '%Mathematics%'`];
  const params: (string | number | null)[] = [];
  let p = 1;

  if (level) {
    const lvl = parseInt(level, 10);
    if (isNaN(lvl)) return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    conditions.push(`level = $${p++}`); params.push(lvl);
  }
  if (yearFrom) {
    const yf = parseInt(yearFrom, 10);
    if (isNaN(yf)) return NextResponse.json({ error: 'Invalid yearFrom' }, { status: 400 });
    conditions.push(`year >= $${p++}`); params.push(yf);
  }
  if (yearTo) {
    const yt = parseInt(yearTo, 10);
    if (isNaN(yt)) return NextResponse.json({ error: 'Invalid yearTo' }, { status: 400 });
    conditions.push(`year <= $${p++}`); params.push(yt);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  try {
    const sql = getDb();
    let rows: unknown[];

    if (groupBy === 'national') {
      // metric and groupBy are allowlist-validated — safe to interpolate as identifiers
      const queryStr = `
        SELECT year, level, ${metric} as value, assessed_count
        FROM subject_attainment
        ${where}
        AND gender IS NULL AND ethnicity IS NULL AND equity_index_group IS NULL AND region IS NULL
        ORDER BY year, level
      `;
      rows = await sql.unsafe(queryStr, params);
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

      const dimWhere = `WHERE ${dimConditions.join(' AND ')}`;
      // metric and groupBy are allowlist-validated above — safe to interpolate
      const queryStr = `
        SELECT year, level, ${groupBy} as group_label, ${metric} as value, assessed_count
        FROM subject_attainment
        ${dimWhere}
        ORDER BY year, level, ${groupBy}
      `;
      rows = await sql.unsafe(queryStr, params);
    }

    return NextResponse.json({ data: rows, metric, groupBy });
  } catch (error) {
    console.error('[/api/nzqa/timeline]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
