'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DATA_SOURCES,
  CHART_PAGE_META,
  CHART_PAGE_SOURCES,
  getChartsForSource,
  ChartPageId,
  SourceId,
} from '@/lib/data-sources';

interface DataSourcesClientProps {
  initialChart?: ChartPageId;
  initialSource?: SourceId;
}

function GradientHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-bold scroll-mt-20"
      style={{
        background: 'linear-gradient(to left, #47A5F1, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </h2>
  );
}

function Caveat({ type, children }: { type: 'warning' | 'info'; children: React.ReactNode }) {
  return (
    <li className={type === 'warning' ? 'text-amber-500/80' : 'text-slate-400'}>
      {children}
    </li>
  );
}

export function DataSourcesClient({ initialChart, initialSource }: DataSourcesClientProps) {
  const router = useRouter();
  const [activeChart, setActiveChartState] = useState<ChartPageId | null>(initialChart ?? null);
  const [activeSource, setActiveSourceState] = useState<SourceId | null>(initialSource ?? null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Sync URL when filter changes
  const setActiveChart = (value: ChartPageId | null) => {
    setActiveChartState(value);
    setActiveSourceState(null);
    const params = new URLSearchParams();
    if (value) params.set('chart', value);
    router.push(`/data-sources${params.size ? '?' + params.toString() : ''}`, { scroll: false });
  };

  const setActiveSource = (value: SourceId | null) => {
    setActiveSourceState(value);
    setActiveChartState(null);
    const params = new URLSearchParams();
    if (value) params.set('source', value);
    router.push(`/data-sources${params.size ? '?' + params.toString() : ''}`, { scroll: false });
  };

  const clearFilters = () => {
    setActiveChartState(null);
    setActiveSourceState(null);
    router.push('/data-sources', { scroll: false });
  };

  // Scroll to first matching card when filter activates
  useEffect(() => {
    if (activeChart) {
      const matchingSourceIds = CHART_PAGE_SOURCES[activeChart];
      const firstId = matchingSourceIds[0];
      if (firstId && cardRefs.current[firstId]) {
        cardRefs.current[firstId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (activeSource) {
      if (cardRefs.current[activeSource]) {
        cardRefs.current[activeSource]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeChart, activeSource]);

  const isCardHighlighted = (sourceId: SourceId): boolean => {
    if (activeChart) return CHART_PAGE_SOURCES[activeChart].includes(sourceId);
    if (activeSource) return activeSource === sourceId;
    return false;
  };

  const isCardDimmed = (sourceId: SourceId): boolean => {
    if (activeChart) return !CHART_PAGE_SOURCES[activeChart].includes(sourceId);
    return false;
  };

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundColor: '#020617',
        backgroundImage: `
          linear-gradient(rgba(71,165,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(71,165,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
          >
            ← All explorers
          </Link>
          <span
            className="text-sm font-semibold"
            style={{
              background: 'linear-gradient(to left, #47A5F1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mazmatics
          </span>
          <span className="text-xs text-slate-600 font-mono hidden sm:block">Data Sources</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            About the data
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(to left, #47A5F1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Data Sources &amp; Methodology
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            All data used across Mazmatics Stats is publicly sourced from NZ government bodies and
            international research organisations. Every source is linked below so you can verify the
            numbers independently and understand how they were collected.
          </p>
        </header>

        {/* Jump links */}
        <nav aria-label="Jump to source" className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((source) => (
            <a
              key={source.id}
              href={`#source-${source.id}`}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full px-3 py-1 text-xs font-mono transition-colors"
            >
              {source.name}
            </a>
          ))}
        </nav>

        {/* Filter UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Panel A: Find sources for an explorer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Find sources for a specific explorer
            </p>
            <select
              value={activeChart ?? ''}
              onChange={(e) => setActiveChart((e.target.value as ChartPageId) || null)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              <option value="">All explorers</option>
              {(Object.entries(CHART_PAGE_META) as [ChartPageId, { label: string; href: string }][]).map(([id, meta]) => (
                <option key={id} value={id}>{meta.label}</option>
              ))}
            </select>
          </div>

          {/* Panel B: Find explorers by dataset */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Find explorers that use a specific dataset
            </p>
            <select
              value={activeSource ?? ''}
              onChange={(e) => setActiveSource((e.target.value as SourceId) || null)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              <option value="">All datasets</option>
              {DATA_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {activeSource && (
              <div className="flex flex-wrap gap-2 pt-1">
                {getChartsForSource(activeSource).map((chartId) => (
                  <a
                    key={chartId}
                    href={CHART_PAGE_META[chartId].href}
                    className="bg-teal-900/30 border border-teal-500/30 text-teal-300 rounded-full px-2.5 py-0.5 text-xs font-mono hover:bg-teal-900/50 transition-colors"
                  >
                    {CHART_PAGE_META[chartId].label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter active banner */}
        {(activeChart || activeSource) && (
          <div className="border border-teal-500/30 bg-teal-950/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-teal-300 font-mono">
              {activeChart
                ? `Showing sources for: ${CHART_PAGE_META[activeChart].label}`
                : `Showing explorers that use: ${DATA_SOURCES.find((s) => s.id === activeSource)?.name}`}
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 rounded-full px-3 py-1 transition-all shrink-0"
            >
              × Clear filters
            </button>
          </div>
        )}

        {/* Source cards */}
        <div className="space-y-8">
          {DATA_SOURCES.map((source) => {
            const highlighted = isCardHighlighted(source.id);
            const dimmed = isCardDimmed(source.id);
            const usedByCharts = getChartsForSource(source.id);

            return (
              <section
                key={source.id}
                id={`source-${source.id}`}
                ref={(el) => { cardRefs.current[source.id] = el; }}
                className={[
                  'bg-slate-900 border rounded-xl p-6 space-y-4 scroll-mt-20 transition-all duration-300',
                  highlighted ? 'border-teal-500/40 bg-teal-950/10' : 'border-slate-800',
                  dimmed ? 'opacity-40' : '',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <GradientHeading id={`source-${source.id}-heading`}>
                    {source.name}
                  </GradientHeading>
                  {usedByCharts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {usedByCharts.map((chartId) => (
                        <Link
                          key={chartId}
                          href={CHART_PAGE_META[chartId].href}
                          className="inline-block bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-full px-2 py-0.5 text-xs font-mono transition-colors"
                        >
                          {CHART_PAGE_META[chartId].href}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <dt className="text-slate-600 uppercase tracking-wider mb-1">Publisher</dt>
                    <dd className="text-slate-300">{source.publisher}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600 uppercase tracking-wider mb-1">Years</dt>
                    <dd className="text-slate-300">{source.years}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600 uppercase tracking-wider mb-1">
                      {source.urls.length === 1 ? 'Source URL' : 'Source URLs'}
                    </dt>
                    <dd className="space-y-1">
                      {source.urls.map((u) => (
                        <a
                          key={u.url}
                          href={u.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline block"
                        >
                          {u.label}
                        </a>
                      ))}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">What we use</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{source.description}</p>
                </div>

                {source.caveats.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Key caveats</h3>
                    <ul className="text-sm space-y-1.5 list-disc list-inside">
                      {source.caveats.map((caveat, i) => (
                        <Caveat key={i} type={caveat.type}>
                          {caveat.text}
                        </Caveat>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {source.urls.map((u) => (
                    <a
                      key={u.url}
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all"
                    >
                      {source.urls.length === 1 ? 'View original source ↗' : u.label}
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="space-y-2 pb-8 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 font-mono">
            All data is publicly sourced from NZ government bodies and international research organisations.
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · data from NZQA 2015–2024 · TIMSS 2023 · NMSSA 2013/2018/2022 · Curriculum Insights 2024
          </p>
        </footer>

      </main>
    </div>
  );
}
