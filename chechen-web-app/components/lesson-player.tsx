'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, X, Award } from 'lucide-react'
import type { PublicLesson } from '@/features/lessons/types/dto'
import type { PublicExercise } from '@/features/exercises/types/exercise.types'

/**
 * Lesson Player Component
 *
 * Interactive game loop for completing lesson exercises
 * Beautiful mobile-first design with smooth animations
 */

interface LessonPlayerProps {
  lesson: PublicLesson
  exercises: PublicExercise[]
}

type AnswerState = 'idle' | 'correct' | 'incorrect'

export function LessonPlayer({ lesson, exercises }: LessonPlayerProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [correctCount, setCorrectCount] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100

  const handleAnswerSelect = (answer: string) => {
    if (answerState !== 'idle') return // Prevent multiple selections
    setSelectedAnswer(answer)
  }

  const handleSubmit = async () => {
    if (!selectedAnswer || answerState !== 'idle') return

    // TODO: Call API to validate answer on server
    // For now, we'll use mock validation
    // In production, call validateExerciseAnswer from server action

    // Mock: assume first option is correct for demo
    const isCorrect = currentExercise.options?.[0] === selectedAnswer

    setAnswerState(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
    }

    // Auto-advance after delay
    setTimeout(() => {
      handleNext()
    }, 1500)
  }

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setAnswerState('idle')
    } else {
      setShowResults(true)
    }
  }

  if (showResults) {
    const percentage = Math.round((correctCount / exercises.length) * 100)
    const isPerfect = percentage === 100

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <div className="w-full space-y-6 text-center">
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
          >
            <Award size={48} className="text-white" strokeWidth={2.5} />
          </motion.div>

          {/* Results */}
          <div>
            <h2 className="mb-2 text-3xl font-black text-gray-900">
              {isPerfect ? 'Отлично! 🎉' : 'Урок завершен!'}
            </h2>
            <p className="text-lg text-gray-600">
              Правильных ответов: {correctCount} из {exercises.length}
            </p>
          </div>

          {/* Score */}
          <div className="mx-auto w-full max-w-xs rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-5xl font-black text-gray-900">
              {percentage}%
            </div>
            <div className="text-sm font-medium text-gray-500">
              Твой результат
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 text-base font-bold text-white shadow-lg"
            >
              Вернуться к урокам
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentIndex(0)
                setCorrectCount(0)
                setShowResults(false)
                setSelectedAnswer(null)
                setAnswerState('idle')
              }}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 text-base font-bold text-gray-700"
            >
              Пройти еще раз
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="text-sm font-bold text-gray-600">
          {currentIndex + 1} / {exercises.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Exercise Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Question */}
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Вопрос {currentIndex + 1}
            </p>
            <h2 className="text-2xl font-black leading-tight text-gray-900">
              {currentExercise.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentExercise.options?.map((option, idx) => {
              const isSelected = selectedAnswer === option
              const showFeedback = isSelected && answerState !== 'idle'
              const isCorrect = answerState === 'correct'
              const isIncorrect = answerState === 'incorrect'

              return (
                <motion.button
                  key={idx}
                  whileHover={answerState === 'idle' ? { scale: 1.02 } : {}}
                  whileTap={answerState === 'idle' ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={answerState !== 'idle'}
                  className={`relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left font-semibold transition-all ${
                    showFeedback && isCorrect
                      ? 'border-green-500 bg-green-50'
                      : showFeedback && isIncorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Feedback Icon */}
                  {showFeedback && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {isCorrect ? (
                        <Check
                          size={24}
                          className="text-green-600"
                          strokeWidth={3}
                        />
                      ) : (
                        <X size={24} className="text-red-600" strokeWidth={3} />
                      )}
                    </motion.div>
                  )}

                  <span
                    className={
                      showFeedback && isCorrect
                        ? 'text-green-900'
                        : showFeedback && isIncorrect
                          ? 'text-red-900'
                          : isSelected
                            ? 'text-blue-900'
                            : 'text-gray-900'
                    }
                  >
                    {option}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: selectedAnswer ? 1.02 : 1 }}
            whileTap={{ scale: selectedAnswer ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={!selectedAnswer || answerState !== 'idle'}
            className={`w-full rounded-2xl py-4 text-base font-bold text-white shadow-lg transition-all ${
              selectedAnswer && answerState === 'idle'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl'
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            Проверить
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
