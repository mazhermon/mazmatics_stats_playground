// Extend React JSX namespace to include React Three Fiber elements
import type { ThreeElements } from '@react-three/fiber/dist/declarations/src/three-types';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
