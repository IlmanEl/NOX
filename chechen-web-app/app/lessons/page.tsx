/**
 * Lessons Page - List of all lessons
 *
 * Shows beautiful lesson cards with progress
 */

import { getLessonsA1 } from '@/features/lessons/services/lessons.service'
import { LessonCard } from '@/components/lesson-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function LessonsPage() {
  const lessons = await getLessonsA1()

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <header className="space-y-4">
        <Link
          href="/"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={22} strokeWidth={2.5} className="text-gray-700" />
        </Link>

        <div>
          <h1 className="text-[42px] font-black leading-[1.1] tracking-tight text-gray-900">
            Уроки
          </h1>
          <p className="text-sm font-medium text-gray-600">
            {lessons.length} уроков от A1 до B2
          </p>
        </div>
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

export const metadata = {
  title: 'Уроки - Чеченский язык',
  description: 'Все уроки чеченского языка от A1 до B2',
}
