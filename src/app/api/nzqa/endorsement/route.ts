import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Primary year level for each qualification (the cohort where it's most commonly achieved).
 * Endorsement rows exist for all year_levels, but we filter to the primary one for clarity.
 */
const PRIMARY_YEAR_LEVEL: Record<string, number> = {
  'NCEA Level 1': 11,
  'NCEA Level 2': 12,
  'NCEA Level 3': 13,
  'University Entrance': 13,
};

/**
 * GET /api/nzqa/endorsement
 *   ?qualification=NCEA Level 3          ← NCEA Level 1 | NCEA Level 2 | NCEA Level 3 | University Entrance
 *   &groupBy=national                    ← national | ethnicity | equity_index_group | gender | region
 *   &yearFrom=2015
 *   &yearTo=2024
 *
 * Returns qualification endorsement data filtered to the primary year level for the qualification.
 * Rates reflect "of those who achieved the qualification, what % earned Excellence/Merit/No Endorsement".
 * Equity data available from 2019 only.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const qualification = searchParams.get('qualification') ?? 'NCEA Level 3';
  const groupBy = searchParams.get('groupBy') ?? 'national';
  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');

  const allowedQualifications = ['NCEA Level 1', 'NCEA Level 2', 'NCEA Level 3', 'University Entrance'];
  if (!allowedQualifications.includes(qualification)) {
    return NextResponse.json({ error: 'Invalid qualification' }, { status: 400 });
  }

  const allowedGroupBy = ['national', 'ethnicity', 'equity_index_group', 'gender', 'region'];
  if (!allowedGroupBy.includes(groupBy)) {
    return NextResponse.json({ error: 'Invalid groupBy' }, { status: 400 });
  }

  const yearLevel = PRIMARY_YEAR_LEVEL[qualification];
  const conditions: string[] = [`qualification = $1`, `year_level = $2`];
  const params: (string | number | null)[] = [qualification, yearLevel];
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
        SELECT year, excellence_rate, merit_rate, no_endorsement_rate,
               excellence_count, merit_count, no_endorsement_count,
               total_attainment, total_count
        FROM qualification_endorsement
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
        SELECT year, ${groupBy} as group_label,
               excellence_rate, merit_rate, no_endorsement_rate,
               excellence_count, merit_count, no_endorsement_count,
               total_attainment
        FROM qualification_endorsement
        WHERE ${dimConditions.join(' AND ')}
        ORDER BY year, ${groupBy}
      `;
      rows = await sql.unsafe(queryStr, params);
    }

    return NextResponse.json({ data: rows, qualification, groupBy });
  } catch (error) {
    console.error('[/api/nzqa/endorsement]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
