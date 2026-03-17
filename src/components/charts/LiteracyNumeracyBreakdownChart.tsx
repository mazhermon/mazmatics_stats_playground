'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fmtRate, ETHNICITY_COLOURS, EQUITY_COLOURS, GENDER_COLOURS } from '@/lib/palette';

type AreaOption = 'literacy' | 'numeracy';
type YearLevel = 11 | 12 | 13;
type RateType = 'current' | 'cumulative';
type GroupBy = 'ethnicity' | 'equity_index_group' | 'gender' | 'region';

interface BreakdownRow {
  year: number;
  group_label: string;
  area: string;
  year_level: number;
  current_attainment_rate: number | null;
  cumulative_attainment_rate: number | null;
  current_attainment: number | null;
  total_count: number | null;
}

const ETHNICITY_DISPLAY: Record<string, string> = {
  Maori: 'Māori',
  European: 'NZ European / Pākehā',
  'Middle Eastern/Latin American/African': 'MELAA',
  'Pacific Peoples': 'Pacific Peoples',
  Asian: 'Asian',
};

const EQUITY_DISPLAY: Record<string, string> = {
  Fewer: 'Fewer resources',
  Moderate: 'Moderate resources',
  More: 'More resources',
  'Decile 1-3': 'Decile 1–3 (low)',
  'Decile 4-7': 'Decile 4–7 (mid)',
  'Decile 8-10': 'Decile 8–10 (high)',
};

const AREA_COLOURS: Record<AreaOption, string> = {
  literacy: '#2DD4BF',
  numeracy: '#FB923C',
};

const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  11: 'Year 11',
  12: 'Year 12',
  13: 'Year 13',
};

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
const EQUITY_NEW_MIN_YEAR = 2019; // Fewer/Moderate/More format starts 2019

function displayLabel(groupBy: GroupBy, raw: string): string {
  if (groupBy === 'ethnicity') return ETHNICITY_DISPLAY[raw] ?? raw;
  if (groupBy === 'equity_index_group') return EQUITY_DISPLAY[raw] ?? raw;
  return raw;
}

function groupColour(groupBy: GroupBy, raw: string): string {
  if (groupBy === 'ethnicity') {
    const mapped = ETHNICITY_COLOURS[ETHNICITY_DISPLAY[raw] ?? raw] ?? ETHNICITY_COLOURS[raw];
    return mapped ?? '#888';
  }
  if (groupBy === 'equity_index_group') return EQUITY_COLOURS[raw] ?? '#888';
  if (groupBy === 'gender') return GENDER_COLOURS[raw] ?? '#888';
  return '#888';
}

export function LiteracyNumeracyBreakdownChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<AreaOption>('numeracy');
  const [yearLevel, setYearLevel] = useState<YearLevel>(11);
  const [rateType, setRateType] = useState<RateType>('current');
  const [groupBy, setGroupBy] = useState<GroupBy>('ethnicity');
  const [year, setYear] = useState(2024);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BreakdownRow[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string; visible: boolean }>({
    x: 0, y: 0, html: '', visible: false,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `/api/nzqa/literacy-numeracy?area=${area}&yearLevel=${yearLevel}&groupBy=${groupBy}&yearFrom=${year}&yearTo=${year}`
    )
      .then((r) => r.json())
      .then((json: { error?: string; data: BreakdownRow[] }) => {
        if (json.error) throw new Error(json.error);
        setData(json.data as BreakdownRow[]);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [area, yearLevel, groupBy, year]);

  useEffect(() => {
    const el = svgRef.current;
    const container = containerRef.current;
    if (!el || !container || loading || error || data.length === 0) return;

    const rateKey = rateType === 'current' ? 'current_attainment_rate' : 'cumulative_attainment_rate';
    const areaColor = AREA_COLOURS[area];

    const w = container.clientWidth || 720;
    const margin = { top: 16, right: 80, bottom: 36, left: 160 };
    const rowH = 36;
    const h = margin.top + data.length * rowH + margin.bottom;
    const innerW = w - margin.left - margin.right;

    const svg = d3.select(el);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('height', h);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const allRates = data.map((d) => (d[rateKey as keyof BreakdownRow] as number) ?? 0);
    const xMax = Math.min(1, (d3.max(allRates) ?? 1) * 1.05);
    const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);

    const sorted = [...data].sort(
      (a, b) =>
        ((b[rateKey as keyof BreakdownRow] as number) ?? 0) -
        ((a[rateKey as keyof BreakdownRow] as number) ?? 0)
    );

    sorted.forEach((row, i) => {
      const yPos = i * rowH + rowH * 0.15;
      const bh = rowH * 0.65;
      const rate = (row[rateKey as keyof BreakdownRow] as number) ?? 0;
      const bw = x(rate);
      const label = displayLabel(groupBy, row.group_label);

      // Row label (left side)
      g.append('text')
        .attr('x', -8)
        .attr('y', yPos + bh / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', groupColour(groupBy, row.group_label))
        .attr('font-size', '12px')
        .text(label);

      // Bar
      const rect = g
        .append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', bw)
        .attr('height', bh)
        .attr('fill', areaColor)
        .attr('rx', 2)
        .attr('opacity', 0.85)
        .style('cursor', 'pointer');

      // Inline rate label
      if (bw > 40) {
        g.append('text')
          .attr('x', bw - 6)
          .attr('y', yPos + bh / 2 + 4)
          .attr('text-anchor', 'end')
          .attr('fill', '#1e293b')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(fmtRate(rate));
      }

      // Rate label outside bar (if bar too short)
      if (bw <= 40 && rate > 0) {
        g.append('text')
          .attr('x', bw + 6)
          .attr('y', yPos + bh / 2 + 4)
          .attr('fill', areaColor)
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(fmtRate(rate));
      }

      // n= label
      if (row.total_count) {
        g.append('text')
          .attr('x', innerW + 6)
          .attr('y', yPos + bh / 2 + 4)
          .attr('fill', '#475569')
          .attr('font-size', '10px')
          .text(`n=${row.total_count.toLocaleString('en-NZ')}`);
      }

      rect
        .on('mousemove', (event: MouseEvent) => {
          const containerRect = container.getBoundingClientRect();
          setTooltip({
            x: event.clientX - containerRect.left,
            y: event.clientY - containerRect.top,
            html: `<strong>${label}</strong><br/>${rateType === 'current' ? 'Current year' : 'Cumulative'}: <strong>${fmtRate(rate)}</strong>${row.total_count ? `<br/>Cohort: ${row.total_count.toLocaleString('en-NZ')}` : ''}`,
            visible: true,
          });
        })
        .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));
    });

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${sorted.length * rowH + 4})`)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickFormat((d) => `${((d as number) * 100).toFixed(0)}%`)
      )
      .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
      .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
      .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));
  }, [data, area, rateType, groupBy, loading, error]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Area */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(['literacy', 'numeracy'] as AreaOption[]).map((a) => (
            <button
              key={a}
              onClick={() => setArea(a)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                area === a ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        {/* Year Level */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {([11, 12, 13] as YearLevel[]).map((yl) => (
            <button
              key={yl}
              onClick={() => setYearLevel(yl)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                yearLevel === yl ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {YEAR_LEVEL_LABELS[yl]}
            </button>
          ))}
        </div>

        {/* Rate type */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {([['current', 'Current year'], ['cumulative', 'Cumulative']] as [RateType, string][]).map(([r, label]) => (
            <button
              key={r}
              onClick={() => setRateType(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                rateType === r ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* GroupBy */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(
            [
              ['ethnicity', 'Ethnicity'],
              ['equity_index_group', 'Equity'],
              ['gender', 'Gender'],
              ['region', 'Region'],
            ] as [GroupBy, string][]
          ).map(([g, label]) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                groupBy === g ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Year */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-mono">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-2 py-1.5"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {groupBy === 'equity_index_group' && year >= EQUITY_NEW_MIN_YEAR && (
        <p className="text-xs text-slate-500 font-mono bg-slate-800/50 rounded px-3 py-1.5">
          2019–2024 shows equity index groups (Fewer/Moderate/More resources). Earlier years show school decile bands.
        </p>
      )}

      <div ref={containerRef} className="w-full bg-slate-900/50 rounded-xl p-4 relative">
        {loading && <div className="animate-pulse bg-slate-800 rounded-xl h-48" />}
        {error && <div className="text-red-400 text-sm p-4">Error: {error}</div>}
        {!loading && !error && data.length === 0 && (
          <p className="text-slate-500 text-sm p-4">No data available for this selection.</p>
        )}
        {!loading && !error && data.length > 0 && <svg ref={svgRef} className="w-full" />}

        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-10 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl whitespace-nowrap"
            style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
      </div>
    </div>
  );
}
