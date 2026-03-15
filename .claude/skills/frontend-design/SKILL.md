---
name: frontend-design
description: Production-ready frontend design patterns for React and Next.js. Avoid AI slop, make bold design decisions, implement state management, and optimize performance.
version: 1.0.0
stacks:
  - React
  - Next.js
  - Tailwind CSS
---

# Frontend Design Excellence

## Anti-AI Slop Philosophy

Reject generic, predictable frontend aesthetics. Make BOLD design decisions:

- **Asymmetric Layouts**: Break the grid intentionally. Place content off-center, use unexpected white space
- **Unusual Color Choices**: Question default palettes. Consider muted earth tones, unexpected contrasts, duotones
- **Distinctive Typography**: Use variable fonts with creative weight/width combinations. Avoid generic sans-serifs
- **Micro Design Decisions**: Unique border radiuses (7px, 11px), custom shadows, specific stroke widths
- **Unexpected Interactions**: Animated text reveals, parallax effects with purpose, gesture-based interactions
- **Custom Iconography**: Design icons matching brand personality, not copying Material Design or Feather Icons
- **Deliberate Constraints**: Limit color palette to 3-4 colors. Embrace limitation as design strength

## Component Architecture Best Practices

### Atomic Design Structure
```
components/
├── atoms/          (Buttons, badges, inputs, icons)
├── molecules/      (Search bar, pagination, nav item)
├── organisms/      (Header, sidebar, form section)
├── templates/      (Page layouts with slots)
└── layouts/        (App wrappers, context providers)
```

### Component File Organization
```
Button/
├── Button.tsx      (Component)
├── Button.module.css (Styles, if not Tailwind)
├── Button.test.tsx (Tests)
├── useButton.ts    (Custom hook if complex)
└── index.ts        (Export)
```

### Composition Over Inheritance
```tsx
// Good: Composition
<Button>
  <Icon name="download" />
  <span>Download</span>
</Button>

// Bad: Inheritance
<Button icon="download" text="Download" />
```

### Props Interface Design
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean; // Radix UI pattern
}
```

## State Management Patterns

### Client-Side State
- **useState**: Simple, local component state
- **useReducer**: Complex state logic, multiple related updates
- **Context + useReducer**: App-wide state without external libraries
- **Zustand/Jotai**: Lightweight global state (preferred over Redux for modern apps)

### Server-Side State (Next.js App Router)
- **Server Components**: Default; fetch data server-side, pass to client
- **Server Actions**: Form submissions, mutations, caching enabled by default
- **Route Handlers**: API endpoints, webhooks, external integrations

### Cache Strategy
```tsx
// Revalidate every hour
fetch(url, { next: { revalidate: 3600 } })

// Revalidate on demand
import { revalidateTag } from 'next/cache'
revalidateTag('posts')

// Cache indefinitely (only with ISR)
fetch(url, { next: { revalidate: false } })
```

## Performance Optimization

### Code Splitting Strategies
```tsx
// Dynamic import for large components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false // Don't render on server
})
```

### Image Optimization
```tsx
import Image from 'next/image'

// Always specify width/height for static images
<Image
  src="/photo.jpg"
  width={1200}
  height={800}
  alt="Description"
  priority={isAboveFold}
  quality={75}
/>
```

### Lazy Loading Patterns
```tsx
// Intersection Observer
const [isVisible, setIsVisible] = useState(false)
const ref = useRef(null)

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsVisible(entry.isIntersecting)
  })
  observer.observe(ref.current)
}, [])
```

### Bundle Analysis
- Use `npm run build && npm run analyze`
- Target: JS bundle < 200KB (gzipped)
- Identify large dependencies with `webpack-bundle-analyzer`
- Remove unused CSS with Tailwind's purge feature

## CSS-in-JS vs Tailwind Decision Framework

### Use Tailwind CSS When:
- Consistent design system needed across app
- Team familiar with utility-first approach
- Responsive design-heavy application
- Fast prototyping prioritized
- Standard component library (shadcn/ui) used

### Use CSS-in-JS When:
- Dynamic styles based on runtime data
- Complex theming logic
- Scoped styles preventing conflicts
- CSS library integration (Emotion, Styled Components)
- Animation libraries requiring JS control

### CSS Modules When:
- BEM naming conventions preferred
- Legacy app migration
- CSS-only approach required
- No preprocessor build step needed

### Hybrid Approach (Recommended)
```tsx
// Tailwind for base styles
<button className="px-4 py-2 bg-blue-500 rounded-lg">

// CSS Modules for complex layouts
<div className={styles.complexLayout}>

// Inline styles for dynamic values
<div style={{ width: `${percentage}%` }}>
```

## Form Handling Patterns

### Controlled Components with react-hook-form
```tsx
import { useForm } from 'react-hook-form'

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email is required' })} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}
```

### Server Actions for Submission
```tsx
'use client'
import { submitForm } from './actions'

export function MyForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData) {
    setPending(true)
    try {
      await submitForm(formData)
    } finally {
      setPending(false)
    }
  }

  return <form action={handleSubmit}>...</form>
}
```

### Field-Level Validation
- Client-side: Immediate feedback (required, email format, min length)
- Server-side: Security validation (never trust client)
- Visual feedback: Red border, error message, success icon

## Error Boundary Implementation

### Class Component Error Boundary
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### Functional Approach (use library)
```tsx
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

### Granular Error Boundaries
```tsx
<ErrorBoundary>
  <Header />
</ErrorBoundary>
<ErrorBoundary>
  <MainContent />
</ErrorBoundary>
<ErrorBoundary>
  <Sidebar />
</ErrorBoundary>
```

## Advanced Patterns

### Render Props for Reusability
```tsx
<DataFetcher query={POSTS_QUERY}>
  {({ loading, data, error }) => (
    loading ? <Spinner /> : <PostList posts={data} />
  )}
</DataFetcher>
```

### Custom Hooks for Logic Extraction
```tsx
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading }
}
```

### Compound Components
```tsx
<Form>
  <Form.Header>Settings</Form.Header>
  <Form.Field label="Name">
    <Form.Input placeholder="Your name" />
  </Form.Field>
  <Form.Actions>
    <Form.SubmitButton>Save</Form.SubmitButton>
  </Form.Actions>
</Form>
```

## Production-Ready Checklist

- Components tested with React Testing Library
- Props fully typed with TypeScript
- No console errors or warnings
- Keyboard navigation working (Tab, Enter, Escape)
- Screen reader compatible (semantic HTML, ARIA)
- Mobile responsive (no horizontal scroll at 320px)
- Bundle size analyzed and optimized
- Images optimized (WebP, responsive, lazy load)
- Forms accessible with labels and error messages
- Loading states for all async operations
- Error handling with user-friendly messages
- Performance budget: < 3 second FCP on 4G
- Accessibility audit passing (axe DevTools)
