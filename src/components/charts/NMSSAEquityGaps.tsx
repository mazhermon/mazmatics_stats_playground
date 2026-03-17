'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NmssaRow {
  id: number;
  year: number;
  year_level: number;
  group_type: string;
  group_value: string | null;
  mean_score: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  sd: number | null;
  n: number | null;
  pct_at_curriculum_level: number | null;
}

type GroupDimension = 'ethnicity' | 'decile' | 'gender';

const DIMENSION_OPTIONS: { key: GroupDimension; label: string }[] = [
  { key: 'ethnicity', label: 'By ethnicity' },
  { key: 'decile',    label: 'By decile' },
  { key: 'gender',    label: 'By gender' },
];

const GROUP_COLOURS: Record<string, string> = {
  // Ethnicity
  'Māori':       '#f59e0b',
  'Pacific':     '#ef4444',
  'Asian':       '#10b981',
  'NZ European': '#60a5fa',
  // Decile
  'Low':  '#ef4444',
  'Mid':  '#f59e0b',
  'High': '#10b981',
  // Gender
  'Girls': '#f472b6',
  'Boys':  '#60a5fa',
};

const DEFAULT_COLOUR = '#8b5cf6';

const YEAR4_COLOUR = '#BA90FF';
const YEAR8_COLOUR = '#47A5F1';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NMSSAEquityGaps() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rows, setRows]         = useState<NmssaRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [dimension, setDimension] = useState<GroupDimension>('ethnicity');
  const [tooltip, setTooltip]   = useState<{ x: number; y: number; text: string[]; visible: boolean }>({
    x: 0, y: 0, text: [], visible: false,
  });

  useEffect(() => {
    fetch('/api/primary/nmssa')
      .then((r) => r.json())
      .then((d: { data: NmssaRow[] }) => { setRows(d.data); setLoading(false); })
      .catch(() => { setError('Failed to load NMSSA data'); setLoading(false); });
  }, []);

  const draw = useCallback(() => {
    if (!svgRef.current || !wrapRef.current || rows.length === 0) return;

    // Filter to selected dimension + national baseline
    const dimRows = rows.filter((r) => r.group_type === dimension);
    const y4national = rows.find((r) => r.year_level === 4 && r.group_type === 'national')?.mean_score ?? 84;
    const y8national = rows.find((r) => r.year_level === 8 && r.group_type === 'national')?.mean_score ?? 115.8;

    const groups = [...new Set(dimRows.map((r) => r.group_value).filter(Boolean))] as string[];
    const y4rows = dimRows.filter((r) => r.year_level === 4);
    const y8rows = dimRows.filter((r) => r.year_level === 8);

    const containerW = wrapRef.current.clientWidth;
    const margin = { top: 24, right: 16, bottom: 48, left: 52 };
    const groupW = 2; // 2 bars per group (Y4 + Y8)
    const bandPad = 0.25;
    const innerPad = 0.15;
    const height = 300 - margin.top - margin.bottom;
    const width  = containerW - margin.left - margin.right;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${containerW} ${300}`)
      .attr('width', containerW)
      .attr('height', 300);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const allScores = [...y4rows, ...y8rows].map((r) => r.mean_score).filter(Boolean) as number[];
    const yMin = Math.max(60, (d3.min(allScores) ?? 70) - 5);
    const yMax = (d3.max(allScores) ?? 130) + 8;

    const xOuter = d3.scaleBand<string>()
      .domain(groups)
      .range([0, width])
      .paddingInner(bandPad)
      .paddingOuter(0.1);

    const xInner = d3.scaleBand<string>()
      .domain(['Y4', 'Y8'])
      .range([0, xOuter.bandwidth()])
      .paddingInner(innerPad);

    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => '').ticks(5))
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,4');
    g.select('.domain').remove();

    // National avg reference lines
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(y4national)).attr('y2', y(y4national))
      .attr('stroke', YEAR4_COLOUR).attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.4);

    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(y8national)).attr('y2', y(y8national))
      .attr('stroke', YEAR8_COLOUR).attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.4);

    // National avg labels (right edge)
    g.append('text')
      .attr('x', width + 4).attr('y', y(y4national))
      .attr('fill', YEAR4_COLOUR).attr('font-size', 9).attr('dominant-baseline', 'middle').attr('opacity', 0.7)
      .text('Y4 avg');

    g.append('text')
      .attr('x', width + 4).attr('y', y(y8national))
      .attr('fill', YEAR8_COLOUR).attr('font-size', 9).attr('dominant-baseline', 'middle').attr('opacity', 0.7)
      .text('Y8 avg');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xOuter))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', 11);

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', 11);

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .attr('font-size', 11)
      .text('Mean Scale Score (MS units)');

    // Bars
    for (const group of groups) {
      const gx = xOuter(group)!;
      const colour = GROUP_COLOURS[group] ?? DEFAULT_COLOUR;

      const y4row = y4rows.find((r) => r.group_value === group);
      const y8row = y8rows.find((r) => r.group_value === group);

      for (const [key, row, barColour] of [['Y4', y4row, YEAR4_COLOUR], ['Y8', y8row, YEAR8_COLOUR]] as [string, NmssaRow | undefined, string][]) {
        if (!row?.mean_score) continue;
        const bx = gx + xInner(key)!;
        const bw = xInner.bandwidth();
        const by = y(row.mean_score);
        const bh = height - by;

        // Bar fill with group colour tint
        g.append('rect')
          .attr('x', bx)
          .attr('y', by)
          .attr('width', bw)
          .attr('height', bh)
          .attr('fill', barColour)
          .attr('opacity', key === 'Y4' ? 0.55 : 0.85)
          .attr('rx', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', (event: MouseEvent) => {
            const rect = svgRef.current!.getBoundingClientRect();
            const national = key === 'Y4' ? y4national : y8national;
            const gap = row.mean_score! - national;
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top - 10,
              text: [
                `${group} — ${key}`,
                `Score: ${row.mean_score}`,
                `Gap from avg: ${gap > 0 ? '+' : ''}${gap.toFixed(1)}`,
                row.n ? `n = ${row.n.toLocaleString()}` : '',
              ].filter(Boolean),
              visible: true,
            });
          })
          .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));

        // CI error bar
        if (row.ci_lower != null && row.ci_upper != null) {
          const midX = bx + bw / 2;
          g.append('line')
            .attr('x1', midX).attr('x2', midX)
            .attr('y1', y(row.ci_upper)).attr('y2', y(row.ci_lower))
            .attr('stroke', colour).attr('stroke-width', 1.5).attr('opacity', 0.6);
          g.append('line').attr('x1', midX - 3).attr('x2', midX + 3).attr('y1', y(row.ci_upper)).attr('y2', y(row.ci_upper)).attr('stroke', colour).attr('stroke-width', 1).attr('opacity', 0.6);
          g.append('line').attr('x1', midX - 3).attr('x2', midX + 3).attr('y1', y(row.ci_lower)).attr('y2', y(row.ci_lower)).attr('stroke', colour).attr('stroke-width', 1).attr('opacity', 0.6);
        }
      }
    }

    // Legend
    const legendG = svg.append('g').attr('transform', `translate(${margin.left},${300 - 16})`);
    legendG.append('rect').attr('width', 12).attr('height', 12).attr('fill', YEAR4_COLOUR).attr('opacity', 0.55).attr('rx', 2);
    legendG.append('text').attr('x', 16).attr('y', 9).attr('fill', '#94a3b8').attr('font-size', 11).text('Year 4 (2022)');
    legendG.append('rect').attr('x', 100).attr('width', 12).attr('height', 12).attr('fill', YEAR8_COLOUR).attr('opacity', 0.85).attr('rx', 2);
    legendG.append('text').attr('x', 116).attr('y', 9).attr('fill', '#94a3b8').attr('font-size', 11).text('Year 8 (2022)');
  }, [rows, dimension]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [draw]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-80" />;
  if (error)   return <div className="text-red-400 text-sm p-4">{error}</div>;

  return (
    <div className="bg-slate-900 rounded-xl p-4 space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-mono">Group by:</span>
        {DIMENSION_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setDimension(key)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              dimension === key
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={wrapRef} className="relative">
        <svg ref={svgRef} className="w-full" />
        {tooltip.visible && (
          <div
            className="absolute pointer-events-none bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs shadow-lg z-10"
            style={{ left: tooltip.x + 8, top: tooltip.y }}
          >
            {tooltip.text.map((t, i) => (
              <div key={i} className={i === 0 ? 'font-bold text-slate-200' : 'text-slate-400'}>{t}</div>
            ))}
          </div>
        )}
      </div>

      {/* Key callout */}
      <div className="text-xs text-slate-500 font-mono space-y-0.5">
        <p>Dashed lines = national average · Error bars = 95% CI · NMSSA 2022</p>
        {dimension === 'decile' && (
          <p className="text-amber-500">
            Decile gap at Year 8: 21 MS units = ~2.5 years of learning between high and low decile schools
          </p>
        )}
      </div>
    </div>
  );
}
