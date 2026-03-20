import type { Metadata } from 'next';
import { DataSourcesClient } from './DataSourcesClient';
import { ChartPageId, SourceId } from '@/lib/data-sources';

export const metadata: Metadata = {
  title: 'Data Sources & Methodology — Mazmatics',
  description:
    'All data sources used across Mazmatics Stats — NZQA, TIMSS, NMSSA, and Curriculum Insights. Verify the numbers independently.',
};

export default async function DataSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ chart?: string; source?: string }>;
}) {
  const params = await searchParams;
  return (
    <DataSourcesClient
      initialChart={params.chart as ChartPageId | undefined}
      initialSource={params.source as SourceId | undefined}
    />
  );
}
