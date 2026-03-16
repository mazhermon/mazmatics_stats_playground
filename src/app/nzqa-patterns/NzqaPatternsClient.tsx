'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const RidgelinePlot = dynamic(
  () => import('@/components/charts/RidgelinePlot').then((m) => ({ default: m.RidgelinePlot })),
  { ssr: false, loading: () => <ChartSkeleton height={400} /> }
);

export const HorizonChart = dynamic(
  () => import('@/components/charts/HorizonChart').then((m) => ({ default: m.HorizonChart })),
  { ssr: false, loading: () => <ChartSkeleton height={520} /> }
);

export const BubbleComparison = dynamic(
  () => import('@/components/charts/BubbleComparison').then((m) => ({ default: m.BubbleComparison })),
  { ssr: false, loading: () => <ChartSkeleton height={440} /> }
);
