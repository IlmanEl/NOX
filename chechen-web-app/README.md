# 🎓 Chechen Language Learning App - Web Frontend

Enterprise-grade educational platform built with Next.js 14, TypeScript, and Supabase.

## 🏗️ Architecture Overview

### Design Principles

1. **Layered Architecture**: Clear separation of concerns
   - **Presentation Layer** (`/app`, `/components`) - UI only
   - **Business Logic Layer** (`/features`) - Domain logic
   - **Data Access Layer** (`/lib/supabase`) - Database interaction

2. **DTO Pattern**: Security-first data handling
   - Database types NEVER reach the UI
   - Public DTOs explicitly define what's exposed
   - Mappers ensure data transformation

3. **Server Components First**: Optimal performance
   - Data fetching on server by default
   - Client components only where necessary
   - Better SEO and security

4. **PWA & Mobile-Ready**: Future-proof architecture
   - Touch-friendly UI (44x44px minimum)
   - Mobile-first Tailwind breakpoints
   - Capacitor-ready structure

## 📁 Project Structure

```
/chechen-web-app
├── /app                          # Next.js App Router
│   ├── layout.tsx                # Root layout (PWA metadata)
│   ├── page.tsx                  # Home page (Server Component)
│   └── globals.css               # Global styles + Tailwind
│
├── /lib                          # Shared infrastructure
│   ├── /supabase
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   ├── types.ts              # Type utilities
│   │   └── database.types.ts     # Auto-generated DB types
│   └── /utils                    # Utility functions
│
├── /features                     # Feature modules (Domain Layer)
│   └── /lessons
│       ├── /services
│       │   └── lessons.service.ts    # Business logic
│       ├── /types
│       │   └── dto.ts                # Public DTOs
│       └── /mappers
│           └── lesson.mapper.ts      # DB → DTO conversion
│
├── /components                   # UI Components
│   ├── /ui                       # Atomic components
│   └── /features                 # Feature-specific components
│
└── /hooks                        # Custom React hooks
```

## 🔒 Security: DTO Pattern

### Problem
Database tables may contain admin-only fields (e.g., `notes`, `online_sources`) that should NEVER reach the frontend.

### Solution
```typescript
// ❌ BAD: Direct database type exposure
type Lesson = Tables<'lessons'> // May contain secrets!

// ✅ GOOD: Explicit public DTO
interface PublicLesson {
  id: number
  title: string
  // Only public fields listed
}
```

### Data Flow
```
Database → Service → Mapper → DTO → UI
  (Raw)      ↓         ↓       ↓     (Safe)
           Fetch   Transform Filter  Display
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` (already configured):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
```bash
npm run build
npm start
```

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🎯 Key Features

### Server Components (Default)
All components are Server Components unless marked with `'use client'`.

**Benefits**:
- ⚡ Faster initial page load
- 🔒 Secrets stay on server
- 🚀 Better SEO

**Example**:
```tsx
// app/page.tsx - Server Component
export default async function HomePage() {
  const lessons = await getLessonsA1() // Runs on server
  return <div>{/* UI */}</div>
}
```

### Service Layer Pattern
```tsx
// features/lessons/services/lessons.service.ts
export async function getLessonsA1(): Promise<PublicLesson[]> {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('lessons')
    .select('*')
    .eq('level', 'A1')

  return toPublicLessons(data) // ✅ Converts to safe DTOs
}
```

### Mapper Functions
```tsx
// features/lessons/mappers/lesson.mapper.ts
export function toPublicLesson(dbLesson: DbTable<'lessons'>): PublicLesson {
  return {
    id: dbLesson.id,
    title: dbLesson.title,
    // Explicit field mapping - secrets not included
  }
}
```

## 🎨 Styling

### Tailwind CSS
- **Mobile-first**: All styles start with mobile, expand upward
- **Touch-friendly**: Minimum 44x44px tap targets
- **Safe areas**: iOS notch support via `safe-*` utilities

### Example
```tsx
<button className="btn-primary min-h-[44px] safe-bottom">
  Click me
</button>
```

## 📱 PWA Support

### Metadata
```tsx
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zoom
  viewportFit: 'cover', // iPhone X+ support
}
```

### Manifest
Add `public/manifest.json` for full PWA support (future enhancement).

## 🔄 Data Flow Example

```
User visits page
    ↓
Server Component renders
    ↓
Service Layer called (getLessonsA1)
    ↓
Supabase query executed (server-side)
    ↓
Mapper converts DB → DTO (toPublicLessons)
    ↓
Public data returned to UI
    ↓
HTML sent to client (no secrets)
```

## 🧪 Type Safety

### Strict TypeScript Configuration
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Database Types
Auto-generated from Supabase schema:
```typescript
import type { DbTable } from '@/lib/supabase/types'

type Lesson = DbTable<'lessons'>
```

## 🚧 Next Steps

### Phase 1: Core Features (Current)
- [x] Architecture setup
- [x] Supabase integration
- [x] Service layer with DTO
- [x] Home page with lessons list
- [ ] Lesson detail page
- [ ] Exercise components
- [ ] User authentication
- [ ] Progress tracking

### Phase 2: Enhanced UX
- [ ] Loading states
- [ ] Error boundaries
- [ ] Animations (Framer Motion)
- [ ] Dark mode
- [ ] Responsive images

### Phase 3: PWA & Mobile
- [ ] Service worker
- [ ] Offline support
- [ ] Capacitor integration
- [ ] iOS/Android builds

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 🤝 Contributing

### Adding a New Feature

1. Create feature folder:
```bash
mkdir -p features/my-feature/{services,types,mappers}
```

2. Define DTOs:
```typescript
// features/my-feature/types/dto.ts
export interface PublicMyFeature {
  // Only public fields
}
```

3. Create mapper:
```typescript
// features/my-feature/mappers/mapper.ts
export function toPublicMyFeature(db: DbType): PublicMyFeature {
  return { /* safe mapping */ }
}
```

4. Create service:
```typescript
// features/my-feature/services/service.ts
export async function getMyFeature() {
  const supabase = createSupabaseServer()
  // ... fetch and map
}
```

5. Use in UI:
```typescript
// app/my-feature/page.tsx
export default async function Page() {
  const data = await getMyFeature()
  return <div>{/* render */}</div>
}
```

## 📄 License

ISC

## 💪 Built with Ultra-Think Architecture

This project follows enterprise-grade patterns:
- Clean Architecture principles
- SOLID design patterns
- Security-first data handling
- Performance optimization
- Type safety at every layer

---

**Ready to build the best Chechen language learning platform! 🚀**
