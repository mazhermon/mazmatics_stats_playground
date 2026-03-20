import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { GradientText } from '../components/GradientText';
import { GraphPaperBg } from '../components/GraphPaperBg';

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 28], [60, 0], { extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [12, 40], [60, 0], { extrapolateRight: 'clamp' });
  const wordmarkOpacity = interpolate(frame, [45, 72], [0, 1], { extrapolateRight: 'clamp' });

  const titleSize = isPortrait ? 104 : 128;
  const subtitleSize = isPortrait ? 38 : 52;
  const wordmarkSize = isPortrait ? 56 : 68;
  const padding = isPortrait ? '0 72px' : '0 160px';

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <GraphPaperBg />
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: `translateY(${titleY}px)` }}>
          <GradientText
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              lineHeight: 1.05,
            }}
          >
            NZ Stats Explorer
          </GradientText>
        </div>

        <div
          style={{
            transform: `translateY(${subtitleY}px)`,
            marginTop: 28,
          }}
        >
          <p
            style={{
              fontSize: subtitleSize,
              color: '#f1f5f9',
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Interactive NZ school maths data
          </p>
        </div>

        <div
          style={{
            marginTop: 80,
            opacity: wordmarkOpacity,
            fontFamily: '"Bungee Shade", cursive',
            fontSize: wordmarkSize,
            color: '#BA90FF',
            letterSpacing: '0.02em',
          }}
        >
          MAZMATICS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
