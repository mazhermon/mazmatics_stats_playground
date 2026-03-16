'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { fmtRate } from '@/lib/palette';

interface TooltipState {
  x: number;
  y: number;
  label: string;
  value: number;
  count: number;
  visible: boolean;
}

export function BeeswarmChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);
  const [year, setYear] = useState(2024);
  const [tooltip, setTooltip] = useState<TooltipState>({
    x: 0, y: 0, label: '', value: 0, count: 0, visible: false,
  });

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=region&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const allPoints = data.data as TimelineGroupPoint[];
    const yearPoints = allPoints.filter((d) => d.year === year && d.value !== null);

    if (yearPoints.length === 0) return;

    const W = Math.max(containerRef.current.clientWidth || 700, 400);
    const H = 240;
    const margin = { top: 40, right: 24, bottom: 40, left: 24 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerW]);

    // Size circles by assessed_count
    const counts = yearPoints.map((d) => d.assessed_count).filter((c) => c > 0);
    const [cMin, cMax] = d3.extent(counts) as [number, number];
    const rScale = d3.scaleSqrt().domain([cMin, cMax]).range([6, 20]);

    // Run force simulation for beeswarm layout
    type Node = TimelineGroupPoint & { x: number; y: number; r: number };
    const nodes: Node[] = yearPoints.map((d) => ({
      ...d,
      x: xScale(d.value),
      y: innerH / 2,
      r: d.assessed_count > 0 ? rScale(d.assessed_count) : 8,
    }));

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force('x', d3.forceX<Node>((d) => xScale(d.value)).strength(1))
      .force('y', d3.forceY<Node>(innerH / 2).strength(0.05))
      .force('collide', d3.forceCollide<Node>((d) => d.r + 2))
      .stop();

    // Run synchronously
    for (let i = 0; i < 200; i++) simulation.tick();

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH + 8})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat((d) => `${Math.round(+d * 100)}%`))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11).attr('font-family', 'ui-monospace, monospace'))
      .call((ax) => ax.selectAll('.tick line').remove());

    // X gridlines
    g.selectAll<SVGLineElement, number>('.grid-v')
      .data(xScale.ticks(6))
      .join('line')
      .attr('class', 'grid-v')
      .attr('x1', (d) => xScale(d)).attr('x2', (d) => xScale(d))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#1e293b').attr('stroke-width', 1);

    // Circles
    g.selectAll<SVGCircleElement, Node>('.bee-dot')
      .data(nodes)
      .join('circle')
      .attr('class', 'bee-dot')
      .attr('cx', (d) => Math.max(d.r, Math.min(innerW - d.r, d.x)))
      .attr('cy', (d) => Math.max(d.r, Math.min(innerH - d.r, d.y)))
      .attr('r', (d) => d.r)
      .attr('fill', '#47A5F1')
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#47A5F1')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.9)
      .style('cursor', 'pointer')
      .on('mouseover', function (event: MouseEvent, d) {
        d3.select(this).attr('fill-opacity', 1).attr('stroke', '#BA90FF').attr('stroke-width', 2);
        const svgRect = svgRef.current?.getBoundingClientRect();
        setTooltip({
          x: event.clientX - (svgRect?.left ?? 0),
          y: event.clientY - (svgRect?.top ?? 0) - 12,
          label: d.group_label,
          value: d.value,
          count: d.assessed_count,
          visible: true,
        });
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill-opacity', 0.7).attr('stroke', '#47A5F1').attr('stroke-width', 1.5);
        setTooltip((t) => ({ ...t, visible: false }));
      });

    // Region labels for larger dots
    g.selectAll<SVGTextElement, Node>('.bee-label')
      .data(nodes.filter((d) => d.r >= 12))
      .join('text')
      .attr('class', 'bee-label')
      .attr('x', (d) => Math.max(d.r, Math.min(innerW - d.r, d.x)))
      .attr('y', (d) => Math.max(d.r, Math.min(innerH - d.r, d.y)) + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#020617')
      .attr('font-size', 8)
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text((d) => d.group_label.replace(' Region', '').split('/')[0].trim());
  }, [data, year, level]);

  const years = data
    ? [...new Set((data.data as TimelineGroupPoint[]).map((d) => d.year))].sort((a, b) => a - b)
    : [];

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[280px]" />;
  if (error) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{error}</div>;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-mono">Level:</span>
          {([1, 2, 3] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                level === l ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              L{l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-slate-500 font-mono">Year:</span>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                year === y ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="bg-slate-900 rounded-xl p-4 relative">
        <svg ref={svgRef} className="w-full h-auto" />

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute pointer-events-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y, transform: 'translateY(-50%)' }}
          >
            <div className="font-semibold text-slate-200">{tooltip.label}</div>
            <div className="text-blue-400 font-mono">{fmtRate(tooltip.value)}</div>
            <div className="text-slate-500 font-mono">{tooltip.count.toLocaleString()} students</div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 font-mono pl-2">
        Dot size = student population. Hover for details. X-axis = achieved rate.
      </p>
    </div>
  );
}
