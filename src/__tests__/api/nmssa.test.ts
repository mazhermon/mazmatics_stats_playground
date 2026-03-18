/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/primary/nmssa/route';

const mockAll = jest.fn();
const mockPrepare = jest.fn(() => ({ all: mockAll }));
jest.mock('@/lib/db/primary', () => ({
  getPrimaryDb: jest.fn(() => ({ prepare: mockPrepare })),
}));

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/primary/nmssa');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

const sampleRow = {
  id: 1,
  year: 2022,
  year_level: 8,
  group_type: 'national',
  group_value: null,
  mean_score: 115.8,
  ci_lower: 114.7,
  ci_upper: 116.9,
  sd: 21.3,
  n: 1960,
  pct_at_curriculum_level: 41.5,
};

describe('GET /api/primary/nmssa', () => {
  beforeEach(() => {
    mockAll.mockReturnValue([sampleRow]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Validation ─────────────────────────────────────────────────────────────

  describe('yearLevel validation', () => {
    it('invalid yearLevel → 400', async () => {
      const res = await GET(makeRequest({ yearLevel: '5' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/yearLevel/);
    });

    it('non-numeric yearLevel → 400', async () => {
      const res = await GET(makeRequest({ yearLevel: 'abc' }));
      expect(res.status).toBe(400);
    });

    it('yearLevel=4 → 200', async () => {
      const res = await GET(makeRequest({ yearLevel: '4' }));
      expect(res.status).toBe(200);
    });

    it('yearLevel=8 → 200', async () => {
      const res = await GET(makeRequest({ yearLevel: '8' }));
      expect(res.status).toBe(200);
    });

    it('yearLevel=all → 200', async () => {
      const res = await GET(makeRequest({ yearLevel: 'all' }));
      expect(res.status).toBe(200);
    });
  });

  describe('groupType validation', () => {
    it('invalid groupType → 400', async () => {
      const res = await GET(makeRequest({ groupType: 'hacker' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/groupType/i);
    });

    it.each(['all', 'national', 'gender', 'ethnicity', 'decile'])(
      'valid groupType "%s" → 200',
      async (groupType) => {
        const res = await GET(makeRequest({ groupType }));
        expect(res.status).toBe(200);
      }
    );
  });

  // ─── Multi-year response ─────────────────────────────────────────────────────

  describe('multi-year response', () => {
    it('returns data for multiple years when no year filter', async () => {
      const rows = [
        { ...sampleRow, year: 2013 },
        { ...sampleRow, year: 2018 },
        { ...sampleRow, year: 2022 },
      ];
      mockAll.mockReturnValue(rows);

      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(3);
      const years = body.data.map((r: { year: number }) => r.year);
      expect(years).toContain(2013);
      expect(years).toContain(2018);
      expect(years).toContain(2022);
    });

    it('response shape includes required fields', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('data');
      const row = body.data[0];
      expect(row).toHaveProperty('year');
      expect(row).toHaveProperty('year_level');
      expect(row).toHaveProperty('group_type');
      expect(row).toHaveProperty('mean_score');
      expect(row).toHaveProperty('ci_lower');
      expect(row).toHaveProperty('ci_upper');
    });
  });

  // ─── SQL generation ──────────────────────────────────────────────────────────

  describe('SQL generation', () => {
    it('yearLevel param → adds year_level condition', async () => {
      await GET(makeRequest({ yearLevel: '4' }));
      const sql = (mockPrepare.mock.calls[0] as [string])[0];
      expect(sql).toContain('year_level = @year_level');
    });

    it('groupType param → adds group_type condition', async () => {
      await GET(makeRequest({ groupType: 'ethnicity' }));
      const sql = (mockPrepare.mock.calls[0] as [string])[0];
      expect(sql).toContain('group_type = @group_type');
    });

    it('no params → no WHERE clause added (returns all)', async () => {
      await GET(makeRequest({}));
      const sql = (mockPrepare.mock.calls[0] as [string])[0];
      expect(sql).not.toContain('WHERE');
    });

    it('selects year column for multi-year ordering', async () => {
      await GET(makeRequest({}));
      const sql = (mockPrepare.mock.calls[0] as [string])[0];
      expect(sql).toContain('year');
    });
  });

  // ─── Happy path ──────────────────────────────────────────────────────────────

  describe('happy path', () => {
    it('default → 200 with data array', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('returns correct data values', async () => {
      const res = await GET(makeRequest({ yearLevel: '8', groupType: 'national' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data[0]).toMatchObject({
        year: 2022,
        year_level: 8,
        mean_score: 115.8,
        ci_lower: 114.7,
        ci_upper: 116.9,
      });
    });
  });

  // ─── DB failure ──────────────────────────────────────────────────────────────

  describe('DB failure', () => {
    it('DB throws → 500 with error message', async () => {
      mockAll.mockImplementation(() => { throw new Error('DB exploded'); });
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({ error: 'Database error' });
    });
  });
});
