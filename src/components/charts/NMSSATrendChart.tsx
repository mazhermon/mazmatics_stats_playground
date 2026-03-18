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

type YearLevel = 4 | 8;
type GroupView = 'national' | 'ethnicity' | 'gender' | 'decile';

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

const GROUP_COLOURS: Record<string, string> = {
  // national
  'National':    '#e2e8f0',
  // ethnicity
  'Māori':       '#f59e0b',
  'Pacific':     '#ef4444',
  'Asian':       '#10b981',
  'NZ European': '#60a5fa',
  // gender
  'Girls':       '#f472b6',
  'Boys':        '#60a5fa',
  // decile
  'Low':         '#ef4444',
  'Mid':         '#f59e0b',
  'High':        '#10b981',
};

const YEARS = [2013, 2018, 2022] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NMSSATrendChart() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rows, setRows]         = useState<NmssaRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [yearLevel, setYearLevel] = useState<YearLevel>(8);
  const [groupView, setGroupView] = useState<GroupView>('national');
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; lines: string[]; visible: boolean;
  }>({ x: 0, y: 0, lines: [], visible: false });

  useEffect(() => {
    fetch('/api/primary/nmssa')
      .then((r) => r.json())
      .then((d: { data: NmssaRow[] }) => { setRows(d.data); setLoading(false); })
      .catch(() => { setError('Failed to load NMSSA data'); setLoading(false); });
  }, []);

  const draw = useCallback(() => {
    if (!svgRef.current || !wrapRef.current || rows.length === 0) return;

    // Filter to selected year level
    const filtered = rows.filter((r) => r.year_level === yearLevel);

    // Determine groups to show
    type SeriesEntry = { key: string; label: string; colour: string; rows: NmssaRow[] };
    let series: SeriesEntry[] = [];

    if (groupView === 'national') {
      const natRows = filtered.filter((r) => r.group_type === 'national');
      series = [{ key: 'National', label: 'National average', colour: GROUP_COLOURS['National']!, rows: natRows }];
    } else {
      const dimRows = filtered.filter((r) => r.group_type === groupView);
      const groups = [...new Set(dimRows.map((r) => r.group_value).filter(Boolean))] as string[];
      series = groups.map((g) => ({
        key: g,
        label: g,
        colour: GROUP_COLOURS[g] ?? '#8b5cf6',
        rows: dimRows.filter((r) => r.group_value === g),
      }));
    }

    // Chart dimensions
    const containerW = wrapRef.current.clientWidth;
    const CHART_H = 320;
    const margin = { top: 28, right: 80, bottom: 44, left: 56 };
    const width  = containerW - margin.left - margin.right;
    const height = CHART_H - margin.top - margin.bottom;

    // Scales
    const allScores = series.flatMap((s) => s.rows.flatMap((r) => [r.ci_lower, r.ci_upper, r.mean_score])).filter((v): v is number => v != null);
    const yMin = Math.max(60, (d3.min(allScores) ?? 70) - 5);
    const yMax = (d3.max(allScores) ?? 135) + 6;

    const xScale = d3.scaleLinear()
      .domain([2013, 2022])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // SVG setup
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${containerW} ${CHART_H}`)
      .attr('width', containerW)
      .attr('height', CHART_H);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => '').ticks(5))
      .call((ax) => {
        ax.selectAll('line').attr('stroke', '#1e293b').attr('stroke-dasharray', '2,4');
        ax.select('.domain').remove();
      });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues([2013, 2018, 2022])
          .tickFormat((d) => String(d))
      )
      .call((ax) => {
        ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 12);
        ax.select('.domain').attr('stroke', '#334155');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((ax) => {
        ax.selectAll('text').attr('fill', '#64748b').attr('font-size', 11);
        ax.select('.domain').remove();
        ax.selectAll('.tick line').remove();
      });

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .attr('font-size', 11)
      .text('Mean Scale Score (MS units)');

    // Draw each series
    for (const s of series) {
      const colour = s.colour;
      const pts = s.rows
        .filter((r) => r.mean_score != null)
        .sort((a, b) => a.year - b.year);

      if (pts.length < 2) continue;

      // Line
      const line = d3.line<NmssaRow>()
        .x((r) => xScale(r.year))
        .y((r) => yScale(r.mean_score!));

      g.append('path')
        .datum(pts)
        .attr('fill', 'none')
        .attr('stroke', colour)
        .attr('stroke-width', groupView === 'national' ? 2.5 : 1.8)
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 0.85)
        .attr('d', line);

      // CI bands + dots
      for (const r of pts) {
        const cx = xScale(r.year);
        const cy = yScale(r.mean_score!);

        // CI error bar
        if (r.ci_lower != null && r.ci_upper != null) {
          const cyLo = yScale(r.ci_lower);
          const cyHi = yScale(r.ci_upper);
          const capW = 4;

          g.append('line')
            .attr('x1', cx).attr('x2', cx)
            .attr('y1', cyLo).attr('y2', cyHi)
            .attr('stroke', colour).attr('stroke-width', 1.5).attr('opacity', 0.5);
          g.append('line')
            .attr('x1', cx - capW).attr('x2', cx + capW)
            .attr('y1', cyLo).attr('y2', cyLo)
            .attr('stroke', colour).attr('stroke-width', 1).attr('opacity', 0.5);
          g.append('line')
            .attr('x1', cx - capW).attr('x2', cx + capW)
            .attr('y1', cyHi).attr('y2', cyHi)
            .attr('stroke', colour).attr('stroke-width', 1).attr('opacity', 0.5);
        }

        // Dot
        g.append('circle')
          .attr('cx', cx).attr('cy', cy)
          .attr('r', groupView === 'national' ? 5 : 4)
          .attr('fill', colour)
          .attr('stroke', '#020617')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .on('mouseenter', (event: MouseEvent) => {
            const rect = svgRef.current!.getBoundingClientRect();
            const lines = [
              `${s.label} · ${r.year}`,
              `Score: ${r.mean_score?.toFixed(1)} MS`,
              r.ci_lower != null && r.ci_upper != null
                ? `95% CI: (${r.ci_lower?.toFixed(1)}, ${r.ci_upper?.toFixed(1)})`
                : '',
              r.n ? `n = ${r.n.toLocaleString()}` : '(n not available)',
              r.year === 2013 ? '* 2013: reconstructed on 2018 MS scale' : '',
            ].filter(Boolean);
            setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top - 10, lines, visible: true });
          })
          .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));
      }

      // End label (right of last point)
      const last = pts[pts.length - 1];
      if (last?.mean_score != null) {
        g.append('text')
          .attr('x', xScale(last.year) + 8)
          .attr('y', yScale(last.mean_score))
          .attr('dominant-baseline', 'middle')
          .attr('fill', colour)
          .attr('font-size', 10)
          .attr('opacity', 0.9)
          .text(s.label === 'National average' ? 'National' : s.label);
      }
    }

    // Decline annotation for Y8 national (2018→2022)
    if (groupView === 'national' && yearLevel === 8) {
      const nat2018 = rows.find((r) => r.year === 2018 && r.year_level === 8 && r.group_type === 'national');
      const nat2022 = rows.find((r) => r.year === 2022 && r.year_level === 8 && r.group_type === 'national');
      if (nat2018?.mean_score && nat2022?.mean_score && nat2022.mean_score < nat2018.mean_score) {
        const midX = (xScale(2018) + xScale(2022)) / 2;
        const midY = (yScale(nat2018.mean_score) + yScale(nat2022.mean_score)) / 2 - 14;
        g.append('text')
          .attr('x', midX).attr('y', midY)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ef4444')
          .attr('font-size', 10)
          .attr('opacity', 0.8)
          .text(`▼ ${(nat2022.mean_score - nat2018.mean_score).toFixed(1)} MS (2018→2022)`);
      }
    }

  }, [rows, yearLevel, groupView]);

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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Year level */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Year level:</span>
          {([4, 8] as YearLevel[]).map((yl) => (
            <button
              key={yl}
              onClick={() => setYearLevel(yl)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                yearLevel === yl
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Year {yl}
            </button>
          ))}
        </div>

        {/* Group */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Group:</span>
          {([
            { key: 'national',  label: 'National' },
            { key: 'ethnicity', label: 'By ethnicity' },
            { key: 'gender',    label: 'By gender' },
            { key: 'decile',    label: 'By decile' },
          ] as { key: GroupView; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGroupView(key)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                groupView === key
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={wrapRef} className="relative">
        <svg ref={svgRef} className="w-full" />
        {tooltip.visible && (
          <div
            className="absolute pointer-events-none bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs shadow-lg z-10"
            style={{ left: tooltip.x + 8, top: tooltip.y, maxWidth: 220 }}
          >
            {tooltip.lines.map((line, i) => (
              <div
                key={i}
                className={i === 0 ? 'font-bold text-slate-200' : 'text-slate-400'}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="text-xs text-slate-500 font-mono space-y-0.5">
        <p>Dots = mean MS score · Bars = 95% confidence interval · Three NMSSA cycles: 2013, 2018, 2022</p>
        <p>
          2013 values are reconstructed on the 2018 MS scale (linked via common items, per NMSSA Report 19).
          CIs for 2013 are approximated from 2018 standard errors.
        </p>
      </div>
    </div>
  );
}
