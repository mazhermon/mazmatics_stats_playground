import { renderHook, waitFor } from '@testing-library/react';
import { useNzqaData } from '@/lib/hooks/useNzqaData';

const mockFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  mockFetch.mockReset();
});

describe('useNzqaData', () => {
  it('initial state: loading=true, data=null, error=null', () => {
    // Never resolves during this synchronous check
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useNzqaData('/api/test'));
    expect(result.current).toEqual({ data: null, loading: true, error: null });
  });

  it('successful fetch → data populated, loading=false', async () => {
    const payload = { data: [{ year: 2024, level: 1 }] };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    const { result } = renderHook(() => useNzqaData('/api/test'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ data: payload, loading: false, error: null });
  });

  it('non-ok response → error set with HTTP status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const { result } = renderHook(() => useNzqaData('/api/test'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ data: null, loading: false, error: 'HTTP 404' });
  });

  it('network error → error set from thrown Error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNzqaData('/api/test'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ data: null, loading: false, error: 'Network error' });
  });

  it('url=null → never fetches, state is idle', () => {
    const { result } = renderHook(() => useNzqaData(null));
    expect(result.current).toEqual({ data: null, loading: false, error: null });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('url change resets loading before new fetch resolves', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { result, rerender } = renderHook(({ url }) => useNzqaData(url), {
      initialProps: { url: '/api/first' as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ url: '/api/second' });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('stale request cancelled — changing url before first fetch resolves', async () => {
    let resolveFirst!: (value: unknown) => void;
    const firstFetchPromise = new Promise<unknown>((res) => { resolveFirst = res; });
    const secondPayload = { data: [{ year: 2020 }] };

    mockFetch
      .mockReturnValueOnce(firstFetchPromise)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => secondPayload,
      });

    const { result, rerender } = renderHook(({ url }) => useNzqaData(url), {
      initialProps: { url: '/api/first' as string | null },
    });

    // Switch URL before first resolves
    rerender({ url: '/api/second' });

    // Resolve the stale first fetch
    resolveFirst({
      ok: true,
      json: async () => ({ data: [{ year: 9999 }] }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Final state should be from the second fetch, not the stale first
    expect(result.current.data).toEqual(secondPayload);
  });
});
