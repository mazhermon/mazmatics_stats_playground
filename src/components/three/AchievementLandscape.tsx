'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS } from '@/lib/palette';
import { playHoverTone, playSelectChord, resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

const GROUPS_ORDER = ['Pacific Peoples', 'Māori', 'Other', 'MELAA', 'Asian', 'NZ European', 'European', 'NZ European / Pākehā'];

interface BarProps {
  x: number;
  z: number;
  height: number;
  colour: string;
  label: string;
  year: number;
  value: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  id: string;
}

function Bar({ x, z, height, colour, label, year, value, isHovered, onHover, id }: BarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = useRef(height);
  const currentHeight = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Smooth height animation
    currentHeight.current += (targetHeight.current - currentHeight.current) * Math.min(1, delta * 4);
    meshRef.current.scale.y = currentHeight.current;
    meshRef.current.position.y = currentHeight.current / 2;
  });

  useEffect(() => { targetHeight.current = height; }, [height]);

  const barColour = new THREE.Color(colour);
  if (isHovered) barColour.multiplyScalar(1.4);

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        scale={[1, 0.001, 1]}
        position={[0, height / 2, 0]}
        onPointerEnter={() => {
          resumeAudio();
          playHoverTone(value, 0.07);
          onHover(id);
        }}
        onPointerLeave={() => onHover(null)}
        onClick={() => {
          resumeAudio();
          playSelectChord(value);
        }}
      >
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial
          color={barColour}
          emissive={barColour}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {isHovered && (
        <Html position={[0, height * 5 + 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white whitespace-nowrap shadow-xl">
            <div className="text-slate-400">{label} · {year}</div>
            <div className="font-bold">{(value * 100).toFixed(1)}%</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraIntro() {
  const { camera } = useThree();
  const hasAnimated = useRef(false);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (hasAnimated.current) return;
    t.current += delta * 0.4;
    if (t.current > 1) { t.current = 1; hasAnimated.current = true; }
    const ease = 1 - Math.pow(1 - t.current, 3);
    camera.position.set(
      THREE.MathUtils.lerp(20, 12, ease),
      THREE.MathUtils.lerp(20, 10, ease),
      THREE.MathUtils.lerp(20, 15, ease),
    );
  });

  return null;
}

function Scene({ data, level }: { data: TimelineGroupPoint[]; level: number }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = data.filter((d) => d.level === level && d.value !== null);
  const years = Array.from(new Set(filtered.map((d) => d.year))).sort();
  const groups = Array.from(new Set(filtered.map((d) => d.group_label)))
    .sort((a, b) => {
      const ia = GROUPS_ORDER.findIndex((o) => a.includes(o) || o.includes(a));
      const ib = GROUPS_ORDER.findIndex((o) => b.includes(o) || o.includes(b));
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  const yearScale = (y: number) => (years.indexOf(y) - years.length / 2) * 1.1;
  const groupScale = (g: string) => (groups.indexOf(g) - groups.length / 2) * 1.1;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.3} color="#BA90FF" />
      <pointLight position={[10, 5, 10]} intensity={0.2} color="#47A5F1" />

      <CameraIntro />

      {/* Base grid plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 20, 30, 20]} />
        <meshStandardMaterial color="#0f172a" wireframe opacity={0.3} transparent />
      </mesh>

      {/* Bars */}
      {filtered.map((d) => {
        const id = `${d.group_label}-${d.year}`;
        const colour = ETHNICITY_COLOURS[d.group_label]
          ?? ETHNICITY_COLOURS[d.group_label.split(' / ')[0] ?? '']
          ?? '#8D99AE';
        return (
          <Bar
            key={id}
            id={id}
            x={yearScale(d.year)}
            z={groupScale(d.group_label)}
            height={d.value * 5}
            colour={colour}
            label={d.group_label.replace(' / Pākehā', '')}
            year={d.year}
            value={d.value}
            isHovered={hovered === id}
            onHover={setHovered}
          />
        );
      })}

      {/* Year axis labels */}
      {years.map((year) => (
        <Text
          key={year}
          position={[yearScale(year), -0.3, groups.length * 0.55 + 0.8]}
          fontSize={0.35}
          color="#64748b"
          anchorX="center"
          anchorY="top"
          font={undefined}
        >
          {year}
        </Text>
      ))}

      {/* Group axis labels */}
      {groups.map((group) => (
        <Text
          key={group}
          position={[-(years.length * 0.55 + 1), -0.3, groupScale(group)]}
          fontSize={0.3}
          color={ETHNICITY_COLOURS[group] ?? ETHNICITY_COLOURS[group.split(' / ')[0] ?? ''] ?? '#8D99AE'}
          anchorX="right"
          anchorY="middle"
        >
          {group.replace(' / Pākehā', '').replace(' Peoples', '').replace(' Region', '')}
        </Text>
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={30}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

export function AchievementLandscape() {
  const [level, setLevel] = useState(1);
  const url = '/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity';
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  const points = (data?.data ?? []) as TimelineGroupPoint[];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {[1, 2, 3].map((lvl) => (
          <button
            key={lvl}
            onClick={() => { resumeAudio(); setLevel(lvl); }}
            className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
              ${level === lvl ? 'bg-violet-500 text-white' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}
          >
            Level {lvl}
          </button>
        ))}
        <span className="text-xs text-slate-600 ml-2">Drag to rotate · scroll to zoom</span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-800" style={{ height: 420 }}>
        {loading && <div className="animate-pulse bg-slate-800 w-full h-full" />}
        {error && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            {strings.error}
          </div>
        )}
        {!loading && !error && (
          <Canvas
            camera={{ position: [12, 10, 15], fov: 50 }}
            gl={{ antialias: true }}
            style={{ background: 'linear-gradient(to bottom, #020617, #0f172a)' }}
          >
            <Suspense fallback={null}>
              <Scene data={points} level={level} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono">
        Height = achievement rate. X = year. Z = ethnicity group. {strings.dataNote}
      </p>
    </div>
  );
}
