/**
 * Dictionary Page
 *
 * Beautiful phrasebook with Chechen words and phrases
 * Duolingo-style modern design
 */

import { BookMarked, Volume2, Star } from 'lucide-react'

// Mock data - TODO: Replace with Supabase phrasebook table
const phrases = [
  {
    id: 1,
    chechen: 'Маршалла',
    russian: 'Здравствуй',
    category: 'Приветствия',
  },
  {
    id: 2,
    chechen: 'Баркалла',
    russian: 'Спасибо',
    category: 'Вежливость',
  },
  {
    id: 3,
    chechen: 'Де йиш дац',
    russian: 'Не за что',
    category: 'Вежливость',
  },
  {
    id: 4,
    chechen: 'Хаза вуй',
    russian: 'Как дела?',
    category: 'Приветствия',
  },
  {
    id: 5,
    chechen: 'Дика дерриг',
    russian: 'Очень хорошо',
    category: 'Приветствия',
  },
]

const categories = ['Все', 'Приветствия', 'Вежливость', 'Числа', 'Семья']

export default function DictionaryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <BookMarked size={28} className="text-duo-500" strokeWidth={2.5} />
          <h1 className="text-[42px] font-black leading-[1.1] tracking-tight text-gray-900">
            Словарь
          </h1>
        </div>
        <p className="text-sm font-medium text-gray-600">
          Изучай новые слова и фразы
        </p>
      </header>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`flex-shrink-0 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              category === 'Все'
                ? 'bg-duo-500 text-white shadow-md'
                : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск слов и фраз..."
          className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-duo-500 focus:outline-none"
        />
      </div>

      {/* Phrases List */}
      <div className="space-y-3">
        {phrases.map((phrase, index) => (
          <div
            key={phrase.id}
            className="group overflow-hidden rounded-2xl bg-white p-5 shadow-card transition-all hover:shadow-card-hover"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-xl font-black text-gray-900">
                    {phrase.chechen}
                  </h3>
                  <button className="rounded-full p-1.5 transition-colors hover:bg-gray-100">
                    <Volume2
                      size={18}
                      className="text-gray-500"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
                <p className="text-base font-semibold text-gray-600">
                  {phrase.russian}
                </p>
              </div>
              <button className="rounded-full p-2 transition-colors hover:bg-yellow-50">
                <Star size={20} className="text-gray-300" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-duo-50 px-3 py-1 text-xs font-bold text-duo-700">
                {phrase.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (when no phrases) */}
      {phrases.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-white p-8 shadow-card">
          <div className="text-center">
            <BookMarked
              size={64}
              className="mx-auto mb-4 text-gray-300"
              strokeWidth={1.5}
            />
            <h3 className="mb-2 text-xl font-black text-gray-900">
              Словарь пока пуст
            </h3>
            <p className="text-sm font-medium text-gray-600">
              Скоро здесь появятся слова и фразы
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Metadata for SEO
 */
export const metadata = {
  title: 'Словарь - Chechen Language App',
  description: 'Browse Chechen words and phrases with translations',
}
