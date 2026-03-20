import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { GraphPaperBg } from '../components/GraphPaperBg';

export const HumanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  const opacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const mainY = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [22, 50], [0, 1], { extrapolateRight: 'clamp' });

  const headingSize = isPortrait ? 64 : 88;
  const bodySize = isPortrait ? 36 : 48;
  const padding = isPortrait ? '0 80px' : '0 200px';

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
            opacity,
            transform: `translateY(${mainY}px)`,
          }}
        >
          {/* Accent line */}
          <div
            style={{
              width: 80,
              height: 4,
              background: 'linear-gradient(to right, #47A5F1, #BA90FF)',
              borderRadius: 2,
              margin: '0 auto 36px',
            }}
          />
          <p
            style={{
              fontSize: headingSize,
              fontWeight: 700,
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              color: '#f1f5f9',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Built by a curious dad
            <br />
            of 2 primary school kids
          </p>
        </div>

        <div
          style={{
            opacity: subOpacity,
            marginTop: 36,
          }}
        >
          <p
            style={{
              fontSize: bodySize,
              color: '#64748b',
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            An outsider project — just like the book.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
