'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { fmtRate } from '@/lib/palette';

interface TooltipState {
  x: number;
  y: number;
  label: string;
  rate: number;
  count: number;
  visible: boolean;
}

type BubbleNode = TimelineGroupPoint & { x: number; y: number; r: number };

export function BubbleComparison() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);
  const [year, setYear] = useState(2024);
  const [tooltip, setTooltip] = useState<TooltipState>({
    x: 0, y: 0, label: '', rate: 0, count: 0, visible: false,
  });

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=region&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const allPoints = data.data as TimelineGroupPoint[];
    const yearPoints = allPoints.filter((d) => d.year === year && d.value !== null && d.assessed_count > 0);

    if (yearPoints.length === 0) return;

    const W = Math.max(containerRef.current.clientWidth || 700, 400);
    const H = 420;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    // Bubble sizing: area ∝ assessed_count (r = sqrt(count/π) * scale)
    const counts = yearPoints.map((d) => d.assessed_count);
    const [cMin, cMax] = d3.extent(counts) as [number, number];
    const maxR = Math.min(55, innerW / 6);
    const rScale = d3.scaleSqrt().domain([cMin, cMax]).range([14, maxR]);

    // Colour by achieved_rate: red → yellow → green
    const rates = yearPoints.map((d) => d.value);
    const [rMin, rMax] = d3.extent(rates) as [number, number];
    const colourScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([rMin, rMax]);

    // Create bubble nodes with initial positions
    const nodes: BubbleNode[] = yearPoints.map((d) => ({
      ...d,
      x: innerW / 2 + (Math.random() - 0.5) * innerW * 0.5,
      y: innerH / 2 + (Math.random() - 0.5) * innerH * 0.5,
      r: rScale(d.assessed_count),
    }));

    // Force simulation to avoid overlaps
    const simulation = d3
      .forceSimulation<BubbleNode>(nodes)
      .force('center', d3.forceCenter<BubbleNode>(innerW / 2, innerH / 2).strength(0.05))
      .force('collide', d3.forceCollide<BubbleNode>((d) => d.r + 3).strength(0.8))
      .force('x', d3.forceX<BubbleNode>(innerW / 2).strength(0.02))
      .force('y', d3.forceY<BubbleNode>(innerH / 2).strength(0.02))
      .stop();

    // Run synchronously
    for (let i = 0; i < 300; i++) simulation.tick();

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw bubbles
    g.selectAll<SVGCircleElement, BubbleNode>('.bubble')
      .data(nodes)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', (d) => Math.max(d.r, Math.min(innerW - d.r, d.x)))
      .attr('cy', (d) => Math.max(d.r, Math.min(innerH - d.r, d.y)))
      .attr('r', (d) => d.r)
      .attr('fill', (d) => colourScale(d.value))
      .attr('fill-opacity', 0.82)
      .attr('stroke', (d) => colourScale(d.value))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', function (event: MouseEvent, d) {
        d3.select(this).attr('fill-opacity', 1).attr('stroke-width', 3);
        const svgRect = svgRef.current?.getBoundingClientRect();
        setTooltip({
          x: event.clientX - (svgRect?.left ?? 0),
          y: event.clientY - (svgRect?.top ?? 0) - 12,
          label: d.group_label,
          rate: d.value,
          count: d.assessed_count,
          visible: true,
        });
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill-opacity', 0.82).attr('stroke-width', 1.5);
        setTooltip((t) => ({ ...t, visible: false }));
      });

    // Labels inside larger bubbles
    g.selectAll<SVGTextElement, BubbleNode>('.bubble-label')
      .data(nodes.filter((d) => d.r >= 24))
      .join('text')
      .attr('class', 'bubble-label')
      .attr('x', (d) => Math.max(d.r, Math.min(innerW - d.r, d.x)))
      .attr('y', (d) => Math.max(d.r, Math.min(innerH - d.r, d.y)) - 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .attr('font-size', (d) => Math.min(11, d.r / 3.5))
      .attr('font-weight', '600')
      .attr('font-family', 'ui-sans-serif, sans-serif')
      .attr('pointer-events', 'none')
      .text((d) => d.group_label.replace(' Region', '').split('/')[0].trim());

    g.selectAll<SVGTextElement, BubbleNode>('.bubble-rate')
      .data(nodes.filter((d) => d.r >= 28))
      .join('text')
      .attr('class', 'bubble-rate')
      .attr('x', (d) => Math.max(d.r, Math.min(innerW - d.r, d.x)))
      .attr('y', (d) => Math.max(d.r, Math.min(innerH - d.r, d.y)) + 13)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .attr('fill-opacity', 0.8)
      .attr('font-size', (d) => Math.min(10, d.r / 4.5))
      .attr('font-family', 'ui-monospace, monospace')
      .attr('pointer-events', 'none')
      .text((d) => fmtRate(d.value));

    // Colour legend (gradient bar)
    const legendW = 160;
    const legendH = 10;
    const legendX = innerW - legendW;
    const legendY = innerH - 24;

    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) defs = svg.append('defs');

    const gradId = `bubble-grad-${level}-${year}`;
    const grad = defs.append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%').attr('x2', '100%');

    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      grad.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', colourScale(rMin + t * (rMax - rMin)));
    });

    g.append('rect')
      .attr('x', legendX).attr('y', legendY)
      .attr('width', legendW).attr('height', legendH)
      .attr('rx', 3)
      .attr('fill', `url(#${gradId})`);

    g.append('text')
      .attr('x', legendX).attr('y', legendY - 4)
      .attr('fill', '#64748b').attr('font-size', 9).attr('font-family', 'ui-monospace, monospace')
      .text(`${fmtRate(rMin)} → ${fmtRate(rMax)}`);
  }, [data, year, level]);

  const years = data
    ? [...new Set((data.data as TimelineGroupPoint[]).map((d) => d.year))].sort((a, b) => a - b)
    : [];

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[440px]" />;
  if (error) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{error}</div>;

  return (
    <div className="space-y-3">
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

      <div ref={containerRef} className="bg-slate-900 rounded-xl p-4 relative">
        <svg ref={svgRef} className="w-full h-auto" />

        {tooltip.visible && (
          <div
            className="absolute pointer-events-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y, transform: 'translateY(-50%)' }}
          >
            <div className="font-semibold text-slate-200">{tooltip.label}</div>
            <div className="text-green-400 font-mono">{fmtRate(tooltip.rate)}</div>
            <div className="text-slate-500 font-mono">{tooltip.count.toLocaleString()} students</div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 font-mono pl-2">
        Bubble size ∝ student population (√ scaled). Colour = achievement rate (red=low → green=high). Hover for details.
      </p>
    </div>
  );
}
