---
name: remotion
description: Remotion framework best practices for programmatic video generation. Covers composition structure, animation timing, audio/video handling, data-driven video creation, and assembling promo videos from Playwright screen recordings (startFrom timing, objectFit, clip selection).
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

---

## Assembling Promo Videos from Playwright Screen Recordings

This section documents hard-won lessons from building the Mazmatics social video (March 2026).
The pattern: embed Playwright-recorded MP4 clips of an interactive app into a Remotion promo video.

### Project Setup: Isolated Remotion Package

Keep Remotion in its own `remotion/` subdirectory with its own `package.json` and `node_modules`.
Do NOT install Remotion into the root Next.js project — it will conflict.

```
project-root/
├── package.json          ← add remotion:preview / remotion:render:* convenience scripts here
├── remotion/
│   ├── package.json      ← remotion deps live here
│   ├── remotion.config.ts
│   ├── tsconfig.json
│   └── src/
└── e2e/social-videos/
    ├── landscape/        ← Playwright-recorded source clips (MP4)
    └── remotion/         ← rendered output goes here
```

Root `package.json` convenience scripts:
```json
"remotion:preview": "cd remotion && npx remotion preview src/index.ts",
"remotion:render:instagram": "cd remotion && npx remotion render src/index.ts MazmaticsInstagram --output ../e2e/social-videos/remotion/mazmatics-instagram.mp4"
```

### Serving Source Videos via publicDir + Symlink

Remotion's `staticFile()` serves files from `./public/` by default. The landscape clips live
in `e2e/social-videos/landscape/` — avoid copying large MP4s. Instead, symlink:

```bash
# Run once from the project root:
ln -sf ../../e2e/social-videos/landscape remotion/public/videos
# Note the relative path is from remotion/public/, not the project root — get this right.
# remotion/public/ → ../../ → project root → e2e/social-videos/landscape ✓
```

`remotion.config.ts`:
```ts
import { Config } from "@remotion/cli/config";
Config.setPublicDir("./public");
```

Then in components:
```tsx
import { staticFile } from 'remotion';
<Video src={staticFile('videos/video-4-nzqa-timeline.mp4')} startFrom={390} />
```

### CRITICAL: startFrom Values — Skip Past Page Load Dead Time

**The biggest mistake when embedding screen recordings: using small `startFrom` values.**

Playwright recordings always start with dead time: page load, navigation, scrolling, waiting
for charts to render. The interesting content (filter clicks, chart animations, data changing)
doesn't begin until 8–17 seconds into each recording.

**Wrong:** `startFrom={45}` (1.5s in — still loading)
**Right:** `startFrom={390}` (13s in — filter interactions underway)

#### How to calculate startFrom

1. **Read the recording script** (e.g. `scripts/record-social-videos-landscape.ts`)
2. **Add up the dead time** for each video:
   - `goToAndWait()` settle time (e.g. 8000ms for NZQA pages, 3000ms for primary)
   - `smoothScrollTo()` + wait (typically 2000–3000ms per scroll)
   - `waitForSvgData()` / `waitForButtonText()` (typically 3–8s in practice)
   - Any `waitForTimeout()` before the first filter click
3. **Multiply by source fps (~28fps)** — Playwright webm recordings are ~25–30fps variable,
   converted to MP4 by ffmpeg. Use 28 as a safe estimate.

```
startFrom = (load_settle_s + scroll_s + data_wait_s) × 28
```

**Reference timings for this project's recordings (at ~28fps):**

| Video | Dead time | startFrom |
|---|---|---|
| primary-maths pages (3s settle) | ~10–12s | 270–330 |
| nzqa-maths pages (8–10s settle) | ~13–17s | 360–480 |
| video-2 nmssa-equity | ~10s | 270 |
| video-4 nzqa-timeline | ~14s | 390 |
| video-6 fail-rate-ethnicity | ~15s | 420 |
| video-7 merit-excellence | ~17s | 450 |
| video-8 gender-gap | ~11s | 300 |
| video-11 year4-vs-year8 | ~10s | 270 |

