---
name: nextjs-ssr
description: Next.js App Router architecture and SSR patterns. Covers layouts, server/client components, data fetching, streaming, route handlers, middleware, and deployment considerations.
version: 1.0.0
stacks:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
---

# Next.js App Router and SSR Mastery

## App Router Architecture Fundamentals

The App Router (introduced in Next.js 13) uses file-system routing with special files to define behavior.

### Directory Structure
```
app/
├── layout.tsx          # Root layout (HTML shell, providers)
├── page.tsx            # Home page
├── not-found.tsx       # 404 page
├── error.tsx           # Error boundary
├── loading.tsx         # Suspense fallback (optional)
├── (auth)/
│   ├── layout.tsx      # Auth layout group
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx    # Dynamic route
│   └── [...slug]/
│       └── page.tsx    # Catch-all route
└── api/
    └── users/
        ├── route.ts    # API endpoint
        └── [id]/
            └── route.ts
```

### Layout Hierarchy
```tsx
// app/layout.tsx (Root layout)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx (Nested layout)
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

### Route Groups (No URL Impact)
```
app/
├── (marketing)/
│   ├── layout.tsx      # Marketing layout
│   ├── page.tsx        # / (home)
│   ├── about/page.tsx  # /about
│   └── blog/page.tsx   # /blog
└── (app)/
    ├── layout.tsx      # App layout (sidebar, auth required)
    └── dashboard/page.tsx  # /dashboard
```

## Server Components vs Client Components

### Default: Server Components
```tsx
// app/dashboard/page.tsx (Server Component)
// Runs ONLY on server, can access databases directly

import { db } from '@/lib/db'

export default async function Dashboard() {
  const users = await db.query('SELECT * FROM users')

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### Client Components (with 'use client')
```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Decision Tree

**Use Server Components when:**
- Fetching data (databases, APIs, secrets safe)
- Accessing sensitive credentials
- Using heavy dependencies (reduce JS bundle)
- Rendering markdown/MDX

**Use Client Components when:**
- Using React hooks (useState, useEffect)
- Handling user interactions (onClick, onChange)
- Using browser APIs (window, localStorage)
- Real-time subscriptions or websockets

### Composition Pattern
```tsx
// app/dashboard/page.tsx (Server)
import { Analytics } from './analytics'  // Can be server or client
import { Controls } from './controls'

export default async function Dashboard() {
  const data = await fetchData()

  return (
    <>
      <Analytics data={data} />
      <Controls />  // Client component
    </>
  )
}

// app/dashboard/controls.tsx (Client)
'use client'

import { useState } from 'react'

export function Controls() {
  const [filter, setFilter] = useState('')
  // Interactive logic
}
```

## Data Fetching Patterns

### Server-Side Fetch with Caching
```tsx
// app/posts/page.tsx (Server Component)
async function getPosts() {
  // Cache indefinitely (ISR with revalidateTag)
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }  // Revalidate every hour
  })
  return res.json()
}

// Or with cache control
const res = await fetch(url, {
  next: { revalidate: false }  // Cache forever (ISR only)
})
```

### Server Actions (Form Submissions)
```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // Validate
  if (!title || !content) {
    throw new Error('Title and content required')
  }

  // Save to database
  const post = await db.posts.create({ title, content })

  // Revalidate cache
  revalidatePath('/posts')
  revalidatePath('/posts/[id]', 'page')

  return post
}

// app/posts/new/page.tsx (Client)
'use client'

import { createPost } from '@/app/actions'

