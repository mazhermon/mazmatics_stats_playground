'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton() {
  return <div className="animate-pulse bg-slate-800/60 rounded-lg w-full" style={{ height: 180 }} />;
}

export const TIMSSPreview = dynamic(
  () => import('@/components/charts/previews/TIMSSPreview').then(m => ({ default: m.TIMSSPreview })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const SecondaryMathsPreview = dynamic(
  () => import('@/components/charts/previews/SecondaryMathsPreview').then(m => ({ default: m.SecondaryMathsPreview })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const LiteracyNumeracyPreview = dynamic(
  () => import('@/components/charts/previews/LiteracyNumeracyPreview').then(m => ({ default: m.LiteracyNumeracyPreview })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const CreativeViewsPreview = dynamic(
  () => import('@/components/charts/previews/CreativeViewsPreview').then(m => ({ default: m.CreativeViewsPreview })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
