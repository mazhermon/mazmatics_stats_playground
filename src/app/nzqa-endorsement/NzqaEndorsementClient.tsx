'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const EndorsementTrendChart = dynamic(
  () => import('@/components/charts/EndorsementTrendChart').then((m) => ({ default: m.EndorsementTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);

export const EndorsementBreakdownChart = dynamic(
  () => import('@/components/charts/EndorsementBreakdownChart').then((m) => ({ default: m.EndorsementBreakdownChart })),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> }
);
