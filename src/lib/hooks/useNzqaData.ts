'use client';

import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useNzqaData<T>(url: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!cancelled) setState({ data: null, loading: false, error: msg });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}

export interface TimelinePoint {
  year: number;
  level: number;
  value: number;
  assessed_count: number;
}

export interface TimelineGroupPoint extends TimelinePoint {
  group_label: string;
}

export interface TimelineResponse {
  data: TimelinePoint[] | TimelineGroupPoint[];
  metric: string;
  groupBy: string;
}

export interface SubjectRow {
  year: number;
  level: number | null;
  subject: string;
  achieved_rate: number | null;
  merit_rate: number | null;
  excellence_rate: number | null;
  not_achieved_rate: number | null;
  assessed_count: number | null;
  ethnicity: string | null;
  equity_index_group: string | null;
  region: string | null;
  gender: string | null;
}

export interface SubjectResponse {
  data: SubjectRow[];
  count: number;
}
