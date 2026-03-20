import React from 'react';
import { AbsoluteFill, Video, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GraphPaperBg } from './GraphPaperBg';

interface ClipPlayerProps {
  src: string;
  startFrom?: number;
  label: string;
}

export const ClipPlayer: React.FC<ClipPlayerProps> = ({ src, startFrom = 0, label }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Padding around the video card so the graph paper background is visible
  const paddingH = isPortrait ? 48 : 120;
  const paddingTop = isPortrait ? 100 : 60;
  const paddingBottom = isPortrait ? 160 : 100;
  const labelSize = isPortrait ? 24 : 28;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <GraphPaperBg />
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop,
          paddingBottom,
          paddingLeft: paddingH,
          paddingRight: paddingH,
          gap: 32,
        }}
      >
        {/* Video card — objectFit:contain shows the full recording */}
        <div
          style={{
            flex: 1,
            width: '100%',
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(186,144,255,0.25), 0 4px 40px rgba(0,0,0,0.6)',
            border: '1.5px solid rgba(186,144,255,0.3)',
          }}
        >
          <Video
            src={staticFile(src)}
            startFrom={startFrom}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#0a1628',
            }}
          />
        </div>

        {/* Label below the card */}
        <div
          style={{
            fontFamily: '"Geist Mono", "Courier New", monospace',
            fontSize: labelSize,
            fontWeight: 500,
            color: '#BA90FF',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
