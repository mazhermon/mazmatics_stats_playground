import { CHART_PAGE_SOURCES, DATA_SOURCES, ChartPageId } from '@/lib/data-sources';
import { ViewSourcesLink } from './ViewSourcesLink';

interface PageSourcesFooterProps {
  chartPageId: ChartPageId;
}

export function PageSourcesFooter({ chartPageId }: PageSourcesFooterProps) {
  const sourceIds = CHART_PAGE_SOURCES[chartPageId];
  const sources = DATA_SOURCES.filter((s) => sourceIds.includes(s.id));

  return (
    <div className="space-y-3 pt-4">
      <div className="h-px bg-slate-800" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-600 font-mono">Data sources used on this page:</span>
        {sources.map((source) => (
          <span
            key={source.id}
            className="bg-slate-800/60 text-slate-500 rounded-full px-2 py-0.5 text-xs font-mono"
          >
            {source.name}
          </span>
        ))}
      </div>
      <div>
        <ViewSourcesLink chartPageId={chartPageId} variant="page" />
      </div>
    </div>
  );
}
