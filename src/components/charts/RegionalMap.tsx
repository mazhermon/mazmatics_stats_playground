'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

interface RegionProperties {
  REGC_name: string;
  REGC_code: string;
  [key: string]: unknown;
}
import { useNzqaData, type SubjectResponse } from '@/lib/hooks/useNzqaData';
import { LEVEL_COLOURS, choroplethColour, fmtRate } from '@/lib/palette';
import { playSelectChord, playHoverTone, resumeAudio } from '@/lib/audio';

interface RegionStat {
  region: string;
  achieved_rate: number | null;
}

interface DrilldownData {
  region: string;
  byLevel: Array<{ level: number; achieved_rate: number | null }>;
}

// Map NZQA region names → TopoJSON REGC_name (strip " Region" suffix, handle macrons)
const NZQA_TO_TOPOJSON: Record<string, string> = {
  'Auckland': 'Auckland Region',
  'Bay of Plenty': 'Bay of Plenty Region',
  'Canterbury': 'Canterbury Region',
  'Gisborne': 'Gisborne Region',
  "Hawke's Bay": "Hawke's Bay Region",
  'Manawatu-Whanganui': 'Manawatū-Whanganui Region',
  'Marlborough': 'Marlborough Region',
  'Nelson': 'Nelson Region',
  'Northland': 'Northland Region',
  'Otago': 'Otago Region',
  'Southland': 'Southland Region',
  'Taranaki': 'Taranaki Region',
  'Tasman': 'Tasman Region',
  'Waikato': 'Waikato Region',
  'Wellington': 'Wellington Region',
  'West Coast': 'West Coast Region',
};

