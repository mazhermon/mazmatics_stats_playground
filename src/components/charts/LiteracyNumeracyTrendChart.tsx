'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fmtRate, ETHNICITY_COLOURS, GENDER_COLOURS } from '@/lib/palette';
import { GenderNote } from './GenderNote';

type AreaMode = 'both' | 'literacy' | 'numeracy';
type YearLevel = 11 | 12 | 13;
type RateType = 'current' | 'cumulative';
type ViewMode = 'national' | 'ethnicity' | 'gender';

interface NationalRow {
  year: number;
  area: string;
  year_level: number;
  current_attainment_rate: number | null;
  cumulative_attainment_rate: number | null;
  total_count: number | null;
}

interface GroupedRow {
  year: number;
  group_label: string;
  area: string;
  year_level: number;
  current_attainment_rate: number | null;
  cumulative_attainment_rate: number | null;
}

const ETHNICITY_DISPLAY: Record<string, string> = {
  Maori: 'Māori',
  European: 'NZ European / Pākehā',
  'Middle Eastern/Latin American/African': 'MELAA',
  'Pacific Peoples': 'Pacific Peoples',
  Asian: 'Asian',
};

const LIT_NUM_ETHNICITY_COLOURS: Record<string, string> = {
  Maori: ETHNICITY_COLOURS['Māori'] ?? '#EE6677',
  European: ETHNICITY_COLOURS['European'] ?? '#4477AA',
  Asian: ETHNICITY_COLOURS['Asian'] ?? '#66CCEE',
  'Pacific Peoples': ETHNICITY_COLOURS['Pacific Peoples'] ?? '#CCBB44',
  'Middle Eastern/Latin American/African': ETHNICITY_COLOURS['MELAA'] ?? '#228833',
};

const AREA_COLOURS = {
  literacy: '#2DD4BF',   // teal
  numeracy: '#FB923C',   // amber
} as const;

const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  11: 'Year 11',
  12: 'Year 12',
  13: 'Year 13',
};

export function LiteracyNumeracyTrendChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [areaMode, setAreaMode] = useState<AreaMode>('both');
  const [yearLevel, setYearLevel] = useState<YearLevel>(11);
  const [rateType, setRateType] = useState<RateType>('current');
  const [view, setView] = useState<ViewMode>('national');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [litData, setLitData] = useState<NationalRow[] | GroupedRow[]>([]);
  const [numData, setNumData] = useState<NationalRow[] | GroupedRow[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string; visible: boolean }>({
    x: 0, y: 0, html: '', visible: false,
  });

  const groupBy = view === 'national' ? 'national' : view;
  const areasToFetch: Array<'literacy' | 'numeracy'> =
    areaMode === 'both' ? ['literacy', 'numeracy'] : [areaMode];

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetches = areasToFetch.map((a) =>
      fetch(`/api/nzqa/literacy-numeracy?area=${a}&yearLevel=${yearLevel}&groupBy=${groupBy}`)
        .then((r) => r.json())
        .then((json: { error?: string; data: NationalRow[] | GroupedRow[] }) => {
          if (json.error) throw new Error(json.error);
          return { area: a, data: json.data };
        })
    );

    Promise.all(fetches)
      .then((results) => {
        const lit = results.find((r) => r.area === 'literacy');
        const num = results.find((r) => r.area === 'numeracy');
        setLitData(lit?.data ?? []);
        setNumData(num?.data ?? []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [areaMode, yearLevel, groupBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = svgRef.current;
    const container = containerRef.current;
    if (!el || !container || loading || error) return;

    const w = container.clientWidth || 720;
    const h = 300;
    const margin = { top: 24, right: 130, bottom: 40, left: 52 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const svg = d3.select(el);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('height', h);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const rateKey = rateType === 'current' ? 'current_attainment_rate' : 'cumulative_attainment_rate';

    if (view === 'national') {
      // One or two lines: literacy (teal) + numeracy (amber)
      const datasets: Array<{ area: 'literacy' | 'numeracy'; rows: NationalRow[] }> = [];
      if (areaMode === 'both' || areaMode === 'literacy') datasets.push({ area: 'literacy', rows: litData as NationalRow[] });
      if (areaMode === 'both' || areaMode === 'numeracy') datasets.push({ area: 'numeracy', rows: numData as NationalRow[] });

      const allRows = [...(litData as NationalRow[]), ...(numData as NationalRow[])];
      const allYears = allRows.map((d) => d.year);
      const allValues = allRows.map((d) => (d[rateKey as keyof NationalRow] as number) ?? 0);

      if (allYears.length === 0) return;

      const x = d3.scaleLinear()
        .domain([d3.min(allYears)! - 0.5, d3.max(allYears)! + 0.5])
        .range([0, innerW]);
      const yMax = Math.min(1, (d3.max(allValues) ?? 1) * 1.05);
      const yMin = Math.max(0, (d3.min(allValues) ?? 0) * 0.92);
      const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]);

      // Grid
      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
        .call((ax) => ax.select('.domain').remove())
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#1e293b').attr('stroke-dasharray', '3,3'));

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat((d) => String(d)))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${((d as number) * 100).toFixed(0)}%`))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      const lineGen = d3.line<NationalRow>()
        .x((d) => x(d.year))
        .y((d) => y((d[rateKey as keyof NationalRow] as number) ?? 0))
        .defined((d) => d[rateKey as keyof NationalRow] != null)
        .curve(d3.curveMonotoneX);

      datasets.forEach(({ area, rows }) => {
        const color = AREA_COLOURS[area];

        // Fill area under line
        const areaGen = d3.area<NationalRow>()
          .x((d) => x(d.year))
          .y0(innerH)
          .y1((d) => y((d[rateKey as keyof NationalRow] as number) ?? 0))
          .defined((d) => d[rateKey as keyof NationalRow] != null)
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(rows)
          .attr('d', areaGen)
          .attr('fill', color)
          .attr('opacity', 0.08);

        g.append('path')
          .datum(rows)
          .attr('d', lineGen)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('opacity', 0.9);

        // Dots at each point
        g.selectAll(`.dot-${area}`)
          .data(rows.filter((d) => d[rateKey as keyof NationalRow] != null))
          .join('circle')
          .attr('class', `dot-${area}`)
          .attr('cx', (d) => x(d.year))
          .attr('cy', (d) => y((d[rateKey as keyof NationalRow] as number) ?? 0))
          .attr('r', 3)
          .attr('fill', color)
          .style('cursor', 'pointer')
          .on('mousemove', (event: MouseEvent, d: NationalRow) => {
            const rect = container.getBoundingClientRect();
            const rate = d[rateKey as keyof NationalRow] as number;
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              html: `<strong>${d.year}</strong> · ${area}<br/>${rateType === 'current' ? 'Current year' : 'Cumulative'}: <strong>${fmtRate(rate)}</strong>${d.total_count ? `<br/>Cohort: ${d.total_count.toLocaleString('en-NZ')}` : ''}`,
              visible: true,
            });
          })
          .on('mouseleave', () => setTooltip((t) => ({ ...t, visible: false })));

        // End label
        const lastRow = rows.filter((d) => d[rateKey as keyof NationalRow] != null).at(-1);
        if (lastRow) {
          svg.append('text')
            .attr('x', margin.left + x(lastRow.year) + 8)
            .attr('y', margin.top + y((lastRow[rateKey as keyof NationalRow] as number) ?? 0) + 4)
            .attr('fill', color)
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .text(area === 'literacy' ? 'Literacy' : 'Numeracy');
        }
      });

      // Legend
      const legend = svg.append('g').attr('transform', `translate(${w - margin.right + 10},${margin.top + 10})`);
      datasets.forEach(({ area }, i) => {
        const row = legend.append('g').attr('transform', `translate(0,${i * 22})`);
        row.append('rect').attr('width', 12).attr('height', 3).attr('y', 4).attr('rx', 1).attr('fill', AREA_COLOURS[area]);
        row.append('text').attr('x', 16).attr('y', 10).attr('fill', '#94a3b8').attr('font-size', '11px')
          .text(area.charAt(0).toUpperCase() + area.slice(1));
      });
    } else {
      // Grouped line chart — one line per group
      const sourceData = areaMode === 'numeracy'
        ? (numData as GroupedRow[])
        : (litData as GroupedRow[]);

      if (sourceData.length === 0) return;

      const groups = [...new Set(sourceData.map((d) => d.group_label))];
      const years = [...new Set(sourceData.map((d) => d.year))].sort();

      const byGroup = new Map<string, Map<number, number>>();
      sourceData.forEach((d) => {
        if (!byGroup.has(d.group_label)) byGroup.set(d.group_label, new Map());
        const rate = d[rateKey as keyof GroupedRow] as number | null;
        if (rate != null) byGroup.get(d.group_label)!.set(d.year, rate);
      });

      const allValues = sourceData.map((d) => (d[rateKey as keyof GroupedRow] as number) ?? 0).filter(Boolean);
      const yMax = Math.min(1, (d3.max(allValues) ?? 1) * 1.05);
      const yMin = Math.max(0, (d3.min(allValues) ?? 0) * 0.92);

      const x = d3.scaleLinear()
        .domain([d3.min(years)! - 0.5, d3.max(years)! + 0.5])
        .range([0, innerW]);
      const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]);

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
        .call((ax) => ax.select('.domain').remove())
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#1e293b').attr('stroke-dasharray', '3,3'));

      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat((d) => String(d)))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${((d as number) * 100).toFixed(0)}%`))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      const lineGen = d3.line<{ year: number; value: number }>()
        .x((d) => x(d.year))
        .y((d) => y(d.value))
        .defined((d) => !isNaN(d.value))
        .curve(d3.curveMonotoneX);

      const lineColours = view === 'ethnicity' ? LIT_NUM_ETHNICITY_COLOURS : GENDER_COLOURS;

      groups.forEach((group) => {
        const groupMap = byGroup.get(group)!;
        const lineData = years.map((yr) => ({ year: yr, value: groupMap.get(yr) ?? NaN }));
        const color = lineColours[group] ?? '#888888';
        const displayLbl = view === 'ethnicity' ? (ETHNICITY_DISPLAY[group] ?? group) : group;

        g.append('path')
          .datum(lineData)
          .attr('d', lineGen)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('opacity', 0.9);

        const lastPt = lineData.filter((d) => !isNaN(d.value)).at(-1);
        if (lastPt) {
          g.append('circle').attr('cx', x(lastPt.year)).attr('cy', y(lastPt.value)).attr('r', 4).attr('fill', color);
          const shortLabel = displayLbl.split(' ')[0] ?? displayLbl;
          svg.append('text')
            .attr('x', margin.left + x(lastPt.year) + 8)
            .attr('y', margin.top + y(lastPt.value) + 4)
            .attr('fill', color)
            .attr('font-size', '10px')
            .text(shortLabel);
        }
      });
    }
  }, [litData, numData, areaMode, yearLevel, rateType, view, loading, error]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Area */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(['both', 'literacy', 'numeracy'] as AreaMode[]).map((a) => (
            <button
              key={a}
              onClick={() => setAreaMode(a)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                areaMode === a ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {a === 'both' ? 'Both' : a.charAt(0).toUpperCase() + a.slice(1)}
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

        {/* View */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(
            [
              ['national', 'National'],
              ['ethnicity', 'By Ethnicity'],
              ['gender', 'By Gender'],
            ] as [ViewMode, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === v ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view !== 'national' && areaMode === 'both' && (
        <p className="text-xs text-amber-500/80 font-mono bg-amber-950/20 rounded px-3 py-1.5">
          Group view shows one area at a time. Switch to Literacy or Numeracy above to select.
        </p>
      )}

      <div ref={containerRef} className="w-full bg-slate-900/50 rounded-xl p-4 relative overflow-visible">
        {loading && <div className="animate-pulse bg-slate-800 rounded-xl h-72" />}
        {error && <div className="text-red-400 text-sm p-4">Error: {error}</div>}
        {!loading && !error && <svg ref={svgRef} className="w-full" />}

        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-10 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl whitespace-nowrap"
            style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
      </div>

      {view === 'gender' && <GenderNote />}
      <p className="text-xs text-slate-500 font-mono">
        Teal = Literacy · Amber = Numeracy · &ldquo;Current year&rdquo; = first-time passers this year · &ldquo;Cumulative&rdquo; = ever passed by this year level
      </p>
    </div>
  );
}
