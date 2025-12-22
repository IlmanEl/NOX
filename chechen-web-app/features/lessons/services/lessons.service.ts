/**
 * Lessons Service
 *
 * Business logic layer for lessons feature.
 * All data access goes through this service.
 *
 * Architecture:
 * UI → Service → Mapper → Database
 *
 * The UI NEVER accesses the database directly.
 */

import { createSupabaseServer } from '@/lib/supabase/server'
import { toPublicLesson, toPublicLessons, toLessonWithProgress } from '../mappers/lesson.mapper'
import type { PublicLesson, LessonWithProgress } from '../types/dto'

/**
 * Get all lessons for A1 level (MVP)
 *
 * @returns Array of public lesson DTOs
 * @security Returns only public fields via DTO mapping
 */
export async function getLessonsA1(): Promise<PublicLesson[]> {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('level', 'A1')
    .order('lesson_number', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    throw new Error('Failed to fetch lessons')
  }

  // ✅ Security: Convert DB types to public DTOs
  return toPublicLessons(data)
}

/**
 * Get lessons with user progress
 *
 * @param userId - User ID to fetch progress for
 * @returns Lessons with progress information
 */
export async function getLessonsWithProgress(
  userId?: string
): Promise<LessonWithProgress[]> {
  const supabase = await createSupabaseServer()

  // Fetch lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .eq('level', 'A1')
    .order('lesson_number', { ascending: true })

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError)
    throw new Error('Failed to fetch lessons')
  }

  // If no user, return lessons without progress
  if (!userId) {
    return lessons.map((lesson) => toLessonWithProgress(lesson, null))
  }

  // Fetch user progress for all lessons
  const { data: progressData, error: progressError } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)

  if (progressError) {
    console.error('Error fetching progress:', progressError)
    // Continue without progress data
    return lessons.map((lesson) => toLessonWithProgress(lesson, null))
  }

  // Map progress to lessons
  const progressMap = new Map(
    progressData.map((progress) => [progress.lesson_id, progress])
  )

  return lessons.map((lesson) =>
    toLessonWithProgress(lesson, progressMap.get(lesson.id) || null)
  )
}

/**
 * Get a single lesson by ID
 *
 * @param lessonId - Lesson ID
 * @returns Public lesson DTO
 */
export async function getLessonById(lessonId: number): Promise<PublicLesson | null> {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('Error fetching lesson:', error)
    return null
  }

  // ✅ Security: Convert to public DTO
  return toPublicLesson(data)
}
