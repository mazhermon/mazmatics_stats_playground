'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const BumpChart = dynamic(
  () => import('@/components/charts/BumpChart').then((m) => ({ default: m.BumpChart })),
  { ssr: false, loading: () => <ChartSkeleton height={500} /> }
);

export const SlopeChart = dynamic(
  () => import('@/components/charts/SlopeChart').then((m) => ({ default: m.SlopeChart })),
  { ssr: false, loading: () => <ChartSkeleton height={420} /> }
);

export const StreamGraph = dynamic(
  () => import('@/components/charts/StreamGraph').then((m) => ({ default: m.StreamGraph })),
  { ssr: false, loading: () => <ChartSkeleton height={380} /> }
);
