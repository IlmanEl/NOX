/**
 * Phrasebook Page - Category Selection
 *
 * Shows categories of phrases organized by real-life situations
 */

import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { phrasebookCategories } from '@/features/phrasebook/config/categories'
import { getPhraseCounts } from '@/features/phrasebook/services/phrasebook.service'

export default async function PhrasebookPage() {
  // Get phrase counts for each category
  const categoriesWithCounts = await Promise.all(
    phrasebookCategories.map(async (category) => ({
      ...category,
      phraseCount: await getPhraseCounts(category.dbCategories)
    }))
  )

  // Filter out empty categories
  const activeCategories = categoriesWithCounts.filter(cat => cat.phraseCount > 0)

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <header className="space-y-4">
        <Link
          href="/"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={22} strokeWidth={2.5} className="text-gray-700" />
        </Link>

        <div>
          <h1 className="text-[42px] font-black leading-[1.1] tracking-tight text-gray-900">
            Разговорник
          </h1>
          <p className="text-sm font-medium text-gray-600">
            Фразы для реальных жизненных ситуаций
          </p>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="grid gap-4">
        {activeCategories.length > 0 ? (
          activeCategories.map((category, index) => (
            <Link key={category.id} href={`/phrasebook/${category.id}`}>
              <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${category.gradient} p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]`}>
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-xl">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-black leading-tight text-white">
                          {category.title}
                        </h2>
                      </div>
                    </div>
                    <p className="mb-3 text-sm font-semibold text-white/80">
                      {category.description}
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1.5 backdrop-blur-xl">
                      <MessageSquare size={14} className="text-white" strokeWidth={2.5} />
                      <span className="text-xs font-bold text-white">
                        {category.phraseCount} {category.phraseCount === 1 ? 'фраза' : category.phraseCount < 5 ? 'фразы' : 'фраз'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-md">
            <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
            <h3 className="mb-2 text-xl font-black text-gray-900">Нет фраз</h3>
            <p className="text-sm font-medium text-gray-600">
              Фразы пока не добавлены. Проверь подключение к базе данных.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export const metadata = {
  title: 'Разговорник - Чеченский язык',
  description: 'Полезные фразы для реальных жизненных ситуаций',
}
