'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';

type NatPoint = { year: number; level: number; value: number; assessed_count: number };

export function HorizonChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);

  const regUrl = `/api/nzqa/timeline?metric=achieved_rate&groupBy=region&level=${level}`;
  const natUrl = `/api/nzqa/timeline?metric=achieved_rate&groupBy=national&level=${level}`;

  const { data: regData, loading: regLoading, error: regError } = useNzqaData<TimelineResponse>(regUrl);
  const { data: natData } = useNzqaData<TimelineResponse>(natUrl);

  useEffect(() => {
    if (!regData || !natData || !svgRef.current || !containerRef.current) return;

    const regPoints = regData.data as TimelineGroupPoint[];
    const natPoints = (natData.data as NatPoint[]).filter((d) => d.level === level);

    const natByYear = new Map<number, number>(natPoints.map((d) => [d.year, d.value]));
    const years = [...new Set(regPoints.map((d) => d.year))].sort((a, b) => a - b);

    // Compute deviations: region rate - national average
    const regions = [...new Set(regPoints.map((d) => d.group_label))].filter(Boolean);

    type DevRow = { region: string; deviations: { year: number; dev: number }[] };
    const devRows: DevRow[] = regions.map((region) => ({
      region,
      deviations: years.map((yr) => {
        const nat = natByYear.get(yr) ?? 0;
        const pt = regPoints.find((d) => d.group_label === region && d.year === yr);
        return { year: yr, dev: pt !== undefined && pt.value !== null ? pt.value - nat : 0 };
      }),
    }));

    // Sort by most recent deviation (highest to lowest)
    devRows.sort((a, b) => {
      const lastA = a.deviations[a.deviations.length - 1]?.dev ?? 0;
      const lastB = b.deviations[b.deviations.length - 1]?.dev ?? 0;
      return lastB - lastA;
    });

    const W = Math.max(containerRef.current.clientWidth || 700, 400);
    const ROW_H = 28;
    const labelW = 120;
    const margin = { top: 16, right: 16, bottom: 32, left: labelW + 8 };
    const innerW = W - margin.left - margin.right;
    const H = margin.top + devRows.length * ROW_H + margin.bottom;

    const maxDev = d3.max(devRows, (r) => d3.max(r.deviations, (d) => Math.abs(d.dev))) ?? 0.1;
    // Use at least 0.05 (5%) range
    const devRange = Math.max(maxDev, 0.05);

    const xScale = d3.scaleLinear().domain(d3.extent(years) as [number, number]).range([0, innerW]);

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Clip for each row
    const defs = svg.append('defs');
    devRows.forEach((_, i) => {
      defs.append('clipPath')
        .attr('id', `horizon-clip-${i}`)
        .append('rect')
        .attr('x', 0).attr('y', 0)
        .attr('width', innerW).attr('height', ROW_H);
    });

    // Draw rows
    devRows.forEach((row, i) => {
      const rowG = g.append('g')
        .attr('transform', `translate(0,${i * ROW_H})`)
        .attr('clip-path', `url(#horizon-clip-${i})`);

      // Band height scale: 0 → ROW_H represents 0 → devRange
      const bandScale = d3.scaleLinear().domain([0, devRange]).range([0, ROW_H]);

      // Positive bands (above national avg) — teal
      const posData = row.deviations.map((d) => ({ ...d, dev: Math.max(0, d.dev) }));
      // Negative bands (below) — coral
      const negData = row.deviations.map((d) => ({ ...d, dev: Math.min(0, d.dev) }));

      const posArea = d3.area<{ year: number; dev: number }>()
        .x((d) => xScale(d.year))
        .y0(ROW_H)
        .y1((d) => ROW_H - bandScale(d.dev))
        .curve(d3.curveMonotoneX);

      const negArea = d3.area<{ year: number; dev: number }>()
        .x((d) => xScale(d.year))
        .y0(ROW_H)
        .y1((d) => ROW_H + bandScale(Math.abs(d.dev))) // fold down = overlap from above
        .curve(d3.curveMonotoneX);

      rowG.append('path')
        .datum(negData)
        .attr('fill', '#EE6677')
        .attr('fill-opacity', 0.75)
        .attr('d', negArea);

      rowG.append('path')
        .datum(posData)
        .attr('fill', '#44BB99')
        .attr('fill-opacity', 0.75)
        .attr('d', posArea);

      // Baseline
      rowG.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', ROW_H).attr('y2', ROW_H)
        .attr('stroke', '#334155').attr('stroke-width', 0.5);
    });

    // Row labels
    devRows.forEach((row, i) => {
      g.append('text')
        .attr('x', -8)
        .attr('y', i * ROW_H + ROW_H / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#94a3b8')
        .attr('font-size', 9)
        .attr('font-family', 'ui-monospace, monospace')
        .text(row.region.replace(' Region', ''));
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${devRows.length * ROW_H + 6})`)
      .call(d3.axisBottom(xScale).ticks(years.length).tickFormat(d3.format('d')))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10).attr('font-family', 'ui-monospace, monospace'))
      .call((ax) => ax.selectAll('.tick line').remove());
  }, [regData, natData, level]);

  if (regLoading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[520px]" />;
  if (regError) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{regError}</div>;

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

      <div className="flex gap-6 text-xs text-slate-500 font-mono pl-2">
        <span><span className="inline-block w-3 h-3 rounded-sm bg-[#44BB99] opacity-75 mr-1 align-middle" />above national avg</span>
        <span><span className="inline-block w-3 h-3 rounded-sm bg-[#EE6677] opacity-75 mr-1 align-middle" />below national avg</span>
      </div>
    </div>
  );
}
