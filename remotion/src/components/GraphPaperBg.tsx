import React from 'react';
import { AbsoluteFill } from 'remotion';

export const GraphPaperBg: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="smallGrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(186,144,255,0.05)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="largeGrid"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <rect width="200" height="200" fill="url(#smallGrid)" />
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke="rgba(71,165,241,0.07)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#largeGrid)" />
      </svg>
    </AbsoluteFill>
  );
};
