---
name: code-reviewer
description: Comprehensive code review patterns for security, performance, maintainability, accessibility, and best practices. Detects vulnerabilities, anti-patterns, and quality issues.
version: 1.0.0
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Code Reviewer - Comprehensive Quality Assessment

## Review Methodology

Approach code reviews systematically across these dimensions:
1. **Security** - Vulnerabilities, injection risks, auth issues
2. **Performance** - Inefficient patterns, memory leaks, bundle bloat
3. **Maintainability** - Code clarity, naming, structure, complexity
4. **Accessibility** - WCAG compliance, semantic HTML, ARIA
5. **Testing** - Coverage gaps, untestable code, error scenarios
6. **Best Practices** - Language idioms, framework patterns, dependencies

## Security Vulnerability Detection

### XSS (Cross-Site Scripting)
```tsx
// VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SAFE
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

Checklist:
- Never use `dangerouslySetInnerHTML` with user input
- Sanitize with dompurify before rendering
- Encode output: `&`, `<`, `>`, `"`, `'`
- Use React's automatic escaping when possible
- CSP (Content Security Policy) headers configured

### SQL/NoSQL Injection
```javascript
// VULNERABLE
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// SAFE - Parameterized queries
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

Checklist:
- Always use parameterized queries
- Never concatenate user input into SQL/MQL
- Use ORMs (Prisma, TypeORM) when possible
- Validate/sanitize input length and type
- Use prepared statements

### Authentication & Authorization
```tsx
// VULNERABLE
if (user.role === 'admin') { /* allow */ }  // Client-side only

// SAFE
// Server-side check
if (!hasPermission(session, 'admin')) throw Unauthorized()
```

Checklist:
- Never trust client-side auth checks
- Verify permissions server-side before sensitive operations
- Use secure session management (httpOnly cookies, CSRF tokens)
- Implement rate limiting on auth endpoints
- Check authorization on every API route
- Validate JWT/token expiration and signature

### API Key & Credential Exposure
Checklist:
- No API keys in source code (use environment variables)
- No credentials in `.env` files committed to git
- Rotate exposed keys immediately
- Use secret management services (AWS Secrets Manager, 1Password)
- Never log sensitive data (passwords, tokens, SSNs)
- Secrets not in error messages or stack traces

### CSRF (Cross-Site Request Forgery)
Checklist:
- POST/PUT/DELETE endpoints require CSRF tokens
- Token tied to session, validated on server
- SameSite cookie attribute set to 'Strict' or 'Lax'
- Referer header validation as secondary measure

## Performance Anti-Patterns

### Inefficient Rendering (React)
```tsx
// INEFFICIENT - Re-renders all items
{items.map((item, index) => <Item key={index} data={item} />)}

// EFFICIENT - Stable keys
{items.map(item => <Item key={item.id} data={item} />)}

// WASTEFUL - Inline object props
<Component style={{ color: 'red' }} />  // New object every render

// EFFICIENT - Memoized style
const styles = useMemo(() => ({ color: 'red' }), [])
<Component style={styles} />
```

Checklist:
- Use stable keys in lists (never index)
- Memoize expensive calculations
- Split components to isolate state changes
- Use `React.memo` for pure components
- Avoid inline object/function props

### Memory Leaks
```tsx
// LEAK - Listener never removed
useEffect(() => {
  window.addEventListener('scroll', handler)
}, [])

// FIXED - Cleanup function
useEffect(() => {
  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}, [])
```

Checklist:
- All `addEventListener` has matching `removeEventListener`
- Async operations cancelled on unmount
- Timers cleared (clearTimeout, clearInterval)
- Subscriptions unsubscribed
- Context/Redux subscriptions cleaned up

### Bundle Size Issues
Checklist:
- Analyze bundles with `webpack-bundle-analyzer`
- Tree-shake unused exports (ES6 modules)
- Dynamic imports for large components
- Remove unused dependencies regularly
- Use lightweight alternatives (date-fns vs moment)
- Minify and gzip enabled
- No large monolithic libraries loaded upfront

## TypeScript/React Code Smells

### Type Safety Issues
```tsx
// RISKY - any type
function process(data: any) {}

