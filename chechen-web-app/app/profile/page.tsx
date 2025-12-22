/**
 * Profile Page
 *
 * User profile with statistics and achievements
 * Duolingo-style design
 */

import { User, Award, Flame, Target, TrendingUp } from 'lucide-react'

// Mock data - TODO: Replace with Supabase user_progress
const stats = {
  totalXP: 1250,
  streak: 7,
  lessonsCompleted: 5,
  accuracy: 87,
}

const achievements = [
  {
    id: 1,
    title: 'Первый урок',
    description: 'Завершил первый урок',
    icon: '🎯',
    unlocked: true,
  },
  {
    id: 2,
    title: 'Неделя подряд',
    description: 'Занимался 7 дней подряд',
    icon: '🔥',
    unlocked: true,
  },
  {
    id: 3,
    title: 'Отличник',
    description: 'Набрал 100% в уроке',
    icon: '⭐',
    unlocked: false,
  },
]

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-duo-400 to-duo-600 shadow-lg">
            <User size={36} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-gray-900">Мой профиль</h1>
            <p className="text-sm font-medium text-gray-600">
              Продолжай в том же духе!
            </p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total XP */}
        <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-5 shadow-card">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Award size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalXP}</div>
          <div className="text-sm font-bold text-white/90">Всего XP</div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-5 shadow-card">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Flame size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-3xl font-black text-white">{stats.streak}</div>
          <div className="text-sm font-bold text-white/90">Дней подряд</div>
        </div>

        {/* Lessons Completed */}
        <div className="rounded-2xl bg-gradient-to-br from-duo-400 to-duo-600 p-5 shadow-card">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Target size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-3xl font-black text-white">
            {stats.lessonsCompleted}
          </div>
          <div className="text-sm font-bold text-white/90">Уроков пройдено</div>
        </div>

        {/* Accuracy */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-5 shadow-card">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <TrendingUp size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-3xl font-black text-white">{stats.accuracy}%</div>
          <div className="text-sm font-bold text-white/90">Точность</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Достижения</h2>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`overflow-hidden rounded-2xl p-5 shadow-card transition-all ${
                achievement.unlocked
                  ? 'bg-white hover:shadow-card-hover'
                  : 'bg-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-0.5 text-lg font-black text-gray-900">
                    {achievement.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-duo-500">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Button */}
      <button className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 text-base font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md">
        Настройки
      </button>
    </div>
  )
}

/**
 * Metadata for SEO
 */
export const metadata = {
  title: 'Профиль - Chechen Language App',
  description: 'View your learning progress and achievements',
}
