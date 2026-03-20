import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { TitleScene } from '../scenes/TitleScene';
import { BookScene } from '../scenes/BookScene';
import { TransitionScene } from '../scenes/TransitionScene';
import { ChartClipsScene } from '../scenes/ChartClipsScene';
import { HumanScene } from '../scenes/HumanScene';
import { CTAScene } from '../scenes/CTAScene';

// Scene timing (total: 1200 frames = 40s at 30fps)
// Scene 1: Title Hook       0–90     (3s)
// Scene 2: The Book         90–180   (3s)
// Scene 3: But This...      180–270  (3s)
// Scene 4: Chart Clips      270–990  (24s — 6 clips × 4s)
// Scene 5: The Human        990–1110 (4s)
// Scene 6: CTA              1110–1200 (3s)

export const Instagram: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <TitleScene />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <BookScene />
      </Sequence>
      <Sequence from={180} durationInFrames={90}>
        <TransitionScene />
      </Sequence>
      <Sequence from={270} durationInFrames={720}>
        <ChartClipsScene />
      </Sequence>
      <Sequence from={990} durationInFrames={120}>
        <HumanScene />
      </Sequence>
      <Sequence from={1110} durationInFrames={90}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
