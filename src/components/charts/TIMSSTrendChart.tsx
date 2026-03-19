'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GenderNote } from './GenderNote';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimssRow {
  id: number;
  year: number;
  group_type: string;
  group_value: string | null;
  mean_score: number;
  se: number | null;
  intl_avg: number | null;
}

type GenderMode = 'national' | 'gender';

const YEARS = [1995, 2003, 2007, 2011, 2015, 2019, 2023];
const NZ_COLOUR   = '#BA90FF'; // violet
const INTL_COLOUR = '#64748b'; // slate
const GIRLS_COLOUR = '#FFF73E'; // Mazmatics yellow
const BOYS_COLOUR  = '#BA90FF'; // brand purple
const AU_COLOUR    = '#10b981'; // emerald — comparison reference (approx, not in DB)
const ENG_COLOUR   = '#f59e0b'; // amber

// Approximate AU/ENG comparison for overlay context
// Source: TIMSS 2023 published results
const AU_SCORES: Record<number, number> = { 2003: 499, 2007: 516, 2011: 516, 2015: 517, 2019: 516, 2023: 525 };
const ENG_SCORES: Record<number, number> = { 2007: 541, 2011: 542, 2015: 546, 2019: 556, 2023: 552 };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TIMSSTrendChart() {
  const svgRef    = useRef<SVGSVGElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<GenderMode>('national');
  const [rows, setRows] = useState<TimssRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string[]; visible: boolean }>({
    x: 0, y: 0, text: [], visible: false,
  });

  useEffect(() => {
    fetch('/api/primary/timss?type=trend')
      .then((r) => r.json())
      .then((d: { data: TimssRow[] }) => { setRows(d.data); setLoading(false); })
      .catch(() => { setError('Failed to load TIMSS data'); setLoading(false); });
  }, []);

  const draw = useCallback(() => {
    if (!svgRef.current || !wrapRef.current || rows.length === 0) return;

    const containerW = wrapRef.current.clientWidth;
    const margin = { top: 24, right: 60, bottom: 48, left: 52 };
    const width  = containerW - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${containerW} ${300}`)
      .attr('width', containerW)
      .attr('height', 300);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // ─── Data prep ───────────────────────────────────────────────────────────
    const national = rows.filter((r) => r.group_type === 'national');
    const girls    = rows.filter((r) => r.group_value === 'Girls');
    const boys     = rows.filter((r) => r.group_value === 'Boys');

    const activeYears = mode === 'national' ? YEARS : YEARS;

    // Compute y domain
    const allScores = [...national.map((r) => r.mean_score)];
    if (mode === 'gender') {
      allScores.push(...girls.map((r) => r.mean_score), ...boys.map((r) => r.mean_score));
    }
    allScores.push(...national.map((r) => r.intl_avg ?? 0));
    allScores.push(...Object.values(AU_SCORES), ...Object.values(ENG_SCORES));

    const yMin = Math.max(400, (d3.min(allScores) ?? 400) - 20);
    const yMax = (d3.max(allScores) ?? 620) + 20;

    // ─── Scales ──────────────────────────────────────────────────────────────
    const x = d3.scalePoint<number>().domain(activeYears).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    // ─── Grid ────────────────────────────────────────────────────────────────
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
          .ticks(5)
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,4');
    g.select('.grid .domain').remove();

    // ─── Axes ─────────────────────────────────────────────────────────────────
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(activeYears).tickFormat(String))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', 12);
    g.select('.domain').attr('stroke', '#334155');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', 12);

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .attr('font-size', 11)
      .text('TIMSS Scale Score');

    // ─── Intl avg dashed line ─────────────────────────────────────────────────
    const intlPoints = national.filter((r) => r.intl_avg != null).map((r) => ({ year: r.year, score: r.intl_avg! }));
    const intlLine = d3.line<{ year: number; score: number }>()
      .x((d) => x(d.year)!)
      .y((d) => y(d.score))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(intlPoints)
      .attr('fill', 'none')
      .attr('stroke', INTL_COLOUR)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.6)
      .attr('d', intlLine);

    // Intl label
    const lastIntl = intlPoints[intlPoints.length - 1];
    if (lastIntl) {
      g.append('text')
        .attr('x', x(lastIntl.year)! + 6)
        .attr('y', y(lastIntl.score))
        .attr('fill', INTL_COLOUR)
        .attr('font-size', 10)
        .attr('dominant-baseline', 'middle')
        .text('Intl avg');
    }

    // ─── Australia + England ghost lines ─────────────────────────────────────
    const auPoints = Object.entries(AU_SCORES).map(([yr, sc]) => ({ year: Number(yr), score: sc }));
    const engPoints = Object.entries(ENG_SCORES).map(([yr, sc]) => ({ year: Number(yr), score: sc }));

    const ghostLine = d3.line<{ year: number; score: number }>()
      .x((d) => x(d.year)!)
      .y((d) => y(d.score))
      .defined((d) => x(d.year) !== undefined)
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(auPoints)
      .attr('fill', 'none')
      .attr('stroke', AU_COLOUR)
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.45)
      .attr('d', ghostLine);

    const lastAu = auPoints[auPoints.length - 1];
    if (lastAu) {
      g.append('text')
        .attr('x', x(lastAu.year)! + 6)
        .attr('y', y(lastAu.score))
        .attr('fill', AU_COLOUR)
        .attr('font-size', 10)
        .attr('dominant-baseline', 'middle')
        .attr('opacity', 0.8)
        .text('AUS');
    }

    g.append('path')
      .datum(engPoints)
      .attr('fill', 'none')
      .attr('stroke', ENG_COLOUR)
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.45)
      .attr('d', ghostLine);

    const lastEng = engPoints[engPoints.length - 1];
    if (lastEng) {
      g.append('text')
        .attr('x', x(lastEng.year)! + 6)
        .attr('y', y(lastEng.score))
        .attr('fill', ENG_COLOUR)
        .attr('font-size', 10)
        .attr('dominant-baseline', 'middle')
        .attr('opacity', 0.8)
        .text('ENG');
    }

    // ─── Main NZ line ─────────────────────────────────────────────────────────
    const mainLine = d3.line<TimssRow>()
      .x((d) => x(d.year)!)
      .y((d) => y(d.mean_score))
      .curve(d3.curveMonotoneX);

    if (mode === 'national') {
      g.append('path')
        .datum(national)
        .attr('fill', 'none')
        .attr('stroke', NZ_COLOUR)
        .attr('stroke-width', 2.5)
        .attr('d', mainLine);

      // Dots
      g.selectAll('.dot-nz')
        .data(national)
        .join('circle')
        .attr('class', 'dot-nz')
        .attr('cx', (d) => x(d.year)!)
        .attr('cy', (d) => y(d.mean_score))
        .attr('r', 5)
        .attr('fill', NZ_COLOUR)
        .attr('stroke', '#020617')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent, d) => {
          const rect = svgRef.current!.getBoundingClientRect();
          const intlText = d.intl_avg ? `Intl avg: ${d.intl_avg}` : '';
          setTooltip({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top - 10,
            text: [`${d.year}`, `NZ: ${d.mean_score}`, intlText].filter(Boolean),
            visible: true,
          });
        })
        .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));

    } else {
      // Gender lines
      const girlsLine = d3.line<TimssRow>()
        .x((d) => x(d.year)!)
        .y((d) => y(d.mean_score))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(girls).attr('fill', 'none').attr('stroke', GIRLS_COLOUR).attr('stroke-width', 2.5).attr('d', girlsLine);
      g.append('path').datum(boys).attr('fill', 'none').attr('stroke', BOYS_COLOUR).attr('stroke-width', 2.5).attr('d', girlsLine);

      // NZ national as ghost for context
      g.append('path').datum(national).attr('fill', 'none').attr('stroke', NZ_COLOUR).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3').attr('opacity', 0.4).attr('d', mainLine);

      // Gender dots — use safe label-based class names (hex colours are invalid CSS selectors)
      for (const [data, colour, label] of [
        [girls, GIRLS_COLOUR, 'girls'],
        [boys,  BOYS_COLOUR,  'boys'],
      ] as [TimssRow[], string, string][]) {
        g.selectAll(`.dot-${label}`)
          .data(data)
          .join('circle')
          .attr('cx', (d) => x(d.year)!)
          .attr('cy', (d) => y(d.mean_score))
          .attr('r', 5)
          .attr('fill', colour)
          .attr('stroke', '#020617')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .on('mouseenter', (event: MouseEvent, d) => {
            const rect = svgRef.current!.getBoundingClientRect();
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top - 10,
              text: [`${d.year}`, `${d.group_value}: ${d.mean_score}`],
              visible: true,
            });
          })
          .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));
      }

      // Gender labels at 2023
      const g2023 = girls.find((r) => r.year === 2023);
      const b2023 = boys.find((r) => r.year === 2023);
      if (g2023) g.append('text').attr('x', x(2023)! + 6).attr('y', y(g2023.mean_score)).attr('fill', GIRLS_COLOUR).attr('font-size', 10).attr('dominant-baseline', 'middle').text('Girls');
      if (b2023) g.append('text').attr('x', x(2023)! + 6).attr('y', y(b2023.mean_score)).attr('fill', BOYS_COLOUR).attr('font-size', 10).attr('dominant-baseline', 'middle').text('Boys');
    }

    // ─── NZ label at last point ───────────────────────────────────────────────
    const lastNz = national[national.length - 1];
    if (lastNz && mode === 'national') {
      g.append('text')
        .attr('x', x(lastNz.year)! + 6)
        .attr('y', y(lastNz.mean_score))
        .attr('fill', NZ_COLOUR)
        .attr('font-size', 10)
        .attr('dominant-baseline', 'middle')
        .text('NZ');
    }
  }, [rows, mode]);

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
        <span className="text-xs text-slate-500 font-mono">Show:</span>
        {(['national', 'gender'] as GenderMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              mode === m
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {m === 'national' ? 'National' : 'By gender'}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-0.5 bg-slate-500" style={{ borderTop: '2px dashed' }} />
            <span>Intl avg</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-0.5" style={{ backgroundColor: '#10b981', opacity: 0.6 }} />
            <span>AUS</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-0.5" style={{ backgroundColor: '#f59e0b', opacity: 0.6 }} />
            <span>ENG</span>
          </span>
        </span>
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

      {/* Gender note */}
      {mode === 'gender' && <GenderNote />}
    </div>
  );
}
