/**
 * Exercises Service
 *
 * Business logic layer for exercises feature
 */

import { createSupabaseServer } from '@/lib/supabase/server'
import { toPublicExercises, toExerciseWithAnswer } from '../mappers/exercise.mapper'
import type { PublicExercise, ExerciseResult } from '../types/exercise.types'

/**
 * Get all exercises for a specific lesson
 *
 * @param lessonId - Lesson ID
 * @returns Array of public exercise DTOs (without correct answers)
 * @security Returns only public fields via DTO mapping
 */
export async function getExercisesByLessonId(
  lessonId: number
): Promise<PublicExercise[]> {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching exercises:', error)
    throw new Error('Failed to fetch exercises')
  }

  // ✅ Security: Convert to public DTOs (removes correct_answer)
  return toPublicExercises(data)
}

/**
 * Validate user's answer to an exercise
 *
 * @param exerciseId - Exercise ID
 * @param userAnswer - User's submitted answer
 * @returns Validation result with correct answer
 * @security This function runs on the server only
 */
export async function validateExerciseAnswer(
  exerciseId: number,
  userAnswer: string
): Promise<ExerciseResult> {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single()

  if (error || !data) {
    console.error('Error fetching exercise for validation:', error)
    throw new Error('Failed to validate answer')
  }

  const exercise = toExerciseWithAnswer(data)
  const isCorrect = userAnswer.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase()

  return {
    is_correct: isCorrect,
    correct_answer: exercise.correct_answer,
    user_answer: userAnswer,
    feedback: isCorrect ? 'Правильно! 🎉' : 'Неправильно. Попробуй еще раз!',
  }
}
