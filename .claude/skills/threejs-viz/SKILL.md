---
name: threejs-viz
description: Three.js and React Three Fiber best practices for 3D data visualization. Covers scene setup, performance optimization, interactions, and Next.js SSR considerations.
version: 1.0.0
stacks:
  - Three.js
  - React Three Fiber
  - Drei
  - Next.js
---

# Three.js & React Three Fiber for 3D Visualization

## React Three Fiber Fundamentals

React Three Fiber (R3F) brings Three.js into React with declarative syntax. Drei provides reusable helper components.

### Setup
```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

### Basic Scene Structure
```tsx
import { Canvas } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'

export function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Sphere args={[1, 32, 32]} />
    </Canvas>
  )
}
```

### Canvas Props
```tsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 75 }}
  style={{ width: '100%', height: '100vh' }}
  dpr={[1, 2]}                          // Device pixel ratio
  performance={{ min: 0.5, max: 1 }}   // Dynamic resolution
  shadows                                // Enable shadow rendering
  gl={{ antialias: true, alpha: true }}  // WebGL config
>
  {/* Scene */}
</Canvas>
```

## 3D Data Visualization Techniques

### Point Cloud Visualization
```tsx
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function PointCloud({ data }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(data.length * 3)

    data.forEach((point, i) => {
      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    })

    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [data])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        color={'#3b82f6'}
        transparent
        opacity={0.8}
      />
    </points>
  )
}
```

### Line Chart in 3D
```tsx
function LineChart3D({ dataPoints }) {
  const geometry = useMemo(() => {
    const points = dataPoints.map((d, i) => new THREE.Vector3(i, d, 0))
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [dataPoints])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#3b82f6" linewidth={2} />
    </line>
  )
}
```

### Bar Chart in 3D
```tsx
function BarChart3D({ data }) {
  return (
    <group>
      {data.map((item, i) => (
        <mesh key={i} position={[i * 2, item.value / 2, 0]}>
          <boxGeometry args={[1.5, item.value, 1]} />
          <meshStandardMaterial color={item.color} />
        </mesh>
      ))}
    </group>
  )
}
```

### Heat Map Visualization
```tsx
function HeatMap({ gridData }) {
  const { geometry, material } = useMemo(() => {
    const g = new THREE.PlaneGeometry(10, 10, gridData[0].length, gridData.length)
    const positions = g.attributes.position

    for (let i = 0; i < positions.count; i++) {
      const x = Math.floor(i / gridData[0].length)
      const y = i % gridData[0].length
      positions.setZ(i, gridData[x][y])
    }

    const colorMap = new THREE.DataTexture(
      new Uint8Array(256 * 4),
      256, 1,
      THREE.RGBAFormat
    )

    const material = new THREE.MeshPhongMaterial({
      wireframe: false,
      map: colorMap
    })

    return { geometry: g, material }
  }, [gridData])

  return <mesh geometry={geometry} material={material} />
}
```

## Camera Controls and Navigation

### Orbit Controls
```tsx
import { OrbitControls } from '@react-three/drei'

function Scene() {
  return (
    <Canvas>
      <OrbitControls
        autoRotate
        autoRotateSpeed={4}
        enableZoom={true}
        enablePan={true}
      />
      {/* Scene content */}
    </Canvas>
  )
}
```

### Custom Camera Control
```tsx
function CustomCamera() {
  const cameraRef = useRef(null)

  useFrame(({ mouse }) => {
    if (cameraRef.current) {
      cameraRef.current.position.x = mouse.x * 5
      cameraRef.current.position.y = mouse.y * 5
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return <perspectiveCamera ref={cameraRef} position={[0, 0, 5]} />
}
```

### Fixed Viewpoint
```tsx
<Canvas camera={{ position: [10, 10, 10], lookAt: [0, 0, 0] }}>
  {/* Scene - camera doesn't move */}
</Canvas>
```

## Lighting for Data Visualization

### Three-Point Lighting Setup
```tsx
function Lights() {
  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill light */}
      <pointLight position={[-10, -10, 5]} intensity={0.5} />

      {/* Back light */}
      <pointLight position={[0, 0, 10]} intensity={0.3} color="#ff8800" />

      {/* Ambient light */}
      <ambientLight intensity={0.4} />
    </>
  )
}
```

### Shadow Configuration
```tsx
<Canvas shadows shadowMap={{ type: THREE.PCFShadowShadowMap }}>
  <directionalLight castShadow shadow-camera-far={50} />
  <mesh castShadow receiveShadow>
    {/* Geometry */}
  </mesh>
</Canvas>
```

### Responsive Lighting
```tsx
function AdaptiveLight() {
  const light = useRef(null)

  useFrame(({ clock }) => {
    if (light.current) {
      light.current.position.x = Math.sin(clock.elapsedTime) * 10
      light.current.position.z = Math.cos(clock.elapsedTime) * 10
    }
  })

  return <directionalLight ref={light} intensity={1} castShadow />
}
```

## Performance Optimization

### Instancing for Large Datasets
```tsx
import { InstancedMesh } from 'three'

function InstancedPoints({ data }) {
  const meshRef = useRef(null)
  const tempObject = new THREE.Object3D()
  const tempColor = new THREE.Color()

  useEffect(() => {
    if (!meshRef.current) return

    data.forEach((item, i) => {
      tempObject.position.set(item.x, item.y, item.z)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
      meshRef.current.setColorAt(i, new THREE.Color(item.color))
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [data])

  return (
    <instancedMesh ref={meshRef} args={[null, null, data.length]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshPhongMaterial />
    </instancedMesh>
  )
}
```

### LOD (Level of Detail)
```tsx
import { LOD } from 'three'

function OptimizedMesh() {
  const lodRef = useRef(null)

  useEffect(() => {
    const lod = new LOD()

    // High detail version
    const high = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 5),
      new THREE.MeshPhongMaterial()
    )
    lod.addLevel(high, 0)

    // Medium detail
    const medium = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 3),
      new THREE.MeshPhongMaterial()
    )
    lod.addLevel(medium, 20)

    // Low detail
    const low = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.MeshPhongMaterial()
    )
    lod.addLevel(low, 50)

    lodRef.current.add(lod)
  }, [])

  return <group ref={lodRef} />
}
```

### Frustum Culling
Automatically handled by Three.js. Ensure `frustumCulled={true}` on meshes (default).

### Performance Monitoring
```tsx
import { Stats } from '@react-three/drei'

