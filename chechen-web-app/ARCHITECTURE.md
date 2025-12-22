# 🏛️ ARCHITECTURE DOCUMENTATION

## 📋 Executive Summary

This document describes the enterprise-grade architecture of the Chechen Language Learning Web Application. The architecture is designed for:

- **Scalability**: Support thousands of lessons and millions of users
- **Security**: Zero-trust data handling with DTO pattern
- **Performance**: Server-first rendering, optimized bundle
- **Maintainability**: Clear separation of concerns, modular design
- **Mobile-Ready**: PWA-compatible, Capacitor-ready

---

## 🎯 Architectural Principles

### 1. Layered Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────┐
│           PRESENTATION LAYER                    │
│  /app, /components - UI Components Only         │
│  - Server Components (default)                  │
│  - Client Components (interactive only)         │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         BUSINESS LOGIC LAYER                    │
│  /features - Domain Logic & Services            │
│  - Services: Business logic                     │
│  - DTOs: Public data contracts                  │
│  - Mappers: Data transformation                 │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│          DATA ACCESS LAYER                      │
│  /lib/supabase - Database Interaction           │
│  - Server client (SSR)                          │
│  - Browser client (Client Components)           │
│  - Type definitions                             │
└─────────────────────────────────────────────────┘
```

**Benefits**:
- ✅ Clear boundaries between layers
- ✅ Easy to test (mock layers independently)
- ✅ Technology-agnostic (can swap Supabase later)
- ✅ Enforces single responsibility

---

### 2. DTO Pattern (Security Layer)

**Problem**: Database tables may contain sensitive fields that should NEVER reach the frontend.

**Solution**: Data Transfer Objects (DTOs) explicitly define the public API surface.

```typescript
// ❌ INSECURE: Direct database type exposure
import { Tables } from '@/lib/supabase/types'

function getLesson(): Tables<'lessons'> {
  // May expose: id, title, description, notes, online_sources, admin_metadata
  return rawDatabaseData // 🚨 SECRETS LEAK!
}

// ✅ SECURE: DTO pattern
interface PublicLesson {
  id: number
  title: string
  description: string | null
  // ONLY public fields defined
}

function getLesson(): PublicLesson {
  const raw = fetchFromDatabase()
  return toPublicLesson(raw) // Mapper filters secrets
}
```

**Data Flow with Security Checkpoints**:

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Database │ →  │ Service │ →  │ Mapper  │ →  │   DTO   │ →  │   UI    │
│ (Raw)   │    │ (Fetch) │    │(Filter) │    │ (Safe)  │    │(Display)│
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
    ↓              ↓              ↓              ↓              ↓
May contain    Fetches all    Explicitly     Only public    Receives
admin fields   fields from    maps safe      fields         clean data
               database       fields only    guaranteed
```

**Implementation**:

1. **Define DTO** (`features/lessons/types/dto.ts`):
```typescript
export interface PublicLesson {
  id: number
  title: string
  description: string | null
  lesson_number: number
  level: string
  word_count: number
  total_exercises: number
  words: string[]
  created_at: string | null
  // notes: EXCLUDED
  // online_sources: EXCLUDED
  // admin_metadata: EXCLUDED
}
```

2. **Create Mapper** (`features/lessons/mappers/lesson.mapper.ts`):
```typescript
export function toPublicLesson(
  dbLesson: DbTable<'lessons'>
): PublicLesson {
  return {
    id: dbLesson.id,
    title: dbLesson.title,
    description: dbLesson.description,
    lesson_number: dbLesson.lesson_number,
    level: dbLesson.level,
    word_count: dbLesson.word_count,
    total_exercises: dbLesson.total_exercises,
    words: dbLesson.words,
    created_at: dbLesson.created_at,
    // SECRET FIELDS NOT MAPPED → CANNOT LEAK
  }
}
```

3. **Use in Service** (`features/lessons/services/lessons.service.ts`):
```typescript
export async function getLessonsA1(): Promise<PublicLesson[]> {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('lessons')
    .select('*')
    .eq('level', 'A1')

  return toPublicLessons(data) // ✅ SECURE: Returns DTOs only
}
```

