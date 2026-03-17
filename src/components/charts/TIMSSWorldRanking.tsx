'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimssIntlRow {
  id: number;
  country: string;
  mean_score: number;
  se: number | null;
  is_nz: number;
}

const NZ_COLOUR   = '#BA90FF';
const BAR_COLOUR  = '#1e40af'; // default bar
const ABOVE_INTL  = '#334155'; // above intl avg — slate
const BELOW_INTL  = '#1e293b'; // below intl avg — darker
const INTL_AVG    = 503;

// Countries to highlight with labels
const HIGHLIGHT = new Set(['New Zealand', 'Australia', 'England', 'USA', 'Singapore', 'Japan']);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TIMSSWorldRanking() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<TimssIntlRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string[]; visible: boolean }>({
    x: 0, y: 0, text: [], visible: false,
  });

  useEffect(() => {
    fetch('/api/primary/timss?type=intl')
      .then((r) => r.json())
      .then((d: { data: TimssIntlRow[] }) => { setRows(d.data); setLoading(false); })
      .catch(() => { setError('Failed to load TIMSS data'); setLoading(false); });
  }, []);

  const draw = useCallback(() => {
    if (!svgRef.current || !wrapRef.current || rows.length === 0) return;

    const sorted = [...rows].sort((a, b) => b.mean_score - a.mean_score);
    const containerW = wrapRef.current.clientWidth;
    const barH   = 26;
    const gap    = 3;
    const labelW = 130;
    const margin = { top: 16, right: 60, bottom: 32, left: labelW };
    const height = sorted.length * (barH + gap);
    const totalH = height + margin.top + margin.bottom;
    const width  = containerW - margin.left - margin.right;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${containerW} ${totalH}`)
      .attr('width', containerW)
      .attr('height', totalH);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xMin = 450;
    const xMax = (d3.max(sorted, (d) => d.mean_score) ?? 620) + 15;
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);
    const y = d3.scaleBand<number>()
      .domain(d3.range(sorted.length))
      .range([0, height])
      .padding(0.15);

    // Intl avg line
    g.append('line')
      .attr('x1', x(INTL_AVG))
      .attr('x2', x(INTL_AVG))
      .attr('y1', -8)
      .attr('y2', height + 8)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,3');

    g.append('text')
      .attr('x', x(INTL_AVG) + 3)
      .attr('y', -12)
      .attr('fill', '#64748b')
      .attr('font-size', 10)
      .text(`Intl avg ${INTL_AVG}`);

    // Bars
    g.selectAll('.bar')
      .data(sorted)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', x(xMin))
      .attr('y', (_, i) => y(i)!)
      .attr('width', (d) => Math.max(0, x(d.mean_score) - x(xMin)))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => {
        if (d.is_nz) return NZ_COLOUR;
        return d.mean_score >= INTL_AVG ? ABOVE_INTL : BELOW_INTL;
      })
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          text: [d.country, `Score: ${d.mean_score}`],
          visible: true,
        });
      })
      .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));

    // Score labels inside bars
    g.selectAll('.score-label')
      .data(sorted)
      .join('text')
      .attr('class', 'score-label')
      .attr('x', (d) => x(d.mean_score) - 4)
      .attr('y', (_, i) => y(i)! + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', (d) => (d.is_nz ? '#1a0b2e' : '#94a3b8'))
      .attr('font-size', 10)
      .attr('font-weight', (d) => (d.is_nz ? 'bold' : 'normal'))
      .text((d) => d.mean_score);

    // Country labels
    g.selectAll('.country-label')
      .data(sorted)
      .join('text')
      .attr('class', 'country-label')
      .attr('x', -6)
      .attr('y', (_, i) => y(i)! + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', (d) => {
        if (d.is_nz) return NZ_COLOUR;
        if (HIGHLIGHT.has(d.country)) return '#e2e8f0';
        return '#64748b';
      })
      .attr('font-size', (d) => (HIGHLIGHT.has(d.country) || d.is_nz ? 11 : 10))
      .attr('font-weight', (d) => (d.is_nz ? 'bold' : 'normal'))
      .text((d) => d.country);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', 11);
  }, [rows]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [draw]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[520px]" />;
  if (error)   return <div className="text-red-400 text-sm p-4">{error}</div>;

  return (
    <div className="bg-slate-900 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: NZ_COLOUR }} />
          New Zealand
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-700" />
          Above intl avg
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-800" />
          Below intl avg
        </span>
      </div>
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
        Selected countries · NZ ranked ~40th of 58 participating countries · Source: TIMSS 2023
      </p>
    </div>
  );
}
