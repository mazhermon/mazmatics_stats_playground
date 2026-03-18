import { NextRequest, NextResponse } from 'next/server';
import { getPrimaryDb } from '@/lib/db/primary';

export const dynamic = 'force-dynamic';

/**
 * GET /api/primary/timss?type=trend|intl
 *
 * type=trend — NZ Year 5 maths scores 1995–2023 (national + gender)
 * type=intl  — TIMSS 2023 international comparison (selected countries)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') ?? 'trend';

  if (type !== 'trend' && type !== 'intl') {
    return NextResponse.json({ error: 'Invalid type. Use trend or intl.' }, { status: 400 });
  }

  try {
    const sql = getPrimaryDb();

    if (type === 'trend') {
      const rows = await sql.unsafe(`
        SELECT id, year, group_type, group_value, mean_score, se, intl_avg
        FROM timss_nz_yr5
        ORDER BY year, group_type DESC, group_value
      `);
      return NextResponse.json({ data: rows, type });
    }

    // intl
    const rows = await sql.unsafe(`
      SELECT id, country, mean_score, se, is_nz
      FROM timss_intl_2023
      ORDER BY mean_score DESC
    `);
    return NextResponse.json({ data: rows, type });
  } catch (error) {
    console.error('[/api/primary/timss]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
