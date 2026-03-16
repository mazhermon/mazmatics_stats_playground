'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS } from '@/lib/palette';

export function StreamGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);
  const [hovered, setHovered] = useState<string | null>(null);

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const allPoints = data.data as TimelineGroupPoint[];
    const groups = [...new Set(allPoints.map((d) => d.group_label))].filter(Boolean).sort();
    const years = [...new Set(allPoints.map((d) => d.year))].sort((a, b) => a - b);

    if (groups.length === 0 || years.length === 0) return;

    // Build a complete matrix — fill missing with 0
    const matrix: { year: number; [group: string]: number }[] = years.map((yr) => {
      const row: { year: number; [group: string]: number } = { year: yr };
      for (const g of groups) {
        const pt = allPoints.find((d) => d.year === yr && d.group_label === g);
        row[g] = pt?.value ?? 0;
      }
      return row;
    });

    const W = Math.max(containerRef.current.clientWidth || 700, 400);
    const H = 360;
    const margin = { top: 24, right: 24, bottom: 40, left: 24 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const stackGen = d3
      .stack<{ year: number; [key: string]: number }>()
      .keys(groups)
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut);

    const series = stackGen(matrix);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(years) as [number, number])
      .range([0, innerW]);

    const yExtent = [
      d3.min(series, (s) => d3.min(s, (d) => d[0])) ?? 0,
      d3.max(series, (s) => d3.max(s, (d) => d[1])) ?? 1,
    ] as [number, number];

    const yScale = d3.scaleLinear().domain(yExtent).range([innerH, 0]);

    const areaGen = d3
      .area<d3.SeriesPoint<{ year: number; [key: string]: number }>>()
      .x((d) => xScale((d.data as { year: number }).year))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveCatmullRom);

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw streams
    g.selectAll<SVGPathElement, d3.Series<{ year: number; [key: string]: number }, string>>('.stream')
      .data(series)
      .join('path')
      .attr('class', 'stream')
      .attr('d', areaGen)
      .attr('fill', (d) => ETHNICITY_COLOURS[d.key] ?? '#94a3b8')
      .attr('fill-opacity', (d) => (hovered === null || hovered === d.key ? 0.85 : 0.2))
      .attr('stroke', (d) => ETHNICITY_COLOURS[d.key] ?? '#94a3b8')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.3)
      .style('cursor', 'pointer')
      .on('mouseover', function (_, d) { setHovered(d.key); })
      .on('mouseout', function () { setHovered(null); });

    // Group labels — place at middle year
    const midYr = years[Math.floor(years.length / 2)];
    for (const s of series) {
      const midIdx = years.indexOf(midYr);
      if (midIdx < 0) continue;
      const y0 = yScale(s[midIdx][0]);
      const y1 = yScale(s[midIdx][1]);
      const midY = (y0 + y1) / 2;
      const bandH = Math.abs(y0 - y1);
      if (bandH < 14) continue; // too narrow to label

      g.append('text')
        .attr('x', xScale(midYr))
        .attr('y', midY + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#020617')
        .attr('fill-opacity', 0.8)
        .attr('font-size', 10)
        .attr('font-weight', '600')
        .attr('font-family', 'ui-sans-serif, sans-serif')
        .attr('pointer-events', 'none')
        .text(s.key);
    }

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH + 8})`)
      .call(d3.axisBottom(xScale).ticks(years.length).tickFormat(d3.format('d')))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) =>
        ax.selectAll('text')
          .attr('fill', '#94a3b8')
          .attr('font-size', 11)
          .attr('font-family', 'ui-monospace, monospace')
      )
      .call((ax) => ax.selectAll('.tick line').remove());
  }, [data, hovered]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[380px]" />;
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

      <div ref={containerRef} className="bg-slate-900 rounded-xl p-4">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>

      <p className="text-xs text-slate-600 font-mono pl-2">
        Hover a stream to highlight. Each band = one ethnic group&apos;s achievement rate. Y-axis uses wiggle offset for visual clarity.
      </p>
    </div>
  );
}
