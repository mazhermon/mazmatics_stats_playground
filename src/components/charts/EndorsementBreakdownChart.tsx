'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fmtRate, ETHNICITY_COLOURS, EQUITY_COLOURS, GENDER_COLOURS } from '@/lib/palette';

type Qualification = 'NCEA Level 1' | 'NCEA Level 2' | 'NCEA Level 3' | 'University Entrance';
type GroupBy = 'ethnicity' | 'equity_index_group' | 'gender' | 'region';

interface BreakdownRow {
  year: number;
  group_label: string;
  excellence_rate: number | null;
  merit_rate: number | null;
  no_endorsement_rate: number | null;
  total_attainment: number | null;
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
};

const QUAL_LABELS: Record<Qualification, string> = {
  'NCEA Level 1': 'L1',
  'NCEA Level 2': 'L2',
  'NCEA Level 3': 'L3',
  'University Entrance': 'UE',
};

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

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
const EQUITY_MIN_YEAR = 2019;

const BAND_COLOURS = {
  excellence: '#FFF73E',
  merit: '#BA90FF',
  no_endorsement: '#374151',
} as const;

export function EndorsementBreakdownChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [qualification, setQualification] = useState<Qualification>('NCEA Level 3');
  const [groupBy, setGroupBy] = useState<GroupBy>('ethnicity');
  const [year, setYear] = useState(2024);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BreakdownRow[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string; visible: boolean }>({
    x: 0, y: 0, html: '', visible: false,
  });

  const effectiveYear = groupBy === 'equity_index_group' ? Math.max(year, EQUITY_MIN_YEAR) : year;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `/api/nzqa/endorsement?qualification=${encodeURIComponent(qualification)}&groupBy=${groupBy}&yearFrom=${effectiveYear}&yearTo=${effectiveYear}`
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
  }, [qualification, groupBy, effectiveYear]);

  useEffect(() => {
    const el = svgRef.current;
    const container = containerRef.current;
    if (!el || !container || loading || error || data.length === 0) return;

    const w = container.clientWidth || 720;
    const margin = { top: 16, right: 20, bottom: 40, left: 160 };
    const rowH = 36;
    const h = margin.top + data.length * rowH + margin.bottom;
    const innerW = w - margin.left - margin.right;

    const svg = d3.select(el);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('height', h);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, innerW]);
    const bandNames: Array<'no_endorsement' | 'merit' | 'excellence'> = ['no_endorsement', 'merit', 'excellence'];

    const sorted = [...data].sort(
      (a, b) =>
        ((b.excellence_rate ?? 0) + (b.merit_rate ?? 0)) -
        ((a.excellence_rate ?? 0) + (a.merit_rate ?? 0))
    );

    sorted.forEach((row, i) => {
      const y = i * rowH + rowH * 0.15;
      const bh = rowH * 0.65;
      const label = displayLabel(groupBy, row.group_label);

      g.append('text')
        .attr('x', -8)
        .attr('y', y + bh / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', groupColour(groupBy, row.group_label))
        .attr('font-size', '12px')
        .text(label);

      let xOffset = 0;
      bandNames.forEach((band) => {
        const rate = row[`${band}_rate`] ?? 0;
        if (rate <= 0) return;
        const bw = x(rate);

        const rect = g
          .append('rect')
          .attr('x', xOffset)
          .attr('y', y)
          .attr('width', bw)
          .attr('height', bh)
          .attr('fill', BAND_COLOURS[band])
          .attr('rx', band === 'no_endorsement' ? 2 : 0)
          .style('cursor', 'pointer');

        if (bw > 34) {
          g.append('text')
            .attr('x', xOffset + bw / 2)
            .attr('y', y + bh / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', band === 'excellence' ? '#1e293b' : '#e2e8f0')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(fmtRate(rate));
        }

        const bandLabel = band === 'no_endorsement' ? 'No Endorsement' : band.charAt(0).toUpperCase() + band.slice(1);
        rect
          .on('mousemove', (event: MouseEvent) => {
            const containerRect = container.getBoundingClientRect();
            setTooltip({
              x: event.clientX - containerRect.left,
              y: event.clientY - containerRect.top,
              html: `<strong>${label}</strong><br/>${bandLabel}: <strong>${fmtRate(rate)}</strong>${row.total_attainment ? `<br/>Achieved: ${row.total_attainment.toLocaleString('en-NZ')}` : ''}`,
              visible: true,
            });
          })
          .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));

        xOffset += bw;
      });

      if (row.total_attainment) {
        g.append('text')
          .attr('x', xOffset + 6)
          .attr('y', y + bh / 2 + 4)
          .attr('fill', '#475569')
          .attr('font-size', '10px')
          .text(`n=${row.total_attainment.toLocaleString('en-NZ')}`);
      }
    });

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

    const legend = svg.append('g').attr('transform', `translate(${margin.left},${h - 16})`);
    ([
      { label: 'Excellence', color: BAND_COLOURS.excellence },
      { label: 'Merit', color: BAND_COLOURS.merit },
      { label: 'No Endorsement', color: '#374151' },
    ] as { label: string; color: string }[]).forEach((item, i) => {
      const lx = i * 130;
      legend.append('rect').attr('x', lx).attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', item.color);
      legend.append('text').attr('x', lx + 14).attr('y', 9).attr('fill', '#94a3b8').attr('font-size', '11px').text(item.label);
    });
  }, [data, groupBy, loading, error]);

  const availableYears = groupBy === 'equity_index_group'
    ? YEARS.filter((y) => y >= EQUITY_MIN_YEAR)
    : YEARS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Qualification */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(['NCEA Level 1', 'NCEA Level 2', 'NCEA Level 3', 'University Entrance'] as Qualification[]).map((q) => (
            <button
              key={q}
              onClick={() => setQualification(q)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                qualification === q ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {QUAL_LABELS[q]}
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
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {groupBy === 'equity_index_group' && year < EQUITY_MIN_YEAR && (
        <p className="text-xs text-amber-500/80 font-mono bg-amber-950/20 rounded px-3 py-1.5">
          Equity group data only available from 2019 onwards. Showing {EQUITY_MIN_YEAR}.
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
