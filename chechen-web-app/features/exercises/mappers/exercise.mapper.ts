/**
 * Exercise Mapper
 *
 * Converts database types to public DTOs
 * Security layer - removes sensitive data
 */

import type { Database } from '@/lib/supabase/database.types'
import type { PublicExercise, ExerciseWithAnswer } from '../types/exercise.types'

type DbExercise = Database['public']['Tables']['exercises']['Row']

/**
 * Convert DB exercise to public DTO (without correct answer)
 *
 * @security Removes correct_answer field for client-side use
 */
export function toPublicExercise(dbExercise: DbExercise): PublicExercise {
  return {
    id: dbExercise.id,
    lesson_id: dbExercise.lesson_id,
    question: dbExercise.question,
    options: dbExercise.options,
    type: dbExercise.type as PublicExercise['type'],
    difficulty: dbExercise.difficulty,
  }
}

/**
 * Convert array of DB exercises to public DTOs
 */
export function toPublicExercises(dbExercises: DbExercise[]): PublicExercise[] {
  return dbExercises.map(toPublicExercise)
}

/**
 * Convert DB exercise to exercise with answer (server-side only)
 *
 * @security Only use this on the server for validation
 */
export function toExerciseWithAnswer(dbExercise: DbExercise): ExerciseWithAnswer {
  return {
    ...toPublicExercise(dbExercise),
    correct_answer: dbExercise.correct_answer,
  }
}
