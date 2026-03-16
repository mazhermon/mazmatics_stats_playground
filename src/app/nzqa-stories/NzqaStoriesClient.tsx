'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const WaffleGrid = dynamic(
  () => import('@/components/charts/WaffleGrid').then((m) => ({ default: m.WaffleGrid })),
  { ssr: false, loading: () => <ChartSkeleton height={400} /> }
);

export const BeeswarmChart = dynamic(
  () => import('@/components/charts/BeeswarmChart').then((m) => ({ default: m.BeeswarmChart })),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> }
);

export const SmallMultiplesChart = dynamic(
  () => import('@/components/charts/SmallMultiplesChart').then((m) => ({ default: m.SmallMultiplesChart })),
  { ssr: false, loading: () => <ChartSkeleton height={360} /> }
);
