import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  // 90 frames total for CTA
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const contentY = interpolate(frame, [0, 25], [50, 0], { extrapolateRight: 'clamp' });
  const contentOpacity = interpolate(frame, [8, 30], [0, 1], { extrapolateRight: 'clamp' });
  // Fade to black at the end
  const fadeOut = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headingSize = isPortrait ? 96 : 128;
  const urlSize = isPortrait ? 56 : 80;
  const wordmarkSize = isPortrait ? 48 : 60;

  return (
    <AbsoluteFill>
      {/* Dark background */}
      <AbsoluteFill style={{ background: '#0f172a' }} />

      {/* Yellow accent — fills from top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#FFF73E',
          opacity: bgOpacity,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: isPortrait ? '0 72px' : '0 160px',
          opacity: contentOpacity,
          transform: `translateY(${contentY}px)`,
        }}
      >
        <p
          style={{
            fontSize: headingSize,
            fontWeight: 800,
            fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Explore the data
        </p>

        <p
          style={{
            fontSize: urlSize,
            fontWeight: 700,
            fontFamily: '"Geist Mono", "Courier New", monospace',
            color: '#3A3A39',
            margin: '28px 0 0',
            letterSpacing: '0.02em',
          }}
        >
          mazmatics.com
        </p>

        <div
          style={{
            marginTop: 56,
            fontFamily: '"Bungee Shade", cursive',
            fontSize: wordmarkSize,
            color: '#8C5FD5',
            letterSpacing: '0.02em',
          }}
        >
          MAZMATICS
        </div>
      </AbsoluteFill>

      {/* Fade to black */}
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: fadeOut,
        }}
      />
    </AbsoluteFill>
  );
};
