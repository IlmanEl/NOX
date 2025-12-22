'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, X, Award } from 'lucide-react'
import type { PublicLesson } from '@/features/lessons/types/dto'
import type { PublicExercise } from '@/features/exercises/types/exercise.types'

/**
 * Lesson Player Component
 *
 * Duolingo-style interactive game loop
 * Supports: multiple_choice and typing exercises
 * Features: Green "Check" button, smooth animations, proper feedback
 */

interface LessonPlayerProps {
  lesson: PublicLesson
  exercises: PublicExercise[]
}

type AnswerState = 'idle' | 'correct' | 'incorrect'

export function LessonPlayer({ lesson, exercises }: LessonPlayerProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [correctCount, setCorrectCount] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100
  const isTypingExercise = currentExercise.exercise_type === 'typing'
  const currentAnswer = isTypingExercise ? typedAnswer.trim() : selectedAnswer

  // Auto-focus input for typing exercises
  useEffect(() => {
    if (isTypingExercise && inputRef.current && answerState === 'idle') {
      inputRef.current.focus()
    }
  }, [currentIndex, isTypingExercise, answerState])

  const handleAnswerSelect = (answer: string) => {
    if (answerState !== 'idle') return
    setSelectedAnswer(answer)
  }

  const handleSubmit = async () => {
    if (!currentAnswer || answerState !== 'idle') return

    // TODO: Call API to validate answer on server
    // For now, mock validation
    const isCorrect = isTypingExercise
      ? currentExercise.correct_answer?.toLowerCase() === typedAnswer.toLowerCase().trim()
      : currentExercise.correct_answer === selectedAnswer

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
      setTypedAnswer('')
      setAnswerState('idle')
    } else {
      // TODO: Save progress to Supabase before showing results
      setShowResults(true)
    }
  }

  // Handle Enter key for submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentAnswer && answerState === 'idle') {
      handleSubmit()
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
              {isPerfect ? 'Отлично!' : 'Урок завершен!'}
            </h2>
            <p className="text-lg font-medium text-gray-600">
              Правильных ответов: {correctCount} из {exercises.length}
            </p>
          </div>

          {/* Score */}
          <div className="mx-auto w-full max-w-xs rounded-3xl bg-white p-8 shadow-card">
            <div className="mb-2 text-6xl font-black text-gray-900">
              {percentage}%
            </div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Твой результат
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="w-full rounded-2xl bg-duo-500 py-4 text-base font-bold text-white shadow-lg hover:bg-duo-600"
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
                setTypedAnswer('')
                setAnswerState('idle')
              }}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 text-base font-bold text-gray-700 hover:bg-gray-50"
            >
              Пройти еще раз
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={22} strokeWidth={2.5} className="text-gray-700" />
        </button>
        <div className="text-sm font-bold text-gray-600">
          {currentIndex + 1} / {exercises.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full bg-duo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Exercise Content */}
      <div className="flex-1">
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
            <div className="rounded-3xl bg-white p-8 shadow-card">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Вопрос {currentIndex + 1}
              </p>
              <h2 className="text-2xl font-black leading-tight text-gray-900">
                {currentExercise.question}
              </h2>
            </div>

            {/* Answer Input Area */}
            {isTypingExercise ? (
              /* Typing Exercise */
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={answerState !== 'idle'}
                  placeholder="Введите ваш ответ..."
                  className={`w-full rounded-2xl border-2 px-6 py-4 text-lg font-semibold transition-all focus:outline-none ${
                    answerState === 'correct'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : answerState === 'incorrect'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 bg-white text-gray-900 focus:border-duo-500'
                  }`}
                />
                {answerState === 'incorrect' && currentExercise.correct_answer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-green-500 bg-green-50 p-4"
                  >
                    <p className="text-sm font-semibold text-green-900">
                      Правильный ответ: {currentExercise.correct_answer}
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Multiple Choice */
              <div className="space-y-3">
                {currentExercise.options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectOption = option === currentExercise.correct_answer
                  const showFeedback = answerState !== 'idle'
                  const shouldHighlightCorrect = showFeedback && isCorrectOption
                  const shouldHighlightIncorrect = showFeedback && isSelected && !isCorrectOption

                  return (
                    <motion.button
                      key={idx}
                      whileHover={answerState === 'idle' ? { scale: 1.01 } : {}}
                      whileTap={answerState === 'idle' ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={answerState !== 'idle'}
                      className={`relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left text-base font-bold transition-all ${
                        shouldHighlightCorrect
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : shouldHighlightIncorrect
                            ? 'border-red-500 bg-red-50 text-red-900'
                            : isSelected
                              ? 'border-duo-500 bg-duo-50 text-duo-900'
                              : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {/* Feedback Icon */}
                      {showFeedback && (isCorrectOption || isSelected) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-5 top-1/2 -translate-y-1/2"
                        >
                          {shouldHighlightCorrect ? (
                            <Check size={26} className="text-green-600" strokeWidth={3} />
                          ) : shouldHighlightIncorrect ? (
                            <X size={26} className="text-red-600" strokeWidth={3} />
                          ) : null}
                        </motion.div>
                      )}

                      <span className="block pr-10">{option}</span>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom: Check Button */}
      <div className="sticky bottom-0 left-0 right-0 mt-6 bg-gradient-to-t from-gray-50 pt-4">
        <motion.button
          whileHover={{ scale: currentAnswer ? 1.02 : 1 }}
          whileTap={{ scale: currentAnswer ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!currentAnswer || answerState !== 'idle'}
          className={`w-full rounded-2xl py-4 text-base font-bold uppercase tracking-wide text-white shadow-lg transition-all ${
            currentAnswer && answerState === 'idle'
              ? 'bg-duo-500 hover:bg-duo-600 hover:shadow-xl'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
        >
          {answerState === 'idle' ? 'Проверить' : answerState === 'correct' ? 'Правильно!' : 'Неправильно'}
        </motion.button>
      </div>
    </div>
  )
}
