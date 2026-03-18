'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse bg-slate-800 rounded-xl w-full" style={{ height }} />;
}

export const TIMSSTrendChart = dynamic(
  () => import('@/components/charts/TIMSSTrendChart').then((m) => ({ default: m.TIMSSTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);

export const TIMSSWorldRanking = dynamic(
  () => import('@/components/charts/TIMSSWorldRanking').then((m) => ({ default: m.TIMSSWorldRanking })),
  { ssr: false, loading: () => <ChartSkeleton height={560} /> }
);

export const NMSSAEquityGaps = dynamic(
  () => import('@/components/charts/NMSSAEquityGaps').then((m) => ({ default: m.NMSSAEquityGaps })),
  { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);

export const CurriculumInsightsPipeline = dynamic(
  () => import('@/components/charts/CurriculumInsightsPipeline').then((m) => ({ default: m.CurriculumInsightsPipeline })),
  { ssr: false, loading: () => <ChartSkeleton height={280} /> }
);

export const NMSSATrendChart = dynamic(
  () => import('@/components/charts/NMSSATrendChart').then((m) => ({ default: m.NMSSATrendChart })),
  { ssr: false, loading: () => <ChartSkeleton height={380} /> }
);
