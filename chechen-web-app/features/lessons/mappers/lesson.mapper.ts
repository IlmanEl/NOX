/**
 * Lesson Mappers
 *
 * These functions convert database types to public DTOs.
 * This is the ONLY place where we decide what data is public.
 *
 * Security Layer: Any fields not explicitly mapped here will not
 * reach the UI, even if they exist in the database.
 */

import type { DbTable } from '@/lib/supabase/types'
import type { PublicLesson, LessonWithProgress } from '../types/dto'

/**
 * Convert database lesson to public DTO
 *
 * @security Admin-only fields are NOT included in the mapping
 */
export function toPublicLesson(dbLesson: DbTable<'lessons'>): PublicLesson {
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
    // NOTE: If 'notes' or 'online_sources' fields exist in DB,
    // they will NOT be included here and thus won't reach the UI
  }
}

/**
 * Convert lesson + progress data to DTO with progress
 */
export function toLessonWithProgress(
  dbLesson: DbTable<'lessons'>,
  userProgress: DbTable<'user_lesson_progress'> | null
): LessonWithProgress {
  const publicLesson = toPublicLesson(dbLesson)

  return {
    ...publicLesson,
    progress: userProgress
      ? {
          status: (userProgress.status as 'locked' | 'unlocked' | 'in_progress' | 'completed') || 'locked',
          exercises_completed: userProgress.exercises_completed || 0,
          accuracy: userProgress.accuracy,
          xp_earned: userProgress.xp_earned,
        }
      : null,
  }
}

/**
 * Batch convert array of lessons
 */
export function toPublicLessons(dbLessons: DbTable<'lessons'>[]): PublicLesson[] {
  return dbLessons.map(toPublicLesson)
}
