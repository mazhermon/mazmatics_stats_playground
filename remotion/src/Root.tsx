import React from 'react';
import { Composition } from 'remotion';
import { Instagram } from './compositions/Instagram';
import { LinkedIn } from './compositions/LinkedIn';

const DURATION = 1200; // 40 seconds at 30fps
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MazmaticsInstagram"
        component={Instagram}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MazmaticsLinkedIn"
        component={LinkedIn}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
