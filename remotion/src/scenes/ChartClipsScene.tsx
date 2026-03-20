import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { ClipPlayer } from '../components/ClipPlayer';

// 720 frames total (24 seconds) — 6 clips × 120 frames each (4s per clip)
// startFrom values are source-video frame offsets (source ~25-30fps).
// Each video has 8–14s of page-load/scroll before chart interactions begin.
// We skip past that dead time to land on filter clicks and chart transitions.
const CLIP_DURATION = 120;

const CLIPS = [
  {
    // Video 8: gender filter applied to TIMSS world ranking + NMSSA equity.
    // Page loads ~3s, scroll 2s, data wait ~6s → interactions start ~11s in.
    // At ~28fps source: 11s × 28 ≈ 308 → use 300.
    src: 'videos/video-8-gender-gap.mp4',
    startFrom: 300,
    label: 'The gender gap in NZ maths',
  },
  {
    // Video 2: NMSSA equity — by ethnicity → by gender → by decile filter clicks.
    // Page loads ~2s, scroll 3s, data wait ~5s → interactions start ~10s in.
    // At ~28fps: 10s × 28 ≈ 280 → use 270.
    src: 'videos/video-2-nmssa-equity.mp4',
    startFrom: 270,
    label: 'The gap that shouldn\'t exist',
  },
  {
    // Video 4: NZQA timeline — clicking by ethnicity then by gender on line chart.
    // Page loads 8s settle, scroll 2s, data wait ~4s → interactions start ~14s in.
    // At ~28fps: 14s × 28 ≈ 392 → use 390.
    src: 'videos/video-4-nzqa-timeline.mp4',
    startFrom: 390,
    label: 'NCEA maths achievement — by ethnicity',
  },
  {
    // Video 6: fail rate timeline → by ethnicity → Māori/non filter.
    // Page loads 10s, scroll 2s, data wait ~3s → interactions start ~15s.
    // At ~28fps: 15s × 28 ≈ 420 → use 420.
    src: 'videos/video-6-fail-rate-ethnicity.mp4',
    startFrom: 420,
    label: '10 years of failing — by ethnicity',
  },
  {
    // Video 7: merit & excellence — national → by ethnicity → by equity.
    // Page loads 10s, scroll 2s, data wait ~3s, first filter click 2s → ~17s.
    // At ~28fps: 17s × 28 ≈ 476 → use 450.
    src: 'videos/video-7-merit-excellence-ethnicity.mp4',
    startFrom: 450,
    label: 'Who gets merit & excellence?',
  },
  {
    // Video 11: year 4 vs year 8 toggle, then by ethnicity filter.
    // Page loads 3s, scroll 2s, data wait ~5s → interactions start ~10s.
    // At ~28fps: 10s × 28 ≈ 280 → use 270.
    src: 'videos/video-11-year4-vs-year8.mp4',
    startFrom: 270,
    label: 'Year 4 → Year 8: what changes?',
  },
] as const;

export const ChartClipsScene: React.FC = () => {
  return (
    <AbsoluteFill>
      {CLIPS.map((clip, i) => (
        <Sequence
          key={clip.src}
          from={i * CLIP_DURATION}
          durationInFrames={CLIP_DURATION}
        >
          <ClipPlayer
            src={clip.src}
            startFrom={clip.startFrom}
            label={clip.label}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