export function RegionalMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [topo, setTopo] = useState<Topology | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [drilldown, setDrilldown] = useState<DrilldownData | null>(null);
  const [level, setLevel] = useState(1);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; region: string; rate: number | null; visible: boolean }>({
    x: 0, y: 0, region: '', rate: null, visible: false,
  });

  // Fetch TopoJSON
  useEffect(() => {
    fetch('/geo/nz-regions.topojson')
      .then((r) => r.json())
      .then((t: Topology) => setTopo(t))
      .catch(() => {/* non-fatal */});
  }, []);

  // Fetch regional subject data
  const { data: subjectData } = useNzqaData<SubjectResponse>(
    `/api/nzqa/subjects?level=${level}&year=2024&region=null&ethnicity=null&gender=null&equityGroup=null`
  );

  // Fetch drilldown data when a region is selected — all 3 levels, no dimension filters
  const { data: drilldownRaw } = useNzqaData<SubjectResponse>(
    selected ? `/api/nzqa/subjects?year=2024&region=${encodeURIComponent(selected)}&ethnicity=null&gender=null&equityGroup=null` : null
  );

  useEffect(() => {
    if (!drilldownRaw || !selected) { setDrilldown(null); return; }
    const byLevel = drilldownRaw.data
      .filter((r) => r.level !== null)
      .map((r) => ({ level: r.level!, achieved_rate: r.achieved_rate }))
      .sort((a, b) => a.level - b.level);
    setDrilldown({ region: selected, byLevel });
  }, [drilldownRaw, selected]);

  // Build region → rate lookup from API data
  const regionRates = useMemo(() => {
    const map = new Map<string, number | null>();
    if (subjectData) {
      for (const row of subjectData.data) {
        if (row.region && row.achieved_rate !== null) {
          map.set(row.region, row.achieved_rate);
        }
      }
    }
    return map;
  }, [subjectData]);

  const drawMap = useCallback(() => {
    if (!topo || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const W = Math.min(container.clientWidth || 600, 600);
    const H = W * 1.5; // NZ is taller than wide

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    const geojson = feature(topo, topo.objects.regions as never) as unknown as GeoJSON.FeatureCollection<GeoJSON.MultiPolygon, RegionProperties>;

    const projection = d3.geoMercator()
      .fitSize([W, H], geojson);
    const pathGen = d3.geoPath().projection(projection);

    let g = svg.select<SVGGElement>('g.map-body');
    if (g.empty()) g = svg.append('g').attr('class', 'map-body');

    g.selectAll<SVGPathElement, (typeof geojson.features)[0]>('.region')
      .data(geojson.features, (d) => d.properties?.REGC_name ?? '')
      .join(
        (enter) => enter.append('path')
          .attr('class', 'region')
          .attr('opacity', 0)
          .call((p) => p.transition().duration(800).ease(d3.easeCubicOut).attr('opacity', 1)),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('d', pathGen)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .transition()
      .duration(400)
      .attr('fill', (d) => {
        const topoName = d.properties?.REGC_name;
        // Find NZQA name from topo name
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        const rate = nzqaName ? regionRates.get(nzqaName) ?? null : null;
        return choroplethColour(rate);
      })
      .attr('stroke', (d) => {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        return selected && nzqaName === selected ? '#BA90FF' : '#0f172a';
      })
      .attr('stroke-width', (d) => {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        return selected && nzqaName === selected ? 2 : 0.5;
      });

    // Re-attach event handlers (after join, not inside transition)
    g.selectAll<SVGPathElement, (typeof geojson.features)[0]>('.region')
      .on('mouseenter', function (event: MouseEvent, d) {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        const rate = nzqaName ? regionRates.get(nzqaName) ?? null : null;
        if (rate !== null) { resumeAudio(); playHoverTone(rate, 0.07); }

        d3.select(this).attr('stroke', '#BA90FF').attr('stroke-width', 1.5);

        const rect = container.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, region: nzqaName ?? topoName ?? '', rate, visible: true });
      })
      .on('mouseleave', function (_, d) {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        d3.select(this)
          .attr('stroke', selected && nzqaName === selected ? '#BA90FF' : '#0f172a')
          .attr('stroke-width', selected && nzqaName === selected ? 2 : 0.5);
        setTooltip((prev) => ({ ...prev, visible: false }));
      })
      .on('click', function (_, d) {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        if (!nzqaName) return;
        resumeAudio();
        const rate = regionRates.get(nzqaName) ?? 0.5;
        playSelectChord(rate);
        setSelected((s) => s === nzqaName ? null : nzqaName);
      });

  }, [topo, regionRates, selected]);

  useEffect(() => { drawMap(); }, [drawMap]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Map */}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((lvl) => (
            <button key={lvl} onClick={() => { resumeAudio(); setLevel(lvl); setSelected(null); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${level === lvl ? 'bg-violet-500 text-white' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
              Level {lvl}
            </button>
          ))}
        </div>
        <div ref={containerRef} className="relative">
          {!topo && <div className="animate-pulse bg-slate-800 rounded-lg w-full" style={{ height: 500 }} />}
          {topo && (
            <svg ref={svgRef} className="w-full max-w-sm mx-auto block" />
          )}
          {tooltip.visible && (
            <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
              style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
              <span className="text-slate-400">{tooltip.region}</span>
              <br />
              <span className="text-white font-semibold">
                {tooltip.rate !== null ? `${fmtRate(tooltip.rate)} achieved` : 'No data'}
              </span>
            </div>
          )}
        </div>

        {/* Choropleth legend */}
        <div className="flex items-center gap-2 mt-3 justify-center">
          <span className="text-xs text-slate-500 font-mono">Low</span>
          {['#1a1a2e','#0f3460','#533483','#8C5FD5','#BA90FF','#d4bbff'].map((c) => (
            <div key={c} className="w-6 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-xs text-slate-500 font-mono">High</span>
        </div>
      </div>

      {/* Drilldown panel */}
      <div className="w-full lg:w-72 shrink-0">
        {selected && drilldown ? (
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100">{selected}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer">
                Clear
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-mono">Achievement by level · 2024</p>
            <div className="space-y-3">
              {drilldown.byLevel.map(({ level: lvl, achieved_rate }) => (
                <div key={lvl}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">NCEA Level {lvl}</span>
                    <span className="font-mono text-slate-400">{fmtRate(achieved_rate)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: achieved_rate !== null ? `${achieved_rate * 100}%` : '0%',
                        background: LEVEL_COLOURS[lvl] ?? '#BA90FF',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 border-dashed flex items-center justify-center h-full min-h-[200px]">
            <p className="text-slate-600 text-sm text-center">
              Click a region on the map to see achievement by NCEA level
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
