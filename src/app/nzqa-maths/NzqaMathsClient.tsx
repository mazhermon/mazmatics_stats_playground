'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const TimelineExplorer = dynamic(
  () => import('@/components/charts/TimelineExplorer').then((m) => ({ default: m.TimelineExplorer })),
  { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);

export const EquityGapVisualizer = dynamic(
  () => import('@/components/charts/EquityGapVisualizer').then((m) => ({ default: m.EquityGapVisualizer })),
  { ssr: false, loading: () => <ChartSkeleton height={360} /> }
);

export const RegionalMap = dynamic(
  () => import('@/components/charts/RegionalMap').then((m) => ({ default: m.RegionalMap })),
  { ssr: false, loading: () => <ChartSkeleton height={480} /> }
);

export const AchievementLandscape = dynamic(
  () => import('@/components/three/AchievementLandscape').then((m) => ({ default: m.AchievementLandscape })),
  { ssr: false, loading: () => <ChartSkeleton height={420} /> }
);

export const ComparisonDashboard = dynamic(
  () => import('@/components/charts/ComparisonDashboard').then((m) => ({ default: m.ComparisonDashboard })),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);