If the clip still shows a blank/loading page, increase `startFrom` by 60–90 (2–3s).

### Clip Duration: 4s (120 frames) is the Minimum for Filter Interactions

3 seconds (90 frames) is not enough time to see:
- A filter button clicked
- The chart transition animation
- The new data settled

**Use 4s (120 frames) per clip** when showing filter/toggle interactions.
Use 3s (90 frames) only for static or slowly-changing visuals (maps, 3D scene).

### objectFit: contain, Not cover

Source recordings are 1024×768 (4:3). The Remotion canvas is either 1080×1920 (portrait)
or 1920×1080 (landscape). These aspect ratios don't match.

**Wrong:** `objectFit: 'cover'` — crops heavily, makes chart content illegible.
**Right:** `objectFit: 'contain'` inside a padded card — shows the full recording.

```tsx
// ClipPlayer pattern that works
<AbsoluteFill>
  <GraphPaperBg />  {/* branded background shows around the card */}
  <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: isPortrait ? '100px 48px 160px' : '60px 120px 100px', flexDirection: 'column', gap: 32 }}>
    <div style={{ flex: 1, width: '100%', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 0 80px rgba(186,144,255,0.25)', border: '1.5px solid rgba(186,144,255,0.3)' }}>
      <Video src={staticFile(src)} startFrom={startFrom}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a1628' }} />
    </div>
    <div style={{ fontFamily: '"Geist Mono"', color: '#BA90FF', textTransform: 'uppercase' }}>
      {label}
    </div>
  </AbsoluteFill>
</AbsoluteFill>
```

### Clip Selection: Prioritise Filter Interactions Over Visual Spectacle

When the goal is showing an interactive data app:

**Good clips** — filter toggles that change line graphs:
- Videos where `clickFilterBtn(by ethnicity/gender/decile)` is called in the recording script
- These produce clear before/after chart transitions that read well at small size

**Less useful clips** (unless the 3D/map IS the point):
- 3D scene rotation (video-10) — looks cool but shows no data insight
- Regional map hovering (video-5) — very subtle, hard to read scaled down
- Comparison heatmap (video-15) — needs high `startFrom` to skip past load

**Best clips for filter interaction demos (this project):**

| Video | What it shows | Why it works |
|---|---|---|
| video-8-gender-gap | gender filter on TIMSS + NMSSA | Immediate, visible line change |
| video-2-nmssa-equity | ethnicity → gender → decile | 3 clear filter switches |
| video-4-nzqa-timeline | by ethnicity → by gender | Multi-line chart reconfigures |
| video-6-fail-rate-ethnicity | fail rate, Māori/non filter | Bold gap visible at small size |
| video-7-merit-excellence | national → ethnicity → equity | Shows multiple breakdowns |
| video-11-year4-vs-year8 | year 4/8 toggle + ethnicity | Simple toggle, clear change |

### Iterative Rendering: Use Versioned Output Filenames

Never overwrite the previous render while iterating. Use a version suffix:

```
mazmatics-instagram-v1.mp4  ← original
mazmatics-instagram-v2.mp4  ← objectFit fix
mazmatics-instagram-v3.mp4  ← more clips
mazmatics-instagram-v4.mp4  ← correct startFrom timing ← KEEPER
```

This lets you compare versions and roll back without re-rendering.

### Scene Timing Template (Mazmatics Promo)

```
Scene 1: Title hook        0–90    (3s)
Scene 2: Context/story     90–180  (3s)
Scene 3: Pivot/tension     180–270 (3s)
Scene 4: Chart clips       270–990 (24s — 6 clips × 120 frames)
Scene 5: Human/personal    990–1110 (4s)
Scene 6: CTA               1110–1200 (3s)
Total: 1200 frames = 40s @ 30fps
```

Adjust chart section length by changing `CLIP_DURATION` and number of clips.
Update `durationInFrames` in `Root.tsx`, both composition files, and the chart Sequence.
