'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Target } from 'lucide-react'
import type { PublicLesson } from '@/features/lessons/types/lesson.types'

/**
 * Lesson Card Component
 *
 * Beautiful Duolingo-style card inspired by app-v2.jsx
 * Features: Background images, glassmorphism, capsule progress bar
 */

interface LessonCardProps {
  lesson: PublicLesson
  index: number
}

// Background images mapping
const backgroundImages = [
  '/abstract-second.png',
  '/abstract-first.png',
  '/abstract-green.png',
  '/Gemini_Generated_Image_sakktfsakktfsakk.png',
]

export function LessonCard({ lesson, index }: LessonCardProps) {
  const backgroundImage = backgroundImages[index % backgroundImages.length]
  const progress = 0 // TODO: Get from user_progress table

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/lesson/${lesson.id}`}>
        <div className="group relative overflow-hidden rounded-[40px] shadow-card transition-all hover:shadow-card-hover">
          {/* Card Background with Image */}
          <div
            className="relative h-[400px] bg-cover bg-center p-6"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {/* Level Badge - Top Right */}
            <div className="absolute right-4 top-4">
              <span className="rounded-full border-2 border-white/40 bg-white/22 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-xl">
                {lesson.level}
              </span>
            </div>

            {/* Title - Top Left */}
            <h3 className="absolute left-6 top-14 right-6 text-[30px] font-black leading-[1.13] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] [text-shadow:_0_14px_22px_rgba(0,0,0,0.18),_0_8px_24px_rgba(0,0,0,0.12)]">
              {lesson.title}
            </h3>

            {/* Capsule Progress Bar - Middle Left */}
            <div className="absolute left-6 top-[200px] flex items-end gap-3">
              {/* Vertical Capsule */}
              <div className="flex h-24 w-14 items-end justify-center rounded-[28px] border-[1.5px] border-white/50 bg-white/25 p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
                <div className="flex h-full w-7 flex-col justify-end overflow-hidden rounded-[14px] bg-white/20">
                  <motion.div
                    className="w-full rounded-xl bg-white shadow-[0_-2px_12px_rgba(255,255,255,0.4)]"
                    initial={{ height: 0 }}
                    animate={{ height: `${progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>

              {/* Progress Text */}
              <div className="flex flex-col gap-0.5">
                <div className="text-lg font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] [text-shadow:_0_2px_6px_rgba(0,0,0,0.12)]">
                  {progress}%
                </div>
                <div className="text-[11px] font-semibold text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.08)]">
                  пройдено
                </div>
              </div>
            </div>

            {/* Stats - Bottom Left */}
            <div className="absolute bottom-6 left-6 flex gap-2.5">
              <div className="flex items-center gap-1.5 rounded-[18px] border-[1.5px] border-white/35 bg-white/22 px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                <BookOpen size={14} strokeWidth={2.5} className="text-white" />
                <span className="text-[13px] font-bold text-white">
                  {lesson.word_count} слов
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-[18px] border-[1.5px] border-white/35 bg-white/22 px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                <Target size={14} strokeWidth={2.5} className="text-white" />
                <span className="text-[13px] font-bold text-white">
                  {lesson.total_exercises} задач
                </span>
              </div>
            </div>

            {/* Lesson Number Button - Bottom Right */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-3 right-3 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/97 shadow-button"
            >
              <span className="text-2xl font-bold text-gray-700">
                #{lesson.lesson_number}
              </span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
