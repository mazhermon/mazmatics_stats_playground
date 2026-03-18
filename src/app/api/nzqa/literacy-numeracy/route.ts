import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/nzqa/literacy-numeracy
 *   ?area=numeracy            ← literacy | numeracy (default: numeracy)
 *   &yearLevel=11             ← 11 | 12 | 13 (default: 11)
 *   &groupBy=national         ← national | ethnicity | equity_index_group | gender | region
 *   &yearFrom=2009
 *   &yearTo=2024
 *
 * Returns co-requisite literacy/numeracy attainment data.
 * current_attainment_rate  = passed for the first time this year
 * cumulative_attainment_rate = have ever passed by this year level
 *
 * Note: equity_index_group has two formats in the data:
 *   2009–2018: Decile 1-3 | Decile 4-7 | Decile 8-10
 *   2019–2024: Fewer | Moderate | More
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const area = searchParams.get('area') ?? 'numeracy';
  const yearLevelParam = searchParams.get('yearLevel') ?? '11';
  const groupBy = searchParams.get('groupBy') ?? 'national';
  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');

  const allowedAreas = ['literacy', 'numeracy'];
  if (!allowedAreas.includes(area)) {
    return NextResponse.json({ error: 'Invalid area' }, { status: 400 });
  }

  const yearLevel = parseInt(yearLevelParam, 10);
  if (isNaN(yearLevel) || ![11, 12, 13].includes(yearLevel)) {
    return NextResponse.json({ error: 'Invalid yearLevel — must be 11, 12, or 13' }, { status: 400 });
  }

  const allowedGroupBy = ['national', 'ethnicity', 'equity_index_group', 'gender', 'region'];
  if (!allowedGroupBy.includes(groupBy)) {
    return NextResponse.json({ error: 'Invalid groupBy' }, { status: 400 });
  }

  const conditions: string[] = [`area = $1`, `year_level = $2`];
  const params: (string | number | null)[] = [area, yearLevel];
  let p = 3;

  if (yearFrom) {
    const yf = parseInt(yearFrom, 10);
    if (isNaN(yf)) return NextResponse.json({ error: 'Invalid yearFrom' }, { status: 400 });
    conditions.push(`year >= $${p++}`);
    params.push(yf);
  }
  if (yearTo) {
    const yt = parseInt(yearTo, 10);
    if (isNaN(yt)) return NextResponse.json({ error: 'Invalid yearTo' }, { status: 400 });
    conditions.push(`year <= $${p++}`);
    params.push(yt);
  }

  try {
    const sql = getDb();
    let rows: unknown[];

    if (groupBy === 'national') {
      const queryStr = `
        SELECT year, area, year_level,
               current_attainment_rate, cumulative_attainment_rate,
               current_attainment, cumulative_attainment, total_count
        FROM literacy_numeracy
        WHERE ${conditions.join(' AND ')}
          AND gender IS NULL AND ethnicity IS NULL AND equity_index_group IS NULL AND region IS NULL
        ORDER BY year
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
      } else if (groupBy === 'gender') {
        dimConditions.push('gender IS NOT NULL');
        dimConditions.push('ethnicity IS NULL');
        dimConditions.push('equity_index_group IS NULL');
        dimConditions.push('region IS NULL');
      } else if (groupBy === 'region') {
        dimConditions.push('region IS NOT NULL');
        dimConditions.push('gender IS NULL');
        dimConditions.push('ethnicity IS NULL');
        dimConditions.push('equity_index_group IS NULL');
      }

      // groupBy is allowlist-validated above — safe to interpolate as column name
      const queryStr = `
        SELECT year, ${groupBy} as group_label, area, year_level,
               current_attainment_rate, cumulative_attainment_rate,
               current_attainment, cumulative_attainment, total_count
        FROM literacy_numeracy
        WHERE ${dimConditions.join(' AND ')}
        ORDER BY year, ${groupBy}
      `;
      rows = await sql.unsafe(queryStr, params);
    }

    return NextResponse.json({ data: rows, area, yearLevel, groupBy });
  } catch (error) {
    console.error('[/api/nzqa/literacy-numeracy]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
