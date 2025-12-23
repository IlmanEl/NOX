/**
 * Dictionary Page
 *
 * Real dictionary with 2,904 words from database
 * Beautiful search and filtering
 */

import { getDictionaryEntries, getDictionaryCategories } from '@/features/dictionary/services/dictionary.service'
import { translateCategory } from '@/features/dictionary/mappers/category.mapper'
import { BookMarked, Search, Volume2 } from 'lucide-react'
import Link from 'next/link'

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const selectedCategory = params.category || ''

  // Fetch data
  const entries = await getDictionaryEntries({
    search: search || undefined,
    category: selectedCategory || undefined,
    limit: 50,
  })

  const categories = await getDictionaryCategories()

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <BookMarked size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[36px] font-black leading-tight text-gray-900">
              Словарь
            </h1>
            <p className="text-sm font-semibold text-gray-600">
              Чеченско-русский словарь
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <form method="GET" className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
          strokeWidth={2.5}
        />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Найти слово..."
          className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3.5 pl-12 pr-4 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-duo-500 focus:outline-none"
        />
      </form>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/dictionary"
            className={`flex-shrink-0 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              !selectedCategory
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            Все
          </Link>
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.value}
              href={`/dictionary?category=${encodeURIComponent(category.value)}`}
              className={`flex-shrink-0 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
                selectedCategory === category.value
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>
      )}

      {/* Dictionary Entries */}
      <div className="space-y-3">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="group overflow-hidden rounded-2xl bg-white p-5 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Chechen Word */}
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{entry.ce}</h3>
                    <button className="rounded-full p-1.5 transition-colors hover:bg-gray-100">
                      <Volume2 size={18} className="text-gray-500" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Russian Translation */}
                  <p className="mb-3 text-base font-semibold text-gray-600">{entry.ru}</p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    {entry.type && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {entry.type === 'word' ? 'слово' : entry.type === 'phrase' ? 'фраза' : 'пословица'}
                      </span>
                    )}
                    {entry.category && (
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                        {translateCategory(entry.category)}
                      </span>
                    )}
                    {entry.cefr_level && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        {entry.cefr_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-white p-8 shadow-card">
            <div className="text-center">
              <BookMarked size={64} className="mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
              <h3 className="mb-2 text-xl font-black text-gray-900">Ничего не найдено</h3>
              <p className="text-sm font-medium text-gray-600">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export const metadata = {
  title: 'Словарь - Чеченский язык',
  description: 'Полный словарь чеченского языка с переводами и примерами',
}
