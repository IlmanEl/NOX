/**
 * Lesson Page - Dynamic Route
 *
 * Server Component that loads lesson and exercises data
 * Then passes to client component for interactive game loop
 */

import { notFound } from 'next/navigation'
import { getLessonById } from '@/features/lessons/services/lessons.service'
import { getExercisesByLessonId } from '@/features/exercises/services/exercises.service'
import { LessonPlayer } from '@/components/lesson-player'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const lessonId = parseInt(id, 10)

  if (isNaN(lessonId)) {
    notFound()
  }

  // Fetch lesson and exercises on server
  const [lesson, exercises] = await Promise.all([
    getLessonById(lessonId),
    getExercisesByLessonId(lessonId),
  ])

  if (!lesson) {
    notFound()
  }

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Упражнения скоро появятся
          </h2>
          <p className="text-gray-600">
            Этот урок пока не содержит упражнений
          </p>
        </div>
      </div>
    )
  }

  return <LessonPlayer lesson={lesson} exercises={exercises} />
}
