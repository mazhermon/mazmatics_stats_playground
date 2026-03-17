'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CIRow {
  id: number;
  year: number;
  year_level: number;
  group_type: string;
  group_value: string | null;
  pct_meeting: number | null;
  pct_less_1yr: number | null;
  pct_more_1yr: number | null;
}

const COLOURS = {
  meeting:  '#10b981', // green — meeting expectations
  less_1yr: '#f59e0b', // amber — less than 1 year behind
  more_1yr: '#ef4444', // red   — more than 1 year behind
};

const YEAR_LABELS: Record<number, string> = { 3: 'Year 3', 6: 'Year 6', 8: 'Year 8' };
const YEAR_LEVELS = [3, 6, 8];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CurriculumInsightsPipeline() {
  const svgRef    = useRef<SVGSVGElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [rows, setRows]       = useState<CIRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [year, setYear]       = useState(2024);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string[]; visible: boolean }>({
    x: 0, y: 0, text: [], visible: false,
  });

  useEffect(() => {
    fetch('/api/primary/curriculum-insights')
      .then((r) => r.json())
      .then((d: { data: CIRow[] }) => { setRows(d.data); setLoading(false); })
      .catch(() => { setError('Failed to load Curriculum Insights data'); setLoading(false); });
  }, []);

  const draw = useCallback(() => {
    if (!svgRef.current || !wrapRef.current || rows.length === 0) return;

    const filtered = rows.filter((r) => r.year === year && r.group_type === 'national');

    const containerW = wrapRef.current.clientWidth;
    const margin = { top: 32, right: 16, bottom: 64, left: 52 };
    const height = 260 - margin.top - margin.bottom;
    const width  = containerW - margin.left - margin.right;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${containerW} ${260}`)
      .attr('width', containerW)
      .attr('height', 260);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Stacked data — each bar is a year level
    const stackedData = YEAR_LEVELS.map((yl) => {
      const row = filtered.find((r) => r.year_level === yl);
      return {
        yearLevel: yl,
        meeting:  row?.pct_meeting  ?? 0,
        less_1yr: row?.pct_less_1yr ?? 0,
        more_1yr: row?.pct_more_1yr ?? 0,
      };
    });

    // Scales
    const xScale = d3.scaleBand<number>()
      .domain(YEAR_LEVELS)
      .range([0, width])
      .padding(0.35);

    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat((v) => `${v}%`).ticks(5))
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,4');
    g.select('.domain').remove();
    g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', 11);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => YEAR_LABELS[d] ?? String(d)))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', 12);

    // Stacked bars
    const segments: [keyof typeof COLOURS, string][] = [
      ['more_1yr', '> 1 year behind'],
      ['less_1yr', '< 1 year behind'],
      ['meeting',  'Meeting expectations'],
    ];

    for (const d of stackedData) {
      const bx = xScale(d.yearLevel)!;
      const bw = xScale.bandwidth();
      let cumulative = 0;

      // Draw from bottom (more_1yr) upward
      for (const [key, label] of segments) {
        const pct = d[key as keyof typeof d] as number;
        const barH = yScale(0) - yScale(pct);
        const by   = yScale(cumulative + pct);

        g.append('rect')
          .attr('x', bx)
          .attr('y', by)
          .attr('width', bw)
          .attr('height', barH)
          .attr('fill', COLOURS[key as keyof typeof COLOURS])
          .attr('opacity', key === 'more_1yr' ? 0.85 : key === 'less_1yr' ? 0.7 : 0.9)
          .attr('rx', key === 'meeting' ? 3 : 0)
          .style('cursor', 'pointer')
          .on('mouseenter', (event: MouseEvent) => {
            const rect = svgRef.current!.getBoundingClientRect();
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top - 10,
              text: [`${YEAR_LABELS[d.yearLevel]} (${year})`, `${label}: ${pct}%`],
              visible: true,
            });
          })
          .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));

        // Percentage label inside segment (only if tall enough)
        if (barH > 16) {
          g.append('text')
            .attr('x', bx + bw / 2)
            .attr('y', by + barH / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', key === 'meeting' ? '#022c22' : '#fff')
            .attr('font-size', 11)
            .attr('font-weight', 'bold')
            .text(`${pct}%`);
        }

        cumulative += pct;
      }
    }

    // Legend
    const legendG = svg.append('g').attr('transform', `translate(${margin.left},${260 - 20})`);
    const legendItems: [string, string][] = [
      [COLOURS.meeting,  'Meeting expectations'],
      [COLOURS.less_1yr, '< 1 year behind'],
      [COLOURS.more_1yr, '> 1 year behind'],
    ];
    let lx = 0;
    for (const [colour, label] of legendItems) {
      legendG.append('rect').attr('x', lx).attr('width', 10).attr('height', 10).attr('fill', colour).attr('rx', 1).attr('y', 0);
      legendG.append('text').attr('x', lx + 13).attr('y', 9).attr('fill', '#94a3b8').attr('font-size', 10).text(label);
      lx += label.length * 6.2 + 18;
    }
  }, [rows, year]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [draw]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-72" />;
  if (error)   return <div className="text-red-400 text-sm p-4">{error}</div>;

  return (
    <div className="bg-slate-900 rounded-xl p-4 space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-mono">Year:</span>
        {[2023, 2024].map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              year === y
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {y}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600 font-mono">No significant change 2023→2024</span>
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

      <p className="text-xs text-slate-600 font-mono">
        Source: Curriculum Insights (successor to NMSSA) · % meeting NZ Curriculum provisional benchmarks · National sample ~6,000 students
      </p>
    </div>
  );
}
