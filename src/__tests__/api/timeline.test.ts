/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/nzqa/timeline/route';

// Mock the DB module
const mockAll = jest.fn();
const mockPrepare = jest.fn(() => ({ all: mockAll }));
jest.mock('@/lib/db', () => ({
  getDb: jest.fn(() => ({ prepare: mockPrepare })),
}));

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/nzqa/timeline');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/nzqa/timeline', () => {
  beforeEach(() => {
    mockAll.mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('metric validation', () => {
    it('invalid metric → 400', async () => {
      const res = await GET(makeRequest({ metric: 'bad_field' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid metric' });
    });

    it('valid metric → 200', async () => {
      const res = await GET(makeRequest({ metric: 'achieved_rate' }));
      expect(res.status).toBe(200);
    });
  });

  describe('groupBy validation', () => {
    it('invalid groupBy → 400', async () => {
      const res = await GET(makeRequest({ groupBy: 'hacker' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid groupBy' });
    });

    it('valid groupBy → 200', async () => {
      const res = await GET(makeRequest({ groupBy: 'ethnicity' }));
      expect(res.status).toBe(200);
    });
  });

  describe('level validation (after fix)', () => {
    it('non-numeric level → 400', async () => {
      const res = await GET(makeRequest({ level: 'abc' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid level' });
    });

    it('numeric level → 200', async () => {
      const res = await GET(makeRequest({ level: '1' }));
      expect(res.status).toBe(200);
    });
  });

  describe('yearFrom/yearTo validation (after fix)', () => {
    it('non-numeric yearFrom → 400', async () => {
      const res = await GET(makeRequest({ yearFrom: 'nope' }));
      expect(res.status).toBe(400);
    });

    it('non-numeric yearTo → 400', async () => {
      const res = await GET(makeRequest({ yearTo: 'nope' }));
      expect(res.status).toBe(400);
    });
  });

  describe('happy path', () => {
    it('valid params with empty DB result → 200 with data shape', async () => {
      mockAll.mockReturnValue([]);
      const res = await GET(makeRequest({ metric: 'achieved_rate', groupBy: 'national' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: [], metric: 'achieved_rate', groupBy: 'national' });
    });
  });

  describe('DB failure', () => {
    it('DB throws → 500', async () => {
      mockAll.mockImplementation(() => { throw new Error('DB exploded'); });
      const res = await GET(makeRequest({ metric: 'achieved_rate' }));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({ error: 'Database error' });
    });
  });
});
