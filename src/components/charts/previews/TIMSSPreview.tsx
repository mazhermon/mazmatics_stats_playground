'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface TimssRow {
  year: number;
  group_type: string;
  group_value: string;
  mean_score: number;
  se: number;
  intl_avg: number | null;
}

interface ApiResponse {
  data: TimssRow[];
  type: string;
}

export function TIMSSPreview() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rows, setRows] = useState<TimssRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/primary/timss?type=trend')
      .then(r => r.json())
      .then((res: ApiResponse) => {
        if (!cancelled) setRows(res.data ?? []);
      })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!rows || !svgRef.current) return;

    const nationalRows = rows.filter(d => d.group_type === 'national');
    if (!nationalRows.length) return;

    const w = 500, h = 180;
    const margin = { top: 12, right: 24, bottom: 28, left: 40 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const years = nationalRows.map(d => d.year);
    const intlRows = nationalRows.filter(d => d.intl_avg != null);
    const allScores = [
      ...nationalRows.map(d => d.mean_score),
      ...intlRows.map(d => d.intl_avg as number),
    ];

    const xScale = d3.scaleLinear()
      .domain([d3.min(years)!, d3.max(years)!])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, d3.min(allScores)! - 25), d3.max(allScores)! + 15])
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
      .call(
        d3.axisBottom(xScale)
          .tickValues([1995, 2003, 2011, 2019, 2023])
          .tickFormat(d => String(d))
          .tickSize(3)
      )
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', '9px');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4).tickSize(3))
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', '9px');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    // Intl avg line (dashed slate)
    if (intlRows.length) {
      const intlLine = d3.line<TimssRow>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.intl_avg!));

      g.append('path')
        .datum(intlRows)
        .attr('d', intlLine)
        .attr('fill', 'none')
        .attr('stroke', '#475569')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,4');
    }

    // Area under NZ line
    const area = d3.area<TimssRow>()
      .x(d => xScale(d.year))
      .y0(innerH)
      .y1(d => yScale(d.mean_score));

    g.append('path')
      .datum(nationalRows)
      .attr('d', area)
      .attr('fill', '#BA90FF')
      .attr('fill-opacity', 0.08);

    // NZ line
    const nzLine = d3.line<TimssRow>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.mean_score));

    g.append('path')
      .datum(nationalRows)
      .attr('d', nzLine)
      .attr('fill', 'none')
      .attr('stroke', '#BA90FF')
      .attr('stroke-width', 2.5);

    // NZ dots
    g.selectAll('.nz-dot')
      .data(nationalRows)
      .join('circle')
      .attr('class', 'nz-dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.mean_score))
      .attr('r', 3)
      .attr('fill', '#BA90FF')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1);

    // End label
    const last = nationalRows[nationalRows.length - 1];
    g.append('text')
      .attr('x', xScale(last.year) + 5)
      .attr('y', yScale(last.mean_score) + 4)
      .attr('fill', '#BA90FF')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text('NZ');
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