<Canvas>
  <Stats />
  {/* Scene */}
</Canvas>
```

## Responsive 3D Canvas

### Container-Based Scaling
```tsx
function ResponsiveScene() {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Scene */}
      </Canvas>
    </div>
  )
}
```

## Post-Processing Effects

### Bloom Effect
```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

function SceneWithBloom() {
  return (
    <Canvas>
      <EffectComposer>
        <Bloom intensity={2} mipmapBlur radius={0.7} />
      </EffectComposer>
      {/* Scene */}
    </Canvas>
  )
}
```

### SSAO (Ambient Occlusion)
```tsx
import { SSAO } from '@react-three/postprocessing'

<EffectComposer>
  <SSAO
    radius={0.5}
    intensity={15}
    bias={0.5}
  />
</EffectComposer>
```

### Depth of Field
```tsx
import { DepthOfField } from '@react-three/postprocessing'

<EffectComposer>
  <DepthOfField
    focusDistance={0}
    focalLength={0.02}
    bokehScale={2}
  />
</EffectComposer>
```

## Loading 3D Models and Geometries

### GLTF Model Loading
```tsx
import { useGLTF } from '@react-three/drei'

function Model() {
  const { scene } = useGLTF('/model.glb')
  return <primitive object={scene} />
}

// Preload models
useGLTF.preload('/model.glb')
```

### Procedural Geometries
```tsx
function ProcGeometry() {
  const geometry = new THREE.IcosahedronGeometry(1, 4)
  const material = new THREE.MeshPhongMaterial({ color: '#3b82f6' })

  return <mesh geometry={geometry} material={material} />
}
```

## Shader Basics for Data Visualization

### Vertex Shader for Animation
```glsl
uniform float time;

void main() {
  vec3 pos = position;
  pos.z += sin(position.x * 3.14 + time) * 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Custom Shader Material
```tsx
const vertexShader = `
  uniform float time;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vec3 pos = position;
    pos.y += sin(position.x * 10.0 + time) * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  varying vec3 vPosition;

  void main() {
    gl_FragColor = vec4(vPosition * 0.5 + 0.5, 1.0);
  }
`

function ShaderMesh() {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { time: { value: 0 } }
  })

  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.elapsedTime
  })

  return (
    <mesh material={material}>
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  )
}
```

## Next.js SSR Considerations

### Dynamic Import (No SSR)
```tsx
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

export default function Page() {
  return <Scene />
}
```

### Client Component
```tsx
'use client'

import { Canvas } from '@react-three/fiber'

export default function Scene() {
  return (
    <Canvas>
      {/* Scene content */}
    </Canvas>
  )
}
```

### Avoiding window/document References
```tsx
'use client'

import { useEffect, useState } from 'react'

export function ClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return <Canvas>{/* Scene */}</Canvas>
}
```

## Interaction Patterns

### Mouse Tracking
```tsx
function MouseTracker() {
  const mesh = useRef(null)

  useFrame(({ mouse }) => {
    mesh.current.rotation.y = mouse.x * Math.PI
    mesh.current.rotation.x = mouse.y * Math.PI
  })

  return (
    <mesh ref={mesh}>
      <boxGeometry />
      <meshPhongMaterial />
    </mesh>
  )
}
```

### Click Detection
```tsx
function Clickable() {
  const mesh = useRef(null)

  return (
    <mesh
      ref={mesh}
      onClick={(e) => console.log('Clicked:', e)}
      onPointerOver={(e) => (e.object.scale.set(1.2, 1.2, 1.2))}
      onPointerOut={(e) => (e.object.scale.set(1, 1, 1))}
    >
      <boxGeometry />
      <meshPhongMaterial />
    </mesh>
  )
}
```

## Production-Ready Checklist

- Performance < 60fps on target devices (use Stats)
- Shadows optimized (not on all meshes)
- Models loaded lazily or preloaded
- Responsive to window resize
- Mobile touch interactions supported
- Accessibility: not critical for primary UX
- Error handling for model loading failures
- Canvas cleanup on component unmount
- Lighting balanced and purposeful
- No memory leaks from animations
- Scene tested on low-end devices
- Canvas not blocking page interaction
