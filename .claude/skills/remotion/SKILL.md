---
name: remotion
description: Remotion framework best practices for programmatic video generation. Covers composition structure, animation timing, audio/video handling, and data-driven video creation.
version: 1.0.0
stacks:
  - Remotion
  - React
  - Node.js
---

# Remotion Video Framework Mastery

## Framework Fundamentals

Remotion enables React-based programmatic video generation. Think of it as rendering a React component frame-by-frame to video.

### Core Concepts
- **Composition**: Root React component representing a video (analogous to a canvas)
- **Frame**: Individual image rendered at 30/60 fps (configurable)
- **Render**: Process of exporting composition to video file
- **Timeline**: Absolute frame position shared across all components in a composition

### Project Setup
```bash
npx create-video@latest my-video
cd my-video
npm run dev  # Preview in browser
npm run build  # Render to MP4/PNG sequence
```

## Composition Structure & Organization

### Basic Composition
```tsx
import { Composition } from 'remotion'

export const MyVideo = () => {
  return (
    <Composition
      id="MyVideo"
      component={VideoComponent}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: 'My Video'
      }}
    />
  )
}

function VideoComponent({ title }) {
  return <div>{title}</div>
}
```

### Folder Organization
```
src/
├── Root.tsx              (Composition registry)
├── compositions/
│   ├── Intro.tsx         (Individual videos)
│   ├── MainContent.tsx
│   └── Outro.tsx
├── components/
│   ├── TextBlock.tsx
│   ├── AnimatedCounter.tsx
│   └── Chart.tsx
├── utils/
│   ├── animation.ts      (interpolation helpers)
│   └── colors.ts         (color constants)
└── data/
    └── content.json      (Video data)
```

### Reusable Component Pattern
```tsx
interface SceneProps {
  startFrame: number
  duration: number
}

export const TitleScene: React.FC<SceneProps> = ({ startFrame, duration }) => {
  const frame = useCurrentFrame()
  const isActive = frame >= startFrame && frame < startFrame + duration

  return isActive ? (
    <div>Title content</div>
  ) : null
}
```

## Animation Timing with useCurrentFrame() & interpolate()

### Getting Current Frame
```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion'

function AnimatedText() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const secondsElapsed = frame / fps

  return <div>Frame: {frame}, Seconds: {secondsElapsed.toFixed(2)}</div>
}
```

### Interpolation Function
```tsx
// Basic interpolation: map input frame range to output value range
interpolate(
  frame,           // Input value
  [0, 60],        // Input range (0-60 frames)
  [0, 100],       // Output range (0-100 units)
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
)
```

### Common Animation Patterns
```tsx
// Fade in
const opacity = interpolate(frame, [0, 30], [0, 1])

// Slide in from left
const translateX = interpolate(frame, [0, 30], [-100, 0])

// Scale up
const scale = interpolate(frame, [0, 60], [0, 1])

// Rotate
const rotate = interpolate(frame, [0, 120], [0, 360])

// Combined animation
const progress = interpolate(frame, [0, 180], [0, 1])
return (
  <div style={{
    opacity: progress,
    transform: `translateX(${progress * 100}px) scale(${0.5 + progress * 0.5})`
  }}>
    Content
  </div>
)
```

### Easing Functions
```tsx
import { interpolate, Easing } from 'remotion'

// Apply easing
interpolate(
  frame,
  [0, 60],
  [0, 100],
  {
    easing: Easing.out(Easing.cubic)
  }
)

// Available easings: linear, bezier, bounce, elastic, back, etc.
```

## Spring Animations

### Using spring() for Natural Motion
```tsx
import { spring } from 'remotion'

function BouncingBall() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spring creates bouncy, natural motion
  const springValue = spring({
    fps,
    frame,
    config: {
      damping: 10,      // 0-100, higher = faster settle
      mass: 1,          // 1-10, higher = more inertia
      overshootClamping: false,
      tension: 170,     // 0-300, higher = snappier
    }
  })

  // Scale from 0 to 1 with spring bounce
  const scale = interpolate(springValue, [0, 1], [0, 1])

  return <div style={{ transform: `scale(${scale})` }}>🎾</div>
}
```

### Spring Config Presets
- **Bouncy**: `{ tension: 170, damping: 10 }`
- **Snappy**: `{ tension: 280, damping: 40 }`
- **Molasses**: `{ tension: 70, damping: 100 }`
- **Stiff**: `{ tension: 300, damping: 35 }`

## Audio and Video Asset Handling

### Importing Audio
```tsx
import { Audio } from 'remotion'

function VideoWithAudio() {
  return (
    <>
      <Audio src={require('./bg-music.mp3')} />
      <YourContent />
    </>
  )
}
```

### Syncing Content to Audio
```tsx
import { useAudioData } from 'remotion'

function AudioReactiveContent() {
  const audioData = useAudioData('./audio.mp3')
  const frame = useCurrentFrame()

  if (!audioData) return <div>Loading...</div>

  // audioData.channelWaveData[0] gives frequency data
  const frequencyLevel = audioData.channelWaveData[0][frame] || 0
  const scale = 1 + frequencyLevel * 2

  return <div style={{ transform: `scale(${scale})` }}>🎵</div>
}
```

### Embedding Videos
```tsx
import { Video } from 'remotion'

function ScreenRecording() {
  return (
    <Video
      src={require('./demo.mp4')}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
```

## Text Animations and Typography in Video

