/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/nzqa/subjects/route';

// Mock the DB module (same pattern as timeline.test.ts)
const mockAll = jest.fn();
const mockPrepare = jest.fn(() => ({ all: mockAll }));
jest.mock('@/lib/db', () => ({
  getDb: jest.fn(() => ({ prepare: mockPrepare })),
}));

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/nzqa/subjects');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

// Helper to capture the SQL passed to prepare()
function capturedSql(): string {
  const call = mockPrepare.mock.calls[0] as unknown as [string] | undefined;
  return call?.[0] ?? '';
}

describe('GET /api/nzqa/subjects', () => {
  beforeEach(() => {
    mockAll.mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('no params', () => {
    it('→ 200 with empty data array shape', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: [], count: 0 });
    });

    it('SQL has no WHERE clause when no params', async () => {
      await GET(makeRequest({}));
      const sql = capturedSql();
      expect(sql).not.toContain('WHERE');
    });
  });

  describe('year param', () => {
    it('year param → adds year = @year to SQL', async () => {
      await GET(makeRequest({ year: '2024' }));
      const sql = capturedSql();
      expect(sql).toContain('year = @year');
    });

    it('yearFrom + yearTo → adds range conditions', async () => {
      await GET(makeRequest({ yearFrom: '2019', yearTo: '2024' }));
      const sql = capturedSql();
      expect(sql).toContain('year >= @yearFrom');
      expect(sql).toContain('year <= @yearTo');
    });

    it('year param takes precedence over yearFrom/yearTo', async () => {
      await GET(makeRequest({ year: '2024', yearFrom: '2019', yearTo: '2023' }));
      const sql = capturedSql();
      expect(sql).toContain('year = @year');
      expect(sql).not.toContain('year >= @yearFrom');
    });
  });

  describe('dimension params', () => {
    it('region="Auckland" → adds region = @region (not IS NULL)', async () => {
      await GET(makeRequest({ region: 'Auckland' }));
      const sql = capturedSql();
      expect(sql).toContain('region = @region');
      expect(sql).not.toContain('region IS NULL');
    });

    it('region="null" (string) → adds region IS NULL', async () => {
      await GET(makeRequest({ region: 'null' }));
      const sql = capturedSql();
      expect(sql).toContain('region IS NULL');
      expect(sql).not.toContain('region = @region');
    });

    it('ethnicity="null" (string) → adds ethnicity IS NULL', async () => {
      await GET(makeRequest({ ethnicity: 'null' }));
      const sql = capturedSql();
      expect(sql).toContain('ethnicity IS NULL');
    });

    it('ethnicity="Māori" → adds ethnicity = @ethnicity', async () => {
      await GET(makeRequest({ ethnicity: 'Māori' }));
      const sql = capturedSql();
      expect(sql).toContain('ethnicity = @ethnicity');
    });

    it('gender="null" → adds gender IS NULL', async () => {
      await GET(makeRequest({ gender: 'null' }));
      const sql = capturedSql();
      expect(sql).toContain('gender IS NULL');
    });

    it('equityGroup="null" → adds equity_index_group IS NULL', async () => {
      await GET(makeRequest({ equityGroup: 'null' }));
      const sql = capturedSql();
      expect(sql).toContain('equity_index_group IS NULL');
    });

    it('level param → adds level = @level', async () => {
      await GET(makeRequest({ level: '1' }));
      const sql = capturedSql();
      expect(sql).toContain('level = @level');
    });
  });

  describe('regional drilldown pattern (used by RegionalMap)', () => {
    it('year + region + all-null dimensions → correct SQL shape', async () => {
      await GET(makeRequest({
        year: '2024',
        region: 'Auckland',
        ethnicity: 'null',
        gender: 'null',
        equityGroup: 'null',
      }));
      const sql = capturedSql();
      expect(sql).toContain('year = @year');
      expect(sql).toContain('region = @region');
      expect(sql).toContain('ethnicity IS NULL');
      expect(sql).toContain('gender IS NULL');
      expect(sql).toContain('equity_index_group IS NULL');
    });
  });

  describe('happy path with mock data', () => {
    it('returns correct count and data when DB has rows', async () => {
      const mockRows = [
        { year: 2024, level: 1, subject: 'Mathematics', achieved_rate: 0.6, region: 'Auckland' },
        { year: 2024, level: 2, subject: 'Mathematics', achieved_rate: 0.55, region: 'Auckland' },
      ];
      mockAll.mockReturnValue(mockRows);

      const res = await GET(makeRequest({ year: '2024', region: 'Auckland' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.count).toBe(2);
      expect(body.data[0]).toHaveProperty('achieved_rate', 0.6);
    });
  });

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
