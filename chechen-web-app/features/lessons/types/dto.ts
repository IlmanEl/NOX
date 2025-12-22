/**
 * Data Transfer Objects (DTOs) for Lessons Feature
 *
 * These types define the PUBLIC API surface.
 * NEVER expose raw database types to the UI layer.
 *
 * Security Note: Admin-only fields (notes, online_sources, etc.)
 * are explicitly excluded from these DTOs.
 */

/**
 * Public Lesson DTO
 *
 * This is what the UI receives. No sensitive data included.
 */
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
}

/**
 * Lesson with Progress DTO
 *
 * Combines lesson data with user progress
 */
export interface LessonWithProgress extends PublicLesson {
  progress: {
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed'
    exercises_completed: number
    accuracy: number | null
    xp_earned: number | null
  } | null
}

/**
 * Lessons List Response
 *
 * Paginated response for lessons list
 */
export interface LessonsListResponse {
  lessons: LessonWithProgress[]
  total: number
  page: number
  pageSize: number
}