export default function NewPost() {
  async function handleSubmit(formData: FormData) {
    const result = await createPost(formData)
    console.log('Post created:', result)
  }

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

### Data Fetching in Server Components
```tsx
export const revalidate = 60  // Revalidate every 60 seconds (ISR)

export default async function Page() {
  // Fetch at request time or use cache
  const data = await fetch('https://api.example.com/data', {
    next: { tags: ['posts'] }  // Tag for manual revalidation
  }).then(r => r.json())

  return <div>{/* Render data */}</div>
}
```

### Manual Revalidation
```tsx
// app/admin/revalidate/route.ts (Route Handler)
import { revalidateTag } from 'next/cache'

export async function POST() {
  revalidateTag('posts')
  return Response.json({ revalidated: true })
}
```

## Streaming and Suspense

### Suspense for Streaming HTML
```tsx
import { Suspense } from 'react'

async function SlowComponent() {
  await new Promise(r => setTimeout(r, 3000))
  return <div>Loaded after 3 seconds</div>
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SlowComponent />
    </Suspense>
  )
}
```

### Streaming Multiple Sections
```tsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
    </div>
  )
}
```

### Loading Skeleton UI
```tsx
// app/dashboard/loading.tsx (Optional, built-in Suspense)
export default function Loading() {
  return <div className="animate-pulse">Loading dashboard...</div>
}

// Or use Suspense directly for granular control
<Suspense fallback={<Skeleton />}>
  <Component />
</Suspense>
```

## Route Handlers (API Routes)

### GET Handler
```tsx
// app/api/posts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '1'

  const posts = await db.posts.findMany({
    skip: (parseInt(page) - 1) * 10,
    take: 10
  })

  return Response.json(posts)
}
```

### POST Handler
```tsx
export async function POST(request: Request) {
  const body = await request.json()

  // Validate
  if (!body.title || !body.content) {
    return Response.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const post = await db.posts.create(body)
  return Response.json(post, { status: 201 })
}
```

### Dynamic Route Handler
```tsx
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await db.posts.findUnique({
    where: { id: params.id }
  })

  if (!post) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json(post)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const post = await db.posts.update({
    where: { id: params.id },
    data: body
  })
  return Response.json(post)
}
```

## Middleware Patterns

### Authentication Middleware
```tsx
// middleware.ts (root level)
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth')?.value

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    if (token) {
      await jwtVerify(token, secret)
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
```

### Redirect Middleware
```tsx
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/old-page') {
    return NextResponse.redirect(
      new URL('/new-page', request.url),
      { status: 301 }
    )
  }
}
```

## Dynamic Imports for Client-Only Libraries

### D3.js (Requires DOM)
```tsx
// app/chart/page.tsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), { ssr: false })

export default function Page() {
  return <Chart data={data} />
}

// components/Chart.tsx
'use client'

import { D3Chart } from 'd3-react'

export default function Chart({ data }) {
  return <D3Chart data={data} />
}
```

### Three.js (Requires WebGL)
```tsx
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div>Loading 3D scene...</div>
})

export default function Page() {
  return <Scene />
}
```

### Conditional Imports
```tsx
'use client'

import { useEffect, useState } from 'react'

export function ClientOnly() {
  const [Component, setComponent] = useState(null)

  useEffect(() => {
    // Import only on client
    import('heavy-lib').then(mod => setComponent(mod.default))
  }, [])

  return Component ? <Component /> : null
}
```

## SEO Optimization with Metadata API

### Static Metadata
```tsx
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Site',
  description: 'Description of my site',
  openGraph: {
    title: 'My Site',
    description: 'Description',
    url: 'https://example.com',
    images: [{ url: 'https://example.com/og.jpg' }]
  }
}

export default function Page() {
  return <div>Page content</div>
}
```

### Dynamic Metadata (Server Function)
```tsx
// app/posts/[id]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const post = await db.posts.findUnique({
    where: { id: params.id }
  })

  return {
    title: post.title,
    description: post.excerpt
  }
}

export default async function Page({ params }) {
  const post = await db.posts.findUnique({
    where: { id: params.id }
  })

  return <article>{post.content}</article>
}
```

## Image Optimization

### Next.js Image Component
```tsx
import Image from 'next/image'

// Static import (width/height from file)
import myImage from '@/public/photo.jpg'
<Image src={myImage} alt="Description" priority />

// Dynamic URL (must specify width/height)
<Image
  src="/photo.jpg"
  alt="Description"
  width={1200}
  height={800}
  quality={75}
  priority={isAboveFold}
/>

// Responsive with sizes
<Image
  src="/photo.jpg"
  alt="Description"
  fill
  sizes="(max-width: 640px) 100vw, 50vw"
  objectFit="cover"
/>
```

## Environment Variables

### Public Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.example.com
```

Accessible on client and server:
```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### Private Variables (.env.local)
```bash
DATABASE_URL=postgresql://...
API_SECRET=abc123
```

Only accessible on server:
```tsx
// app/api/route.ts
const secret = process.env.API_SECRET  // Works

// 'use client' component
const secret = process.env.API_SECRET  // undefined
```

## Deployment Considerations

### Build Output Analysis
```bash
npm run build
# Check .next/static/ for bundle sizes
# Analyze with `npm run analyze`
```

### Performance Metrics
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3.8s

### Vercel Deployment
```bash
# env.local variables auto-synced
# Automatic builds on push
# Preview deployments per PR
vercel deploy --prod
```

### Self-Hosted (Docker)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
```

### Edge Runtime (Serverless Functions)
```tsx
// app/api/light/route.ts
export const runtime = 'edge'

export function GET(request: Request) {
  return Response.json({ message: 'Fast response' })
}
```

## Production-Ready Checklist

- Server Components used by default (minimize client JS)
- Data fetching with proper caching strategy (revalidate tags)
- Error boundaries (error.tsx) configured per layout
- Loading states (loading.tsx or Suspense) for slow components
- Metadata configured (title, description, OpenGraph)
- Images optimized (Next.js Image component)
- Environment variables properly scoped
- API routes secured (auth/validation)
- Middleware configured for auth/redirects
- Dynamic imports for client-heavy libraries
- No console.log in production
- Build succeeds without warnings
- Lighthouse score 90+
- Accessibility audit passing
- Mobile responsive tested
- Error handling with user-friendly messages
