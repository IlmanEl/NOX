/**
 * Home Page - Lessons List
 *
 * Beautiful mobile-first lessons page
 * Server Component for optimal performance
 */

import { getLessonsA1 } from '@/features/lessons/services/lessons.service'
import { LessonCard } from '@/components/lesson-card'

export default async function HomePage() {
  const lessons = await getLessonsA1()

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Привет! 👋</p>
        <h1 className="text-4xl font-black leading-tight text-gray-900">
          Уроки
        </h1>
        <p className="text-sm text-gray-600">
          Изучай чеченский язык шаг за шагом
        </p>
      </header>

      {/* Lessons List */}
      <section className="space-y-6">
        {lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <LessonCard key={lesson.id} lesson={lesson} index={index} />
          ))
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-gray-500">
              Уроки пока не добавлены. Проверь подключение к базе данных.
            </p>
          </div>
        )}
      </section>
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
