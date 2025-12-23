/**
 * Phrasebook Category Page
 *
 * Shows phrases for a specific category
 */

import Link from 'next/link'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { phrasebookCategories } from '@/features/phrasebook/config/categories'
import { getPhrasesByCategory } from '@/features/phrasebook/services/phrasebook.service'
import { notFound } from 'next/navigation'

export default async function PhrasebookCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params

  // Find category
  const category = phrasebookCategories.find(c => c.id === categoryId)
  if (!category) {
    notFound()
  }

  // Fetch phrases
  const phrases = await getPhrasesByCategory(category.dbCategories)

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <header className="space-y-4">
        <Link
          href="/phrasebook"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={22} strokeWidth={2.5} className="text-gray-700" />
        </Link>

        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} text-3xl shadow-lg`}>
            {category.icon}
          </div>
          <div>
            <h1 className="text-[36px] font-black leading-tight text-gray-900">
              {category.title}
            </h1>
            <p className="text-sm font-semibold text-gray-600">
              {phrases.length} {phrases.length === 1 ? 'фраза' : phrases.length < 5 ? 'фразы' : 'фраз'}
            </p>
          </div>
        </div>
      </header>

      {/* Phrases List */}
      <section className="space-y-3">
        {phrases.length > 0 ? (
          phrases.map((phrase) => (
            <div
              key={phrase.id}
              className="group overflow-hidden rounded-2xl bg-white p-5 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Chechen Phrase */}
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{phrase.ce}</h3>
                    <button className="rounded-full p-1.5 transition-colors hover:bg-gray-100">
                      <Volume2 size={18} className="text-gray-500" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Russian Translation */}
                  <p className="text-base font-semibold text-gray-600">{phrase.ru}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-white p-8 shadow-card">
            <div className="text-center">
              <span className="mb-4 inline-block text-6xl">{category.icon}</span>
              <h3 className="mb-2 text-xl font-black text-gray-900">Нет фраз</h3>
              <p className="text-sm font-medium text-gray-600">
                В этой категории пока нет фраз
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const category = phrasebookCategories.find(c => c.id === categoryId)

  if (!category) {
    return {
      title: 'Категория не найдена',
    }
  }

  return {
    title: `${category.title} - Разговорник`,
    description: category.description,
  }
}
