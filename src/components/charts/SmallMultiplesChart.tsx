'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS } from '@/lib/palette';

function SmallPanel({
  group,
  points,
  years,
  yDomain,
  nationalAvgByYear,
}: {
  group: string;
  points: TimelineGroupPoint[];
  years: number[];
  yDomain: [number, number];
  nationalAvgByYear: Map<number, number>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const color = ETHNICITY_COLOURS[group] ?? '#94a3b8';

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const W = containerRef.current.clientWidth || 200;
    const H = 140;
    const margin = { top: 16, right: 8, bottom: 28, left: 32 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain(d3.extent(years) as [number, number]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain(yDomain).range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid
    g.selectAll<SVGLineElement, number>('.grid-h')
      .data(yScale.ticks(3))
      .join('line')
      .attr('class', 'grid-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
      .attr('stroke', '#1e293b').attr('stroke-width', 1);

    // National average reference line
    const natLine = d3.line<number>()
      .x((yr) => xScale(yr))
      .y((yr) => yScale(nationalAvgByYear.get(yr) ?? 0));

    g.append('path')
      .datum(years.filter((yr) => nationalAvgByYear.has(yr)))
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 2')
      .attr('d', natLine);

    // Group line
    const lineGen = d3.line<TimelineGroupPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX)
      .defined((d) => d.value !== null);

    const sorted = [...points].sort((a, b) => a.year - b.year);

    // Area fill
    const areaGen = d3.area<TimelineGroupPoint>()
      .x((d) => xScale(d.year))
      .y0(innerH)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX)
      .defined((d) => d.value !== null);

    g.append('path')
      .datum(sorted)
      .attr('fill', color)
      .attr('fill-opacity', 0.12)
      .attr('d', areaGen);

    g.append('path')
      .datum(sorted)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', lineGen);

    // End dot
    const last = sorted[sorted.length - 1];
    if (last) {
      g.append('circle')
        .attr('cx', xScale(last.year))
        .attr('cy', yScale(last.value))
        .attr('r', 3)
        .attr('fill', color);
    }

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(3).tickFormat((d) => `${Math.round(+d * 100)}%`))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('text').attr('fill', '#475569').attr('font-size', 8).attr('font-family', 'ui-monospace, monospace'))
      .call((ax) => ax.selectAll('.tick line').remove());

    // X axis (just first and last year)
    g.append('g')
      .attr('transform', `translate(0,${innerH + 4})`)
      .call(d3.axisBottom(xScale).tickValues([years[0], years[years.length - 1]]).tickFormat(d3.format('d')))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('text').attr('fill', '#475569').attr('font-size', 8).attr('font-family', 'ui-monospace, monospace'))
      .call((ax) => ax.selectAll('.tick line').remove());
  }, [points, years, yDomain, nationalAvgByYear, color]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="bg-slate-900 rounded-xl p-3 space-y-1">
      <div className="text-xs font-semibold" style={{ color }}>
        {group}
      </div>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>
    </div>
  );
}

export function SmallMultiplesChart() {
  const url = '/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=2';
  const natUrl = '/api/nzqa/timeline?metric=achieved_rate&groupBy=national&level=2';

  const { data, loading, error } = useNzqaData<TimelineResponse>(url);
  const { data: natData } = useNzqaData<TimelineResponse>(natUrl);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[360px]" />;
  if (error) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{error}</div>;
  if (!data) return null;

  const allPoints = data.data as TimelineGroupPoint[];
  const groups = [...new Set(allPoints.map((d) => d.group_label))].filter(Boolean).sort();
  const years = [...new Set(allPoints.map((d) => d.year))].sort((a, b) => a - b);

  const natPoints = natData
    ? (natData.data as Array<{ year: number; level: number; value: number; assessed_count: number }>)
    : [];
  const nationalAvgByYear = new Map<number, number>(
    natPoints.filter((d) => d.level === 2).map((d) => [d.year, d.value])
  );

  const allValues = allPoints.map((d) => d.value).filter((v) => v !== null);
  const [vMin, vMax] = d3.extent(allValues) as [number, number];
  const yDomain: [number, number] = [Math.max(0, vMin - 0.05), Math.min(1, vMax + 0.05)];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {groups.map((g) => {
          const groupPoints = allPoints.filter((d) => d.group_label === g);
          return (
            <SmallPanel
              key={g}
              group={g}
              points={groupPoints}
              years={years}
              yDomain={yDomain}
              nationalAvgByYear={nationalAvgByYear}
            />
          );
        })}
      </div>
      <p className="text-xs text-slate-600 font-mono pl-2">
        All charts use the same y-axis scale. Dashed line = national average (NCEA Level 2).
      </p>
    </div>
  );
}
