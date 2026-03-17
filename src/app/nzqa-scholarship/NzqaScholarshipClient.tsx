'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const ScholarshipTrendChart = dynamic(
  () => import('@/components/charts/ScholarshipTrendChart').then((m) => ({ default: m.ScholarshipTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);

export const ScholarshipBreakdownChart = dynamic(
  () => import('@/components/charts/ScholarshipBreakdownChart').then((m) => ({ default: m.ScholarshipBreakdownChart })),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> }
);
