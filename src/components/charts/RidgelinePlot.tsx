'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS } from '@/lib/palette';

// Epanechnikov kernel for KDE
function epanechnikovKernel(bandwidth: number) {
  return (v: number) => {
    const u = v / bandwidth;
    return Math.abs(u) <= 1 ? (0.75 * (1 - u * u)) / bandwidth : 0;
  };
}

function kde(kernel: (v: number) => number, thresholds: number[], data: number[]) {
  return thresholds.map((x) => [x, d3.mean(data, (v) => kernel(x - v)) ?? 0] as [number, number]);
}

export function RidgelinePlot() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const allPoints = data.data as TimelineGroupPoint[];
    const groups = [...new Set(allPoints.map((d) => d.group_label))].filter(Boolean).sort();

    if (groups.length === 0) return;

    const W = Math.max(containerRef.current.clientWidth || 700, 400);
    const rowH = 56;
    const overlap = 24; // overlap between ridges
    const margin = { top: 24, right: 24, bottom: 40, left: 140 };
    const innerW = W - margin.left - margin.right;
    const H = margin.top + groups.length * (rowH - overlap) + overlap + margin.bottom;

    const xDomain: [number, number] = [0, 1];
    const xScale = d3.scaleLinear().domain(xDomain).range([0, innerW]);

    const thresholds = d3.range(0, 1.01, 0.01);
    const bandwidth = 0.07;
    const kernel = epanechnikovKernel(bandwidth);

    // Compute KDE per group
    type GroupKde = { group: string; density: [number, number][] };
    const groupKdes: GroupKde[] = groups.map((g) => {
      const values = allPoints
        .filter((d) => d.group_label === g && d.value !== null)
        .map((d) => d.value);
      return { group: g, density: kde(kernel, thresholds, values) };
    });

    // Global max density for consistent y-scale
    const maxDensity = d3.max(groupKdes, (gk) => d3.max(gk.density, (d) => d[1])) ?? 1;

    const yScale = d3.scaleLinear().domain([0, maxDensity]).range([rowH - overlap, 0]);

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${H - margin.top - margin.bottom + 8})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat((d) => `${Math.round(+d * 100)}%`))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11).attr('font-family', 'ui-monospace, monospace'))
      .call((ax) => ax.selectAll('.tick line').attr('stroke', '#1e293b').attr('y2', -(H - margin.top - margin.bottom)));

    // Draw each ridge
    groupKdes.forEach((gk, i) => {
      const offsetY = i * (rowH - overlap);
      const col = ETHNICITY_COLOURS[gk.group] ?? '#94a3b8';

      const areaGen = d3
        .area<[number, number]>()
        .x((d) => xScale(d[0]))
        .y0(rowH - overlap)
        .y1((d) => yScale(d[1]))
        .curve(d3.curveBasis);

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]))
        .curve(d3.curveBasis);

      const ridge = g.append('g').attr('transform', `translate(0,${offsetY})`);

      // Filled area
      ridge
        .append('path')
        .datum(gk.density)
        .attr('fill', col)
        .attr('fill-opacity', 0.35)
        .attr('d', areaGen);

      // Stroke line
      ridge
        .append('path')
        .datum(gk.density)
        .attr('fill', 'none')
        .attr('stroke', col)
        .attr('stroke-width', 2)
        .attr('d', lineGen);

      // Group label
      g.append('text')
        .attr('x', -8)
        .attr('y', offsetY + (rowH - overlap) / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', col)
        .attr('font-size', 11)
        .attr('font-family', 'ui-sans-serif, sans-serif')
        .text(gk.group);
    });
  }, [data]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[400px]" />;
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
              level === l ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
        Each ridge = distribution of yearly achievement rates (Epanechnikov KDE). Wider curves = more variable; peaks further right = higher typical achievement.
      </p>
    </div>
  );
}
