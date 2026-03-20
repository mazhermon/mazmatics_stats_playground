import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { GraphPaperBg } from '../components/GraphPaperBg';

export const TransitionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  const mainX = interpolate(frame, [0, 30], [120, 0], { extrapolateRight: 'clamp' });
  const mainOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [25, 55], [0, 1], { extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [25, 55], [30, 0], { extrapolateRight: 'clamp' });

  const headingSize = isPortrait ? 80 : 108;
  const bodySize = isPortrait ? 38 : 52;
  const padding = isPortrait ? '0 72px' : '0 160px';

  return (
    <AbsoluteFill>
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
        <div
          style={{
            opacity: mainOpacity,
            transform: `translateX(${mainX}px)`,
          }}
        >
          <p
            style={{
              fontSize: headingSize,
              fontWeight: 800,
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              color: '#fff',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            This site?{' '}
            <span style={{ color: '#BA90FF' }}>Something else.</span>
          </p>
        </div>

        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 36,
          }}
        >
          <p
            style={{
              fontSize: bodySize,
              color: '#94a3b8',
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            An explorer for the real data behind NZ school maths
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
