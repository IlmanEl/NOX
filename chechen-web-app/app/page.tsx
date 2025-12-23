/**
 * Home Page - Module Selection
 *
 * Beautiful modular home page inspired by modern language learning apps
 * User selects their learning mode: Lessons, Daily Phrases, Games, Dictionary
 */

import Link from 'next/link'
import { BookOpen, MessageSquare, Gamepad2, BookMarked, TrendingUp, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Привет! 👋</p>
            <h1 className="text-[36px] font-black leading-tight tracking-tight text-gray-900">
              Чеченский язык
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl font-black text-gray-900">0</span>
          </div>
        </div>
        <p className="text-base font-medium text-gray-600">
          Выбери свой путь обучения
        </p>
      </header>

      {/* Learning Modules Grid */}
      <section className="grid gap-4">
        {/* Module 1: Lessons */}
        <Link href="/lessons">
          <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl">
                  <BookOpen size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-xl">
                  <span className="text-sm font-bold text-white">269 уроков</span>
                </div>
              </div>

              <h2 className="mb-2 text-[28px] font-black leading-tight text-white">
                Уроки
              </h2>
              <p className="text-sm font-semibold text-white/80">
                Изучай язык шаг за шагом от A1 до B2
              </p>
            </div>
          </div>
        </Link>

        {/* Module 2: Daily Phrases */}
        <Link href="/phrasebook">
          <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl">
                  <MessageSquare size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-xl">
                  <span className="text-sm font-bold text-white">1,522 фразы</span>
                </div>
              </div>

              <h2 className="mb-2 text-[28px] font-black leading-tight text-white">
                Фразы на каждый день
              </h2>
              <p className="text-sm font-semibold text-white/80">
                Свадьба, похороны, в гостях - готовые фразы
              </p>
            </div>
          </div>
        </Link>

        {/* Module 3: Game Modes - Two columns */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/games/flashcards">
            <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-purple-400 to-purple-600 p-5 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl">
                  <Gamepad2 size={24} className="text-white" strokeWidth={2.5} />
                </div>

                <h3 className="mb-1 text-lg font-black text-white">
                  Карточки
                </h3>
                <p className="text-xs font-semibold text-white/75">
                  Быстрое повторение
                </p>
              </div>
            </div>
          </Link>

          <Link href="/games/quiz">
            <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-green-400 to-emerald-600 p-5 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl">
                  <TrendingUp size={24} className="text-white" strokeWidth={2.5} />
                </div>

                <h3 className="mb-1 text-lg font-black text-white">
                  Квиз
                </h3>
                <p className="text-xs font-semibold text-white/75">
                  Проверь знания
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Module 4: Dictionary */}
        <Link href="/dictionary">
          <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl">
                  <BookMarked size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-xl">
                  <span className="text-sm font-bold text-white">2,904 слов</span>
                </div>
              </div>

              <h2 className="mb-2 text-[28px] font-black leading-tight text-white">
                Словарь
              </h2>
              <p className="text-sm font-semibold text-white/80">
                Полный словарь с переводами и примерами
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* Daily Challenge Banner */}
      <section className="rounded-[28px] bg-gradient-to-br from-purple-100 to-pink-100 p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
            <Award size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-black text-gray-900">
              Daily Challenge
            </h3>
            <p className="text-sm font-semibold text-gray-600">
              0/5 заданий выполнено сегодня
            </p>
          </div>
          <button className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-700 active:scale-95">
            Начать
          </button>
        </div>
      </section>
    </div>
  )
}

/**
 * Metadata for SEO
 */
export const metadata = {
  title: 'Чеченский язык - Главная',
  description: 'Изучай чеченский язык: уроки, фразы, игры и словарь',
}
