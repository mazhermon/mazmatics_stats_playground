'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface TimelineRow {
  year: number;
  level: number;
  value: number;
  assessed_count: number;
}

interface ApiResponse {
  data: TimelineRow[];
  metric: string;
  groupBy: string;
}

export function SecondaryMathsPreview() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rows, setRows] = useState<TimelineRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/nzqa/timeline?metric=achieved_rate&groupBy=national&level=2')
      .then(r => r.json())
      .then((res: ApiResponse) => {
        if (!cancelled) setRows(res.data ?? []);
      })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!rows || !svgRef.current) return;

    const sorted = [...rows].sort((a, b) => a.year - b.year);
    if (!sorted.length) return;

    const w = 500, h = 180;
    const margin = { top: 12, right: 24, bottom: 28, left: 40 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const years = sorted.map(d => d.year);
    const values = sorted.map(d => d.value);

    const xScale = d3.scaleLinear()
      .domain([d3.min(years)!, d3.max(years)!])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, d3.min(values)! - 0.05), Math.min(1, d3.max(values)! + 0.05)])
      .nice()
      .range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(yScale.ticks(4))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#1e293b').attr('stroke-width', 1);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => String(d)).tickSize(3))
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', '9px');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    // Y axis (percentage)
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(4)
          .tickFormat(d => `${Math.round((d as number) * 100)}%`)
          .tickSize(3)
      )
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', '9px');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    // Area fill
    const areaGen = d3.area<TimelineRow>()
      .x(d => xScale(d.year))
      .y0(innerH)
      .y1(d => yScale(d.value));

    g.append('path')
      .datum(sorted)
      .attr('d', areaGen)
      .attr('fill', '#47A5F1')
      .attr('fill-opacity', 0.12);

    // Line
    const lineGen = d3.line<TimelineRow>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value));

    g.append('path')
      .datum(sorted)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#47A5F1')
      .attr('stroke-width', 2.5);

    // Dots
    g.selectAll('.dot')
      .data(sorted)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.value))
      .attr('r', 3)
      .attr('fill', '#47A5F1')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1);

    // End label
    const last = sorted[sorted.length - 1];
    g.append('text')
      .attr('x', xScale(last.year) + 5)
      .attr('y', yScale(last.value) + 4)
      .attr('fill', '#47A5F1')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text(`${Math.round(last.value * 100)}%`);
  }, [rows]);

  return (
    <div style={{ height: 180, position: 'relative' }}>
      {rows === null && (
        <div className="absolute inset-0 animate-pulse bg-slate-800/60 rounded-lg" />
      )}
      <svg
        ref={svgRef}
        viewBox="0 0 500 180"
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: 180, display: 'block' }}
      />
    </div>
  );
}
