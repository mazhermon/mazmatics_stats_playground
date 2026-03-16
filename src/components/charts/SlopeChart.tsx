'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS, fmtRate } from '@/lib/palette';

export function SlopeChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=${level}&yearFrom=2015&yearTo=2024`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const allPoints = data.data as TimelineGroupPoint[];

    // Only use 2015 and 2024 data points
    const startYear = 2015;
    const endYear = 2024;
    const startPts = allPoints.filter((d) => d.year === startYear && d.value !== null);
    const endPts = allPoints.filter((d) => d.year === endYear && d.value !== null);

    // Build per-ethnicity start/end pairs
    const groups = [...new Set(allPoints.map((d) => d.group_label))].filter(Boolean);
    type SlopeEntry = { group: string; start: number | null; end: number | null };
    const slopeData: SlopeEntry[] = groups.map((g) => ({
      group: g,
      start: startPts.find((d) => d.group_label === g)?.value ?? null,
      end: endPts.find((d) => d.group_label === g)?.value ?? null,
    })).filter((d) => d.start !== null && d.end !== null);

    if (slopeData.length === 0) return;

    const W = Math.max(containerRef.current.clientWidth || 600, 360);
    const H = 400;
    const margin = { top: 40, right: 160, bottom: 40, left: 160 };
    const xLeft = margin.left;
    const xRight = W - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const allVals = slopeData.flatMap((d) => [d.start!, d.end!]);
    const [vMin, vMax] = d3.extent(allVals) as [number, number];
    const pad = (vMax - vMin) * 0.08;

    const yScale = d3.scaleLinear().domain([vMin - pad, vMax + pad]).range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(0,${margin.top})`);

    // Year axis labels
    g.append('text')
      .attr('x', xLeft)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 13)
      .attr('font-family', 'ui-monospace, monospace')
      .text(String(startYear));

    g.append('text')
      .attr('x', xRight)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 13)
      .attr('font-family', 'ui-monospace, monospace')
      .text(String(endYear));

    // Vertical axis lines
    g.append('line')
      .attr('x1', xLeft).attr('x2', xLeft)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#334155').attr('stroke-width', 1);

    g.append('line')
      .attr('x1', xRight).attr('x2', xRight)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#334155').attr('stroke-width', 1);

    // Draw slopes
    for (const d of slopeData) {
      const y1 = yScale(d.start!);
      const y2 = yScale(d.end!);
      const improved = d.end! > d.start!;
      const col = ETHNICITY_COLOURS[d.group] ?? '#94a3b8';
      const lineCol = improved ? col : col;
      const strokeW = 2;

      // Line
      g.append('line')
        .attr('x1', xLeft).attr('y1', y1)
        .attr('x2', xRight).attr('y2', y2)
        .attr('stroke', lineCol)
        .attr('stroke-width', strokeW)
        .attr('stroke-opacity', 0.85);

      // Start dot
      g.append('circle')
        .attr('cx', xLeft).attr('cy', y1)
        .attr('r', 5).attr('fill', col)
        .attr('stroke', '#020617').attr('stroke-width', 1.5);

      // End dot
      g.append('circle')
        .attr('cx', xRight).attr('cy', y2)
        .attr('r', 5).attr('fill', col)
        .attr('stroke', '#020617').attr('stroke-width', 1.5);

      // Left label (group name + value)
      g.append('text')
        .attr('x', xLeft - 10)
        .attr('y', y1 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', col)
        .attr('font-size', 11)
        .attr('font-family', 'ui-sans-serif, sans-serif')
        .text(`${d.group}  ${fmtRate(d.start)}`);

      // Right label (value + direction arrow)
      const arrow = improved ? '▲' : '▼';
      const arrowCol = improved ? '#4ade80' : '#f87171';
      g.append('text')
        .attr('x', xRight + 10)
        .attr('y', y2 + 4)
        .attr('text-anchor', 'start')
        .attr('fill', col)
        .attr('font-size', 11)
        .attr('font-family', 'ui-sans-serif, sans-serif')
        .text(`${fmtRate(d.end)}  `);

      g.append('text')
        .attr('x', xRight + 10 + 42)
        .attr('y', y2 + 4)
        .attr('text-anchor', 'start')
        .attr('fill', arrowCol)
        .attr('font-size', 10)
        .text(arrow);
    }

    // Y gridlines
    const yTicks = yScale.ticks(5);
    g.selectAll<SVGLineElement, number>('.grid-h')
      .data(yTicks)
      .join('line')
      .attr('class', 'grid-h')
      .attr('x1', xLeft).attr('x2', xRight)
      .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
      .attr('stroke', '#1e293b').attr('stroke-width', 1);

    // Y axis tick labels
    g.selectAll<SVGTextElement, number>('.y-label')
      .data(yTicks)
      .join('text')
      .attr('class', 'y-label')
      .attr('x', xLeft + (xRight - xLeft) / 2)
      .attr('y', (d) => yScale(d) - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .attr('font-size', 9)
      .attr('font-family', 'ui-monospace, monospace')
      .text((d) => `${Math.round(d * 100)}%`);
  }, [data]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[420px]" />;
  if (error) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <span className="text-xs text-slate-500 font-mono">NCEA Level:</span>
        {([1, 2, 3] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              level === l
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Level {l}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>

      <div className="flex gap-4 text-xs text-slate-500 font-mono pl-2">
        <span><span className="text-green-400">▲</span> improved 2015→2024</span>
        <span><span className="text-red-400">▼</span> declined 2015→2024</span>
      </div>
    </div>
  );
}
