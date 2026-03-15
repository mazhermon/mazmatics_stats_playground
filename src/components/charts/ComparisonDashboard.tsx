'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS, EQUITY_COLOURS, GENDER_COLOURS, fmtRate } from '@/lib/palette';
import { playHoverTone, resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

type GroupBy = 'ethnicity' | 'equity_index_group' | 'gender' | 'region';

interface GroupByConfig {
  key: GroupBy;
  label: string;
  param: string;
}

const GROUP_BY_OPTIONS: GroupByConfig[] = [
  { key: 'ethnicity', label: 'Ethnicity', param: 'ethnicity' },
  { key: 'equity_index_group', label: 'Equity group', param: 'equity_index_group' },
  { key: 'gender', label: 'Gender', param: 'gender' },
  { key: 'region', label: 'Region', param: 'region' },
];

// Colour scale for heatmap cells: purple palette
const HEATMAP_SCALE = d3.scaleLinear<string>()
  .domain([0, 0.4, 0.7, 1])
  .range(['#1a1a2e', '#533483', '#BA90FF', '#e9d5ff'])
  .clamp(true);

function getColour(groupBy: GroupBy, label: string): string {
  if (groupBy === 'ethnicity') return ETHNICITY_COLOURS[label] ?? ETHNICITY_COLOURS[label.split(' / ')[0] ?? ''] ?? '#8D99AE';
  if (groupBy === 'equity_index_group') return EQUITY_COLOURS[label] ?? '#8D99AE';
  if (groupBy === 'gender') return GENDER_COLOURS[label] ?? '#8D99AE';
  return '#8D99AE';
}

export function ComparisonDashboard() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('ethnicity');
  const [level, setLevel] = useState(1);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; xLabel: string; yLabel: string; rate: number | null; visible: boolean }>({
    x: 0, y: 0, xLabel: '', yLabel: '', rate: null, visible: false,
  });

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=${groupBy}&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  const { xLabels, yLabels, matrix } = useMemo(() => {
    if (!data) return { xLabels: [] as string[], yLabels: [] as string[], matrix: new Map<string, number | null>() };

    const points = data.data as TimelineGroupPoint[];
    const years = Array.from(new Set(points.map((d) => String(d.year)))).sort();
    const groups = Array.from(new Set(points.map((d) => d.group_label))).sort();

    const mat = new Map<string, number | null>();
    points.forEach((d) => {
      mat.set(`${d.group_label}__${d.year}`, d.value);
    });

    return { xLabels: years, yLabels: groups, matrix: mat };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || xLabels.length === 0 || yLabels.length === 0) return;

    const container = containerRef.current;
    const W = container.clientWidth || 700;
    const cellPad = 2;
    const marginLeft = 180;
    const marginTop = 60;
    const marginRight = 20;
    const marginBottom = 20;

    const cellW = Math.max(24, Math.floor((W - marginLeft - marginRight) / xLabels.length));
    const cellH = Math.max(28, cellW);
    const H = marginTop + yLabels.length * (cellH + cellPad) + marginBottom;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    let g = svg.select<SVGGElement>('g.heatmap-body');
    if (g.empty()) g = svg.append('g').attr('class', 'heatmap-body');
    g.attr('transform', `translate(${marginLeft},${marginTop})`);

    const xScale = d3.scaleBand()
      .domain(xLabels)
      .range([0, xLabels.length * (cellW + cellPad)])
      .padding(cellPad / (cellW + cellPad));

    const yScale = d3.scaleBand()
      .domain(yLabels)
      .range([0, yLabels.length * (cellH + cellPad)])
      .padding(cellPad / (cellH + cellPad));

    type CellDatum = { x: string; y: string; rate: number | null };
    const cells: CellDatum[] = [];
    xLabels.forEach((x) => yLabels.forEach((y) => {
      cells.push({ x, y, rate: matrix.get(`${y}__${x}`) ?? null });
    }));

    // Cells
    g.selectAll<SVGRectElement, CellDatum>('.cell')
      .data(cells, (d) => `${d.x}__${d.y}`)
      .join(
        (enter) => enter.append('rect')
          .attr('class', 'cell')
          .attr('rx', 3)
          .attr('x', (d) => xScale(d.x) ?? 0)
          .attr('y', (d) => yScale(d.y) ?? 0)
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('fill', '#1a1a2e')
          .attr('opacity', 0)
          .call((e) => e.transition().duration(600).delay((_, i) => i * 3).attr('opacity', 1)),
      )
      .attr('x', (d) => xScale(d.x) ?? 0)
      .attr('y', (d) => yScale(d.y) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('cursor', 'pointer')
      .transition()
      .duration(500)
      .attr('fill', (d) => d.rate !== null ? HEATMAP_SCALE(d.rate) : '#1e293b');

    // Rate labels inside cells (only if wide enough)
    if (cellW >= 32) {
      g.selectAll<SVGTextElement, CellDatum>('.cell-label')
        .data(cells, (d) => `${d.x}__${d.y}`)
        .join('text')
        .attr('class', 'cell-label')
        .attr('x', (d) => (xScale(d.x) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', (d) => (yScale(d.y) ?? 0) + yScale.bandwidth() / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('font-family', 'var(--font-geist-mono, monospace)')
        .style('pointer-events', 'none')
        .attr('fill', (d) => (d.rate ?? 0) > 0.6 ? '#0f172a' : '#cbd5e1')
        .text((d) => d.rate !== null ? `${(d.rate * 100).toFixed(0)}%` : '');
    }

    // Mouse events
    g.selectAll<SVGRectElement, CellDatum>('.cell')
      .on('mouseenter', function (event: MouseEvent, d) {
        d3.select(this).attr('stroke', '#BA90FF').attr('stroke-width', 2);
        if (d.rate !== null) { resumeAudio(); playHoverTone(d.rate, 0.07); }
        const rect = container.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, xLabel: d.x, yLabel: d.y, rate: d.rate, visible: true });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke', 'none');
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // X axis labels (years — rotated)
    g.selectAll<SVGTextElement, string>('.x-label')
      .data(xLabels)
      .join('text')
      .attr('class', 'x-label')
      .attr('x', (d) => (xScale(d) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', -8)
      .attr('text-anchor', 'start')
      .attr('transform', (d) => `rotate(-45, ${(xScale(d) ?? 0) + xScale.bandwidth() / 2}, -8)`)
      .style('font-size', '10px')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .attr('fill', '#64748b')
      .text((d) => d);

    // Y axis labels — with group colour dot
    g.selectAll<SVGTextElement, string>('.y-label')
      .data(yLabels)
      .join('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', (d) => (yScale(d) ?? 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .attr('fill', (d) => getColour(groupBy, d))
      .text((d) => {
        const clean = d.replace(' / Pākehā', '').replace(' Peoples', '').replace(' Region', '');
        return clean.length > 20 ? clean.slice(0, 20) + '…' : clean;
      });

  }, [xLabels, yLabels, matrix, groupBy]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Group by:</span>
          <select
            value={groupBy}
            onChange={(e) => { resumeAudio(); setGroupBy(e.target.value as GroupBy); }}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 cursor-pointer focus:outline-none focus:border-violet-500"
          >
            {GROUP_BY_OPTIONS.map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((lvl) => (
            <button key={lvl} onClick={() => { resumeAudio(); setLevel(lvl); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${level === lvl ? 'bg-violet-500 text-white' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
              L{lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div ref={containerRef} className="relative w-full overflow-x-auto">
        {loading && <div className="animate-pulse bg-slate-800 rounded-lg h-64 w-full" />}
        {error && <div className="flex items-center justify-center h-64 text-slate-500 text-sm">{strings.error}</div>}
        {!loading && !error && xLabels.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-600 text-sm">No data for this combination.</div>
        )}
        {!loading && !error && xLabels.length > 0 && (
          <svg ref={svgRef} className="w-full" />
        )}

        {tooltip.visible && (
          <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
            <span className="text-slate-400">{tooltip.yLabel} · {tooltip.xLabel}</span>
            <br />
            <span className="text-white font-semibold">
              {tooltip.rate !== null ? `${fmtRate(tooltip.rate)} achieved` : 'No data'}
            </span>
          </div>
        )}
      </div>

      {/* Colour legend */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600 font-mono">0%</span>
        <div className="h-2 rounded flex-1 max-w-48" style={{
          background: 'linear-gradient(to right, #1a1a2e, #533483, #BA90FF, #e9d5ff)',
        }} />
        <span className="text-xs text-slate-600 font-mono">100%</span>
      </div>

      <p className="text-xs text-slate-500 font-mono">{strings.dataNote}</p>
    </div>
  );
}