// SAFE - Explicit types
interface UserData {
  id: number
  name: string
}
function process(data: UserData) {}
```

Checklist:
- No `any` types (use `unknown` if necessary)
- All function parameters typed
- Return types explicit
- Union types used for multiple possibilities
- Generics for reusable types
- Strict mode enabled in `tsconfig.json`

### Component Anti-Patterns
```tsx
// PROBLEMATIC - State lifted too high
<App> => <Form> => <Input value={value} onChange={set} />

// BETTER - Local state, lifted only when needed
<Form>
  <Input value={value} onChange={set} />  // Local
</Form>
```

Checklist:
- Props drilling avoided (use Context/Provider)
- Components have single responsibility
- No unnecessary state lifting
- Presentational vs container separation
- Props interfaces documented
- Prop defaults clear

## Testing Coverage Assessment

### Coverage Metrics
- **Lines**: 80%+ for business logic
- **Branches**: 70%+ (all if/else paths)
- **Functions**: 85%+
- **Statements**: 80%+

### Coverage Gaps to Flag
```tsx
// MISSING TESTS
function criticalFunction(a, b) {
  if (a > 0) return a + b        // No test for this path
  return a - b                    // No test for this path
}
```

Checklist:
- All error paths tested
- Edge cases covered (null, empty, boundary values)
- Happy path and sad path scenarios
- User interactions tested (click, type, submit)
- Async operations awaited properly
- Mocks used appropriately
- No overmocked tests (coupling to implementation)

### Untestable Code Patterns
```tsx
// UNTESTABLE - Hard-coded side effects
export function fetchUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json())
}

// TESTABLE - Injected dependencies
export function fetchUser(id, fetchFn = fetch) {
  return fetchFn(`/api/users/${id}`).then(r => r.json())
}
```

Checklist:
- Dependencies injectable (not hard-coded)
- Side effects isolated in sagas/thunks
- Pure business logic separated from effects
- Avoid testing implementation details
- Mock external APIs and services

## Accessibility Audit for Components

### Semantic HTML
Checklist:
- `<button>` for clickable actions, not `<div>`
- `<a>` for navigation, not buttons
- Heading hierarchy: h1 > h2 > h3 (no skips)
- Form inputs have `<label>` elements
- Images have descriptive `alt` text
- Lists use `<ul>`, `<ol>`, `<li>`
- `<main>`, `<nav>`, `<section>`, `<article>` landmarks used

### ARIA & Labels
```tsx
// ACCESSIBLE
<input aria-label="Search products" placeholder="Search..." />
<button aria-describedby="help">Submit</button>
<div id="help">Press Enter to submit the form</div>

// INACCESSIBLE
<input placeholder="Search..." />
<button>Submit</button>
```

Checklist:
- Interactive elements have accessible names
- Form fields associated with labels (not via placeholder alone)
- Dynamic content announced (aria-live)
- Modal dialogs have proper focus management
- Error messages linked to inputs (aria-describedby)
- No aria-* overriding native semantics

### Keyboard Navigation
Checklist:
- All interactive elements reachable via Tab
- Focus visible with clear outline or highlight
- Escape closes modals/menus
- Enter submits forms
- Arrow keys work in lists/menus
- Tab order logical (not random or skip)
- Focus not trapped except in modals

### Color & Contrast
Checklist:
- Text contrast 4.5:1 (WCAG AA)
- AAA compliance (7:1) for critical content
- Color not only means of conveying info (use icons, text, patterns)
- Dark mode respects user preference (prefers-color-scheme)

## Bundle Size Impact Analysis

### Size Analysis Pattern
```bash
npm run build -- --analyze
# Check total size vs budget
# Identify large dependencies
# Plan splitting/dynamic import strategy
```

Checklist:
- Check with `bundlesize` or Webpack analyzer
- Flag dependencies > 100KB unminified
- Identify duplicate dependencies in node_modules
- Verify tree-shaking working (check source maps)
- Compare against previous versions
- Mobile metrics considered (gzip size for slow networks)

## API Security Review

### Endpoint Security
```javascript
// VULNERABLE
app.post('/api/delete-user', (req, res) => {
  db.deleteUser(req.body.userId)  // No auth check
})

