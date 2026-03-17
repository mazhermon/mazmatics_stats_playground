'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const LiteracyNumeracyTrendChart = dynamic(
  () => import('@/components/charts/LiteracyNumeracyTrendChart').then((m) => ({ default: m.LiteracyNumeracyTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);

export const LiteracyNumeracyBreakdownChart = dynamic(
  () => import('@/components/charts/LiteracyNumeracyBreakdownChart').then((m) => ({ default: m.LiteracyNumeracyBreakdownChart })),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> }
);
