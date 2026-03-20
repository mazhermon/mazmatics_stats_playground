'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface LnRow {
  year: number;
  area: string;
  year_level: number;
  current_attainment_rate: number | null;
}

interface ApiResponse {
  data: LnRow[];
  area: string;
  yearLevel: number;
  groupBy: string;
}

const AREA_COLOURS = {
  literacy: '#2DD4BF',
  numeracy: '#FB923C',
};

interface AreaData {
  litRows: LnRow[];
  numRows: LnRow[];
}

export function LiteracyNumeracyPreview() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<AreaData | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/nzqa/literacy-numeracy?area=literacy&yearLevel=11&groupBy=national').then(r => r.json()) as Promise<ApiResponse>,
      fetch('/api/nzqa/literacy-numeracy?area=numeracy&yearLevel=11&groupBy=national').then(r => r.json()) as Promise<ApiResponse>,
    ])
      .then(([litRes, numRes]) => {
        if (cancelled) return;
        setData({
          litRows: (litRes.data ?? []).filter(d => d.current_attainment_rate != null).sort((a, b) => a.year - b.year),
          numRows: (numRes.data ?? []).filter(d => d.current_attainment_rate != null).sort((a, b) => a.year - b.year),
        });
      })
      .catch(() => { if (!cancelled) setData({ litRows: [], numRows: [] }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { litRows, numRows } = data;
    const allRows = [...litRows, ...numRows];
    if (!allRows.length) return;

    const w = 500, h = 180;
    const margin = { top: 12, right: 30, bottom: 28, left: 40 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const allYears = allRows.map(d => d.year);
    const allRates = allRows.map(d => d.current_attainment_rate as number);

    const xScale = d3.scaleLinear()
      .domain([d3.min(allYears)!, d3.max(allYears)!])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, d3.min(allRates)! - 0.05), Math.min(1, d3.max(allRates)! + 0.05)])
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

    // Y axis
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

    const lineGen = (rows: LnRow[]) =>
      d3.line<LnRow>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.current_attainment_rate!))
        (rows);

    (['literacy', 'numeracy'] as const).forEach(area => {
      const aRows = area === 'literacy' ? litRows : numRows;
      if (!aRows.length) return;
      const colour = AREA_COLOURS[area];

      // Area fill
      const areaGen = d3.area<LnRow>()
        .x(d => xScale(d.year))
        .y0(innerH)
        .y1(d => yScale(d.current_attainment_rate!));

      g.append('path')
        .datum(aRows)
        .attr('d', areaGen)
        .attr('fill', colour)
        .attr('fill-opacity', 0.08);

      // Line
      g.append('path')
        .datum(aRows)
        .attr('d', lineGen(aRows))
        .attr('fill', 'none')
        .attr('stroke', colour)
        .attr('stroke-width', 2);

      // End label
      const last = aRows[aRows.length - 1];
      g.append('text')
        .attr('x', xScale(last.year) + 5)
        .attr('y', yScale(last.current_attainment_rate!) + 4)
        .attr('fill', colour)
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .text(area === 'literacy' ? 'Lit' : 'Num');
    });
  }, [data]);

  return (
    <div style={{ height: 180, position: 'relative' }}>
      {data === null && (
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