// SECURE
app.post('/api/delete-user', authenticate, authorize('admin'), (req, res) => {
  if (req.user.id !== req.body.userId && req.user.role !== 'admin') {
    throw Unauthorized()
  }
  db.deleteUser(req.body.userId)
})
```

Checklist:
- Authentication required for protected endpoints
- Authorization checked (user can only access own data)
- Input validation on all parameters
- Rate limiting on sensitive endpoints
- API versioning strategy clear
- Deprecation timeline communicated
- Error messages don't leak sensitive info
- CORS properly configured

## Error Handling Patterns

### Error Recovery
```tsx
// INCOMPLETE
async function fetchData() {
  return fetch('/api/data').then(r => r.json())
}

// ROBUST
async function fetchData() {
  try {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    logger.error('Failed to fetch data', error)
    return null
  }
}
```

Checklist:
- Try/catch on async operations
- All error paths handled
- Error messages user-friendly
- Errors logged with context
- Retry logic for transient failures
- Fallback UI for error states
- No swallowed errors (catch without handling)

## Code Complexity Metrics

### Cyclomatic Complexity
Flag functions with:
- More than 10 branches (if/else, switch cases)
- More than 20 statements
- Nesting > 4 levels deep

Suggestion: Break into smaller functions

### Function Size
- Ideal: < 30 lines
- Maximum: < 50 lines
- Extract helpers if exceeds

### Parameters
- Maximum 3 parameters
- Use object parameter if many: `{ a, b, c }`

## Naming Convention Checks

### Variables & Functions
Checklist:
- camelCase for variables/functions (JS/TS)
- PascalCase for classes/components (React)
- CONSTANT_CASE for constants
- Private: _prefixed or # (JS private fields)
- Boolean: isActive, hasError, canDelete
- Descriptive names (no x, y, tmp unless obvious)

### Files & Folders
Checklist:
- PascalCase for React components: Button.tsx
- kebab-case for utilities: api-client.ts
- index.ts for barrel exports
- Folder names match component name
- One component per file (unless tightly coupled)

## Import Organization

```tsx
// ORGANIZED
import React from 'react'
import { useState } from 'react'

import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

import { API_URL } from '@/config'
import styles from './Component.module.css'

// Groups: External > Internal > Relative > Styles
```

Checklist:
- External imports first
- Internal imports second
- Relative imports third
- Styles at end
- Alphabetically sorted within groups
- No circular dependencies
- Absolute paths preferred over relative

## Dead Code Detection

Search patterns:
```bash
# Unused variables
grep -r "let [a-zA-Z]* =" src/ | grep -v "=.*="

# Unused functions
grep -r "export function" src/ | while read line; do
  func=$(echo $line | sed 's/.*function //g' | cut -d'(' -f1)
  grep -q "$func" src/ || echo "Unused: $func"
done

# Unused imports
npm run build -- --analyze
```

Checklist:
- No commented-out code (use git history)
- No unused variables
- No unused imports
- No unused exports
- No dead branches
- Git history available for reference

## Production-Ready Code Checklist

- All security issues resolved
- Performance optimized (< 3s FCP)
- Tests pass and coverage adequate
- Accessibility audit passed
- TypeScript strict mode passing
- Linting rules (ESLint) all green
- Code reviews approved
- No console.log statements
- Environment variables properly scoped
- Error boundaries in place
- Loading/error states for async operations
- No secrets in code or config files
