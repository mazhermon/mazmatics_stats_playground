import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { GraphPaperBg } from '../components/GraphPaperBg';

export const BookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  const cardY = interpolate(frame, [0, 28], [80, 0], { extrapolateRight: 'clamp' });
  const cardOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });
  const subtextOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' });

  const headingSize = isPortrait ? 72 : 96;
  const bodySize = isPortrait ? 36 : 48;
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
        }}
      >
        {/* Card with offset shadow */}
        <div
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
            background: 'rgba(186,144,255,0.08)',
            border: '1.5px solid rgba(186,144,255,0.25)',
            borderRadius: 24,
            padding: isPortrait ? '60px 56px' : '56px 72px',
            textAlign: 'center',
            boxShadow: '#BA90FF 8px 8px 0px, #47A5F1 -8px -8px 0px',
            maxWidth: isPortrait ? 900 : 1400,
          }}
        >
          <p
            style={{
              fontSize: headingSize,
              fontWeight: 700,
              fontFamily: '"Geist", "Helvetica Neue", Arial, sans-serif',
              color: '#fff',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Mazmatics is a kids maths book
          </p>
        </div>

        <div
          style={{
            opacity: subtextOpacity,
            marginTop: 40,
            textAlign: 'center',
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
            Fun Maths for Kids — designed for home play, not homework
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
