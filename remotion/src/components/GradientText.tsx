import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({ children, style }) => {
  return (
    <span
      style={{
        background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
