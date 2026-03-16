'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS, EQUITY_COLOURS, GENDER_COLOURS, fmtRate } from '@/lib/palette';
import { resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DeltaGroupBy = 'national' | 'ethnicity' | 'equity_index_group' | 'gender';

const GROUP_OPTIONS: { key: DeltaGroupBy; label: string }[] = [
  { key: 'national',           label: 'National' },
  { key: 'ethnicity',          label: 'By ethnicity' },
  { key: 'equity_index_group', label: 'By equity' },
  { key: 'gender',             label: 'By gender' },
];

const DELTA_ANNOTATIONS: { year: number; label: string; offset: number }[] = [
  { year: 2020, label: '↑ COVID leniency', offset: -4 },
  { year: 2024, label: '↑ NCEA reform',    offset: -4 },
];

interface DeltaPoint {
  group: string;
  year: number;
  delta: number; // positive = improved (lower fail rate), negative = regressed
}

interface TooltipState {
  x: number; y: number;
  group: string; year: number; delta: number;
  visible: boolean;
}

function colourForGroup(groupBy: DeltaGroupBy, group: string): string {
  if (groupBy === 'ethnicity') return ETHNICITY_COLOURS[group] ?? '#8D99AE';
  if (groupBy === 'equity_index_group') return EQUITY_COLOURS[group] ?? '#8D99AE';
  if (groupBy === 'gender') return GENDER_COLOURS[group] ?? '#8D99AE';
  return '#BA90FF';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeltaChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState(1);
  const [groupBy, setGroupBy] = useState<DeltaGroupBy>('national');
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, group: '', year: 0, delta: 0, visible: false });

  const { data, loading, error } = useNzqaData<TimelineResponse>(
    `/api/nzqa/timeline?metric=not_achieved_rate&groupBy=${groupBy === 'national' ? 'national' : groupBy}&level=${level}`
  );

  // Compute year-on-year deltas for each group
  const deltaPoints = useMemo<DeltaPoint[]>(() => {
    if (!data) return [];

    if (groupBy === 'national') {
      const pts = (data.data as Array<{ year: number; level: number; value: number }>)
        .filter((d) => d.level === level)
        .sort((a, b) => a.year - b.year);
      const result: DeltaPoint[] = [];
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]!;
        const curr = pts[i]!;
        // For fail rate: negative delta = fail rate went UP = bad
        // We want "improved" = positive bar = fail rate went DOWN
        result.push({ group: 'National', year: curr.year, delta: -(curr.value - prev.value) });
      }
      return result;
    }

    const pts = data.data as TimelineGroupPoint[];
    const grouped = d3.group(pts, (d) => d.group_label);
    const result: DeltaPoint[] = [];

    grouped.forEach((groupPts, groupLabel) => {
      const sorted = groupPts.sort((a, b) => a.year - b.year);
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]!;
        const curr = sorted[i]!;
        result.push({ group: groupLabel, year: curr.year, delta: -(curr.value - prev.value) });
      }
    });

    return result;
  }, [data, groupBy, level]);

  const groups = useMemo(() => Array.from(new Set(deltaPoints.map((d) => d.group))), [deltaPoints]);
  const years  = useMemo(() => Array.from(new Set(deltaPoints.map((d) => d.year))).sort(), [deltaPoints]);

  useEffect(() => {
    if (!deltaPoints.length || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth || 800;
    const H = 300;
    const margin = { top: 30, right: 24, bottom: 40, left: 60 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    let g = svg.select<SVGGElement>('g.delta-body');
    if (g.empty()) g = svg.append('g').attr('class', 'delta-body');
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    const xYear = d3.scaleBand().domain(years.map(String)).range([0, innerW]).paddingInner(0.15);
    const xGroup = d3.scaleBand().domain(groups).range([0, xYear.bandwidth()]).padding(0.05);

    const maxAbsDelta = Math.max(d3.max(deltaPoints, (d) => Math.abs(d.delta)) ?? 0.1, 0.05);
    const yScale = d3.scaleLinear().domain([-maxAbsDelta, maxAbsDelta]).range([innerH, 0]).nice();

    // Zero line
    g.selectAll('.zero-line').data([0]).join('line').attr('class', 'zero-line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yScale(0)).attr('y2', yScale(0))
      .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1);

    // Grid
    g.selectAll('.grid-h').data(yScale.ticks(4)).join('line').attr('class', 'grid-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '3,3');

    // Axes
    g.selectAll<SVGGElement, unknown>('.x-axis').data([null]).join('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xYear).tickSizeOuter(0))
      .call((ax) => {
        ax.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '10px');
        ax.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    g.selectAll<SVGGElement, unknown>('.y-axis').data([null]).join('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d3.format('+.0%')(d as number)}`))
      .call((ax) => {
        ax.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '11px');
        ax.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    // Annotation lines
    DELTA_ANNOTATIONS.forEach(({ year, label, offset }) => {
      const xPos = (xYear(String(year)) ?? 0) + xYear.bandwidth() / 2;
      g.selectAll<SVGLineElement, unknown>(`.ann-line-${year}`).data([null]).join('line')
        .attr('class', `ann-line-${year}`)
        .attr('x1', xPos).attr('x2', xPos).attr('y1', 0).attr('y2', innerH)
        .attr('stroke', '#334155').attr('stroke-width', 1).attr('stroke-dasharray', '4,3');
      g.selectAll<SVGTextElement, unknown>(`.ann-label-${year}`).data([null]).join('text')
        .attr('class', `ann-label-${year}`)
        .attr('x', xPos + 3).attr('y', offset + 8)
        .attr('fill', '#64748b').style('font-size', '9px')
        .style('font-family', 'var(--font-geist-mono, monospace)')
        .text(label);
    });

    // Bars
    const barData = deltaPoints;
    g.selectAll<SVGRectElement, DeltaPoint>('.delta-bar')
      .data(barData, (d) => `${d.group}-${d.year}`)
      .join('rect').attr('class', 'delta-bar')
      .attr('x', (d) => (xYear(String(d.year)) ?? 0) + (xGroup(d.group) ?? 0))
      .attr('width', xGroup.bandwidth())
      .attr('y', (d) => d.delta >= 0 ? yScale(d.delta) : yScale(0))
      .attr('height', (d) => Math.abs(yScale(d.delta) - yScale(0)))
      .attr('fill', (d) => {
        if (groupBy !== 'national') return colourForGroup(groupBy, d.group);
        return d.delta >= 0 ? '#10b981' : '#ef4444';
      })
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d) {
        d3.select(this).attr('opacity', 1);
        const rect = container.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, group: d.group, year: d.year, delta: d.delta, visible: true });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.85);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Y axis label
    svg.selectAll('.y-label').data([null]).join('text').attr('class', 'y-label')
      .attr('transform', `translate(14, ${H / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .style('font-size', '10px').style('font-family', 'var(--font-geist-mono, monospace)')
      .text('Change in fail rate (pp)');

  }, [deltaPoints, groups, years, groupBy]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-mono">View:</span>
          {GROUP_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => { resumeAudio(); setGroupBy(opt.key); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer
                ${groupBy === opt.key ? 'bg-violet-500 text-white' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-mono">Level:</span>
          {[1, 2, 3].map((lvl) => (
            <button key={lvl} onClick={() => { resumeAudio(); setLevel(lvl); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${level === lvl ? 'bg-violet-400 text-slate-950' : 'text-slate-500 border border-slate-700 hover:border-slate-500'}`}>
              L{lvl}
            </button>
          ))}
        </div>
      </div>

      {groupBy === 'equity_index_group' && (
        <p className="text-xs text-slate-500 font-mono">Equity group data available 2019–2024 only.</p>
      )}

      <div className="text-xs text-slate-500 font-mono">
        <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500 mr-1" />Positive = fail rate improved (fell) vs previous year
        <span className="inline-block w-2 h-2 rounded-sm bg-red-500 mr-1 ml-3" />Negative = fail rate worsened (rose) vs previous year
      </div>

      {/* Chart */}
      <div ref={containerRef} className="relative w-full">
        {loading && <div className="animate-pulse bg-slate-800 rounded-lg h-[300px] w-full" />}
        {error && <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">{strings.error}</div>}
        {!loading && !error && <svg ref={svgRef} className="w-full" style={{ height: 300 }} />}

        {tooltip.visible && (
          <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 50 }}>
            <span className="text-slate-400">{tooltip.group} · {tooltip.year}</span>
            <br />
            <span className={`font-semibold ${tooltip.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {tooltip.delta >= 0 ? '↓' : '↑'} {fmtRate(Math.abs(tooltip.delta))} fail rate vs {tooltip.year - 1}
            </span>
          </div>
        )}
      </div>

      {/* Legend for grouped modes */}
      {groupBy !== 'national' && groups.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {groups.map((g) => (
            <div key={g} className="flex items-center gap-1.5 text-xs font-mono">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: colourForGroup(groupBy, g) }} />
              <span className="text-slate-400">{g}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 font-mono">{strings.dataNote}</p>
    </div>
  );
}
