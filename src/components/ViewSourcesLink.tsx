import { CHART_PAGE_META, ChartPageId } from '@/lib/data-sources';

interface ViewSourcesLinkProps {
  chartPageId: ChartPageId;
  variant?: 'chart' | 'page';
}

export function ViewSourcesLink({ chartPageId, variant = 'chart' }: ViewSourcesLinkProps) {
  const href = `/data-sources?chart=${chartPageId}`;

  if (variant === 'page') {
    return (
      <a
        href={href}
        className="text-xs font-mono px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-300 transition-all inline-flex items-center gap-1.5"
      >
        View all data sources for this page →
      </a>
    );
  }

  return (
    <a
      href={href}
      className="text-xs font-mono text-slate-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
      aria-label={`View data sources for ${CHART_PAGE_META[chartPageId].label}`}
    >
      View data sources →
    </a>
  );
}