**Security Guarantees**:
- ✅ Type system enforces DTO usage
- ✅ Impossible to accidentally expose raw DB types
- ✅ Single source of truth for public API
- ✅ Easy to audit (check mapper files)

---

### 3. Server Components First (Next.js 14 Best Practice)

**Philosophy**: Render on server by default, use client only when necessary.

**Benefits**:
- ⚡ **Performance**: Less JavaScript shipped to client
- 🔒 **Security**: API keys and secrets stay on server
- 🚀 **SEO**: Full HTML rendered on first load
- 💰 **Cost**: Lower database connection usage

**Decision Tree**:

```
Does component need:
  - State (useState, useReducer)?
  - Effects (useEffect)?
  - Event handlers (onClick, onChange)?
  - Browser APIs (localStorage, window)?

     ↓ YES

  ✅ Client Component
     'use client'

     ↓ NO

  ✅ Server Component
     (default)
```

**Examples**:

```typescript
// ✅ Server Component (default)
// app/page.tsx
export default async function HomePage() {
  const lessons = await getLessonsA1() // Runs on server

  return (
    <div>
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  )
}

// ✅ Client Component (interactive)
// components/features/interactive-exercise.tsx
'use client'

export function InteractiveExercise({ exercise }: Props) {
  const [answer, setAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const handleSubmit = () => {
    setIsCorrect(answer === exercise.correct_answer)
  }

  return (
    <div>
      <input value={answer} onChange={e => setAnswer(e.target.value)} />
      <button onClick={handleSubmit}>Check</button>
      {isCorrect !== null && <Result correct={isCorrect} />}
    </div>
  )
}
```

**Server vs Client Supabase Clients**:

```typescript
// Server Component
import { createSupabaseServer } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createSupabaseServer() // Handles cookies properly
  const { data } = await supabase.from('lessons').select('*')
}

// Client Component
'use client'
import { supabaseBrowser } from '@/lib/supabase/client'

export function Component() {
  const fetchData = async () => {
    const { data } = await supabaseBrowser.from('lessons').select('*')
  }
}
```

---

### 4. Feature-Sliced Design (Modular Architecture)

**Structure**:

```
/features
  ├── /lessons
  │   ├── /services
  │   │   └── lessons.service.ts    # Business logic
  │   ├── /types
  │   │   └── dto.ts                # Public contracts
  │   ├── /mappers
  │   │   └── lesson.mapper.ts      # DB → DTO
  │   └── /components (future)
  │       └── lesson-card.tsx       # Feature-specific UI
  │
  ├── /exercises
  │   ├── /services
  │   ├── /types
  │   └── /mappers
  │
  └── /progress
      ├── /services
      ├── /types
      └── /mappers
```

**Benefits**:
- ✅ **Isolation**: Features don't depend on each other
- ✅ **Scalability**: Add new features without touching existing code
- ✅ **Team-friendly**: Multiple devs can work on different features
- ✅ **Testing**: Test features independently

**Feature Module Template**:

```
/features/[feature-name]
  /services         # Business logic (API calls, data fetching)
  /types           # DTOs and interfaces
  /mappers         # Data transformation functions
  /components      # Feature-specific UI components
  /hooks           # Feature-specific React hooks
  /utils           # Feature-specific utilities
```

---

### 5. PWA & Mobile-First Design

**Viewport Configuration**:

```typescript
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,     // Prevent accidental zoom
  viewportFit: 'cover',    // iPhone X+ notch support
}
```

**Touch-Friendly UI**:

```css
/* app/globals.css */
button, a {
  @apply min-h-[44px] min-w-[44px]; /* Apple's HIG minimum */
}
```

**Safe Area Support** (iOS notch):

```tsx
<div className="safe-top safe-bottom">
  {/* Content respects device safe areas */}
</div>
```

**Tailwind Mobile-First**:

```tsx
// Mobile: full width, Desktop: max-width
<div className="w-full lg:max-w-4xl">
  {/* Responsive content */}
</div>

// Mobile: vertical stack, Desktop: grid
<div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3">
  {/* Responsive layout */}
</div>
```

---

## 📁 Complete File Structure

