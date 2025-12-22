/**
 * Home Page - Lessons List
 *
 * This is a Server Component (default in Next.js 14 App Router).
 * Data is fetched on the server, providing:
 * - Better performance (no client-side JS for data fetching)
 * - SEO optimization (content is rendered on server)
 * - Security (API keys stay on server)
 *
 * Architecture Flow:
 * 1. Server Component calls Service Layer
 * 2. Service calls Database via Supabase
 * 3. Mapper converts DB types → Public DTOs
 * 4. UI receives ONLY public data (no admin fields)
 */

import { getLessonsA1 } from '@/features/lessons/services/lessons.service'

export default async function HomePage() {
  // ✅ Fetch data on server
  // This function returns PublicLesson[] - no sensitive data
  const lessons = await getLessonsA1()

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Chechen Language App
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn Chechen from A1 to advanced level
        </p>
      </header>

      {/* Lessons Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            A1 Lessons ({lessons.length})
          </h2>
          <div className="rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
            MVP
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="card hover:shadow-md transition-shadow"
            >
              {/* Lesson Number Badge */}
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                  {lesson.lesson_number}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {lesson.level}
                </span>
              </div>

              {/* Lesson Title */}
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {lesson.title}
              </h3>

              {/* Description */}
              {lesson.description && (
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {lesson.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{lesson.word_count}</span>
                  <span>words</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{lesson.total_exercises}</span>
                  <span>exercises</span>
                </div>
              </div>

              {/* Words Preview (first 3) */}
              {lesson.words.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Words:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lesson.words.slice(0, 3).map((word, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {word}
                      </span>
                    ))}
                    {lesson.words.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{lesson.words.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {lessons.length === 0 && (
          <div className="card text-center">
            <p className="text-gray-500">
              No lessons available yet. Check your database connection.
            </p>
          </div>
        )}
      </section>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="card mt-8 bg-gray-50">
          <summary className="cursor-pointer font-medium text-gray-700">
            Debug Info (Development Only)
          </summary>
          <pre className="mt-4 overflow-auto rounded bg-white p-4 text-xs">
            {JSON.stringify(lessons, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

/**
 * Metadata for SEO
 */
export const metadata = {
  title: 'Lessons - Chechen Language App',
  description: 'Browse all A1 level lessons for learning Chechen language',
}