### Basic Text Animation
```tsx
function AnimatedTitle() {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 30], [0, 1])
  const y = interpolate(frame, [0, 30], [20, 0])

  return (
    <h1 style={{
      fontSize: 72,
      fontWeight: 'bold',
      color: '#000',
      opacity,
      transform: `translateY(${y}px)`
    }}>
      Welcome to Remotion
    </h1>
  )
}
```

### Character-by-Character Animation
```tsx
function StaggeredText({ text }: { text: string }) {
  const frame = useCurrentFrame()

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {text.split('').map((char, i) => {
        const charDelay = i * 3  // 3-frame stagger
        const charOpacity = interpolate(
          frame - charDelay,
          [0, 10],
          [0, 1],
          { extrapolateLeft: 'clamp' }
        )

        return (
          <span key={i} style={{ opacity: charOpacity }}>
            {char}
          </span>
        )
      })}
    </div>
  )
}
```

### Typewriter Effect
```tsx
function TypewriterText({ text, fps }: { text: string; fps: number }) {
  const frame = useCurrentFrame()
  const charsPerSecond = 10
  const charIndex = Math.floor((frame / fps) * charsPerSecond)

  return <p>{text.substring(0, charIndex)}</p>
}
```

## Data-Driven Video Generation

### Parametrized Composition
```tsx
interface VideoProps {
  title: string
  items: Array<{ label: string; value: number }>
  colors: string[]
}

export const DataVisualization: React.FC<VideoProps> = ({
  title,
  items,
  colors
}) => {
  return (
    <div>
      <h1>{title}</h1>
      {items.map((item, i) => (
        <DataBar
          key={i}
          label={item.label}
          value={item.value}
          color={colors[i]}
        />
      ))}
    </div>
  )
}

// Render with different props
<Composition
  id="dataViz"
  component={DataVisualization}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    title: 'Q1 Results',
    items: [
      { label: 'Product A', value: 100 },
      { label: 'Product B', value: 85 }
    ],
    colors: ['#FF6B6B', '#4ECDC4']
  }}
/>
```

### Loading External Data
```tsx
function DynamicChart({ dataUrl }: { dataUrl: string }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(dataUrl)
      .then(res => res.json())
      .then(setData)
  }, [dataUrl])

  if (!data) return <LoadingScreen />

  return <ChartComponent data={data} />
}
```

## Best Practices for Frame-by-Frame Rendering

### Performance Optimization
- Avoid re-rendering heavy components every frame
- Use `useMemo` for expensive calculations
- Memoize components: `React.memo(MyComponent)`
- Lazy load assets only when needed

### Memory Management
```tsx
import { useEffect } from 'react'

function HeavyComponent() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Cleanup heavy resources
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return <div>Content</div>
}
```

### Prerendering Strategy
```tsx
// Render composition in background
npm run build -- --props '{"iteration": 1}'
npm run build -- --props '{"iteration": 2}'
```

## Performance Considerations

### Rendering Speed Factors
- Resolution: 4K takes 4x longer than 1080p
- Frame rate: 60fps takes 2x longer than 30fps
- Effects: Complex filters/shadows slow rendering
- Fonts: System fonts faster than custom fonts

### Optimize for Fast Rendering
- Use `estimatedBitrate` in config to adjust quality
- Enable multi-core rendering (default)
- Use `--concurrency` flag: `npm run build -- --concurrency 8`
- Consider PNG sequence output (faster rendering, post-process to video)

### Memory Profiling
```bash
npm run build -- --log-level verbose
```

## Export and Encoding Settings

### MP4 Export Configuration
```tsx
import { renderMedia, selectComposition } from '@remotion/renderer'

const comp = await selectComposition({
  serveUrl: 'http://localhost:3000',
  id: 'MyVideo'
})

await renderMedia({
  composition: comp,
  serveUrl: 'http://localhost:3000',
  codec: 'h264',
  outputLocation: './output.mp4',
  crf: 18  // Quality: 0-51 (lower = better, but larger file)
})
```

### Format Options
- **Codec**: h264 (universal), h265 (smaller files), prores (high-quality)
- **Audio Codec**: aac (default), mp3
- **Bitrate**: 8000k (SD), 12000k (HD), 25000k (4K)

### PNG Sequence Export
```tsx
await renderFrames({
  composition: comp,
  serveUrl: 'http://localhost:3000',
  outputDir: './frames',
  imageFormat: 'png'
})
// Manually convert with FFmpeg:
// ffmpeg -i frames/%04d.png -c:v libx264 output.mp4
```

## Integration with React Components

### Embedding Existing React
```tsx
function DashboardSnapshot({ data }) {
  return (
    <div style={{ width: 1920, height: 1080 }}>
      <YourExistingDashboard data={data} />
    </div>
  )
}

// Use in Remotion
<Composition component={DashboardSnapshot} ... />
```

### Avoiding SSR Issues
- Components render in Node.js environment
- Browser APIs unavailable (window, document, localStorage)
- Use `if (typeof window !== 'undefined')` guards

### Custom Font Integration
```tsx
import { registerFont } from '@remotion/renderer'

registerFont({
  fontFamily: 'MyFont',
  src: 'path/to/font.ttf'
})

// Use in video
<div style={{ fontFamily: 'MyFont' }}>Text</div>
```

## Production-Ready Checklist

- Composition duration matches intended video length
- All assets (images, fonts, audio) are local or cached
- Audio is synced to visuals (use frame-based timing)
- Text is readable at output resolution
- No console errors during render
- CRF value tested for quality/file-size tradeoff
- Output tested in multiple video players
- Render time acceptable (profile with `--concurrency`)
- All props properly typed and documented
- Error boundaries for data-loaded content
