/**
 * Exercise Types and DTOs
 *
 * Public data transfer objects for exercises
 */

export type ExerciseType = 'multiple_choice' | 'typing' | 'matching'

/**
 * Public Exercise DTO
 *
 * This is what the UI receives - no sensitive data
 */
export interface PublicExercise {
  id: number
  lesson_id: number
  question: string
  options: string[] | null
  type: ExerciseType
  difficulty: number | null
  // Note: correct_answer is NOT included for security
  // It will be validated on the server
}

/**
 * Exercise with Answer (for validation on server)
 */
export interface ExerciseWithAnswer extends PublicExercise {
  correct_answer: string
}

/**
 * User's answer submission
 */
export interface ExerciseSubmission {
  exercise_id: number
  user_answer: string
  time_spent_ms?: number
}

/**
 * Result of answer validation
 */
export interface ExerciseResult {
  is_correct: boolean
  correct_answer: string
  user_answer: string
  feedback?: string
}
