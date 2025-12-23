'use server'

/**
 * Server Action for validating exercise answers
 *
 * This runs on the server and has access to correct_answer
 */

import { validateExerciseAnswer } from '@/features/exercises/services/exercises.service'

export async function validateAnswer(exerciseId: number, userAnswer: string) {
  try {
    const result = await validateExerciseAnswer(exerciseId, userAnswer)
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Error validating answer:', error)
    return {
      success: false,
      error: 'Failed to validate answer',
    }
  }
}