```
/chechen-web-app
│
├── /app                              # Next.js App Router (Presentation)
│   ├── layout.tsx                    # Root layout (metadata, viewport)
│   ├── page.tsx                      # Home page (lessons list)
│   ├── globals.css                   # Global styles + Tailwind
│   │
│   ├── /(auth)                       # Route Group: Authentication (future)
│   │   ├── /login
│   │   └── /signup
│   │
│   └── /(main)                       # Route Group: Main app (future)
│       ├── /lesson/[id]
│       ├── /phrasebook
│       └── /profile
│
├── /lib                              # Shared Infrastructure
│   ├── /supabase
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client (SSR)
│   │   ├── types.ts                  # Type utilities
│   │   └── database.types.ts         # Auto-generated DB types
│   │
│   ├── /utils                        # Shared utilities
│   └── /constants                    # App-wide constants
│
├── /features                         # Business Logic (Domain Layer)
│   ├── /lessons
│   │   ├── /services
│   │   │   └── lessons.service.ts    # Fetch, create, update lessons
│   │   ├── /types
│   │   │   └── dto.ts                # PublicLesson, LessonWithProgress
│   │   └── /mappers
│   │       └── lesson.mapper.ts      # toPublicLesson, toLessonWithProgress
│   │
│   ├── /exercises                    # (future)
│   ├── /progress                     # (future)
│   └── /phrasebook                   # (future)
│
├── /components                       # UI Components
│   ├── /ui                           # Atomic components (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── progress.tsx
│   │
│   └── /features                     # Composite feature components
│       ├── /lesson-card
│       ├── /exercise-widget
│       └── /progress-bar
│
├── /hooks                            # Custom React hooks
│   ├── use-lessons.ts
│   └── use-progress.ts
│
├── /public                           # Static assets
│   ├── manifest.json                 # PWA manifest (future)
│   ├── /icons
│   └── /images
│
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS config
├── tsconfig.json                     # TypeScript config (strict mode)
├── package.json                      # Dependencies & scripts
├── .env.local                        # Environment variables
├── .gitignore
├── README.md                         # Getting started guide
└── ARCHITECTURE.md                   # This document
```

---

## 🔄 Data Flow Example: Fetching Lessons

### Request Flow

```
1. User navigates to http://localhost:3000
   ↓
2. Next.js Server Component renders app/page.tsx
   ↓
3. Component calls getLessonsA1() (Service Layer)
   ↓
4. Service creates Supabase server client
   ↓
5. Query: SELECT * FROM lessons WHERE level = 'A1'
   ↓
6. Database returns raw data (may include admin fields)
   ↓
7. Mapper: toPublicLessons(data) filters to DTOs
   ↓
8. Service returns PublicLesson[] to component
   ↓
9. Component renders HTML with lesson data
   ↓
10. Server sends fully rendered HTML to client
    (NO secrets, NO sensitive data)
```

### Code Trace

**1. Page Component** (`app/page.tsx`):
```typescript
export default async function HomePage() {
  const lessons = await getLessonsA1() // Call service
  return <LessonsList lessons={lessons} />
}
```

**2. Service** (`features/lessons/services/lessons.service.ts`):
```typescript
export async function getLessonsA1(): Promise<PublicLesson[]> {
  const supabase = createSupabaseServer()

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('level', 'A1')
    .order('lesson_number', { ascending: true })

  if (error) throw new Error('Failed to fetch lessons')

  return toPublicLessons(data) // Convert to DTOs
}
```

**3. Mapper** (`features/lessons/mappers/lesson.mapper.ts`):
```typescript
export function toPublicLessons(
  dbLessons: DbTable<'lessons'>[]
): PublicLesson[] {
  return dbLessons.map(toPublicLesson)
}

export function toPublicLesson(
  dbLesson: DbTable<'lessons'>
): PublicLesson {
  return {
    id: dbLesson.id,
    title: dbLesson.title,
    description: dbLesson.description,
    lesson_number: dbLesson.lesson_number,
    level: dbLesson.level,
    word_count: dbLesson.word_count,
    total_exercises: dbLesson.total_exercises,
    words: dbLesson.words,
    created_at: dbLesson.created_at,
  }
}
```

**4. Type Safety**:
```typescript
// Compile-time guarantee: Service MUST return PublicLesson[]
const lessons: PublicLesson[] = await getLessonsA1()

// ✅ TypeScript knows these fields exist:
lessons[0].title       // ✅
lessons[0].level       // ✅

// ❌ TypeScript prevents access to non-existent fields:
lessons[0].notes       // ❌ Compile error!
lessons[0].admin_data  // ❌ Compile error!
```

---

## 🔒 Security Architecture

### 1. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# ⚠️ NEXT_PUBLIC_* variables are exposed to the browser
# Only use for non-sensitive data (URL, anon key)
```

**Rules**:
- ✅ `NEXT_PUBLIC_*`: Safe for browser (URLs, public keys)
- ❌ Without `NEXT_PUBLIC_`: Server-only (service role keys, secrets)

### 2. Row-Level Security (RLS)

Supabase RLS policies ensure database-level security:

```sql
-- Lessons are public (read-only)
CREATE POLICY "Public lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (true);

-- User progress is private
CREATE POLICY "Users can only view their own progress"
  ON user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. Type-Safe Queries

```typescript
// ❌ Unsafe: SQL injection possible
const { data } = await supabase
  .rpc('execute_sql', { query: userInput })

// ✅ Safe: Parameterized query
const { data } = await supabase
  .from('lessons')
  .select('*')
  .eq('level', userInput) // Auto-escaped
```

---

## 🚀 Performance Optimizations

### 1. Server Components (Zero Client JS)

```typescript
// This component sends ZERO JavaScript to client
export default async function LessonsList() {
  const lessons = await getLessonsA1()

  return (
    <div>
      {lessons.map(lesson => (
        <div key={lesson.id}>{lesson.title}</div>
      ))}
    </div>
  )
}
```

### 2. Streaming & Suspense (Future)

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LessonsListAsync />
    </Suspense>
  )
}
```

### 3. Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/lesson-image.jpg"
  alt="Lesson thumbnail"
  width={400}
  height={300}
  loading="lazy"
/>
```

---

## ✅ Quality Assurance

### TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Code Quality Tools (Future)

- **ESLint**: Catch bugs and enforce conventions
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks
- **Jest**: Unit testing
- **Playwright**: E2E testing

---

## 📊 Scalability Considerations

### Database Queries

```typescript
// ❌ Bad: N+1 query problem
for (const lesson of lessons) {
  const exercises = await getExercises(lesson.id) // N queries!
}

// ✅ Good: Single query with join
const { data } = await supabase
  .from('lessons')
  .select(`
    *,
    exercises (*)
  `)
  .eq('level', 'A1')
```

### Caching Strategy (Future)

```typescript
// Next.js fetch with cache
export const revalidate = 3600 // Cache for 1 hour

export async function getLessonsA1() {
  const response = await fetch('/api/lessons', {
    next: { revalidate: 3600 }
  })
}
```

---

## 🧩 Extension Points

### Adding a New Feature

1. **Create feature folder**:
```bash
mkdir -p features/my-feature/{services,types,mappers}
```

2. **Define DTO**:
```typescript
// features/my-feature/types/dto.ts
export interface PublicMyFeature {
  id: number
  name: string
  // Only public fields
}
```

3. **Create mapper**:
```typescript
// features/my-feature/mappers/mapper.ts
export function toPublicMyFeature(
  db: DbTable<'my_table'>
): PublicMyFeature {
  return {
    id: db.id,
    name: db.name,
  }
}
```

4. **Create service**:
```typescript
// features/my-feature/services/service.ts
export async function getMyFeatures(): Promise<PublicMyFeature[]> {
  const supabase = createSupabaseServer()
  const { data } = await supabase.from('my_table').select('*')
  return data.map(toPublicMyFeature)
}
```

5. **Use in UI**:
```typescript
// app/my-feature/page.tsx
export default async function Page() {
  const features = await getMyFeatures()
  return <div>{/* render */}</div>
}
```

---

## 🎓 Learning Resources

- **Next.js 14 Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Clean Architecture**: Robert C. Martin's book

---

## 📝 Changelog

- **v1.0.0** (2025-12-22): Initial architecture implementation
  - Layered architecture with clean boundaries
  - DTO pattern for data security
  - Server Components first approach
  - Feature-sliced design structure
  - PWA-ready mobile-first design

---

**Built with enterprise-grade principles for the Chechen Language Learning Platform 🚀**
