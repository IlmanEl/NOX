/**
 * Dictionary Service
 *
 * Business logic for dictionary feature
 */

import { createSupabaseServer } from '@/lib/supabase/server'
import type { DictionaryEntry, DictionaryFilters } from '../types/dictionary.types'
import { translateCategory } from '../mappers/category.mapper'

/**
 * Get all dictionary entries with optional filters
 */
export async function getDictionaryEntries(
  filters?: DictionaryFilters
): Promise<DictionaryEntry[]> {
  const supabase = await createSupabaseServer()

  let query = supabase
    .from('dictionary')
    .select('*')
    .order('ce', { ascending: true })

  // Filter out grammatical elements (suffixes/prefixes/endings) by default
  // These have either:
  // 1. 'class' field set (like "ду", "ю", "бу", "ву")
  // 2. grammar-related categories
  const grammarCategories = [
    'grammar',
    'grammar_endings',
    'grammar_example',
    'grammar_postposition',
    'class_markers',
    'class_markers_negative'
  ]

  // Only show grammar if specifically requested
  const isGrammarSearch = filters?.category && grammarCategories.includes(filters.category)

  if (!isGrammarSearch) {
    // Exclude entries with class field OR grammar categories
    query = query.is('class', null)

    // Also filter out grammar categories
    for (const grammarCat of grammarCategories) {
      query = query.not('category', 'eq', grammarCat)
    }
  }

  // Apply filters
  if (filters?.search) {
    query = query.or(`ce.ilike.%${filters.search}%,ru.ilike.%${filters.search}%`)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.cefr_level) {
    query = query.eq('cefr_level', filters.cefr_level)
  }

  // Pagination
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching dictionary:', error)
    throw new Error('Failed to fetch dictionary')
  }

  return data || []
}

/**
 * Get unique categories from dictionary (excluding grammar categories)
 */
export async function getDictionaryCategories(): Promise<Array<{ value: string; label: string }>> {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('dictionary')
    .select('category')
    .not('category', 'is', null)
    .is('class', null) // Only get categories from non-grammatical entries

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Get unique categories
  const uniqueCategories = [...new Set(data.map((item) => item.category).filter(Boolean))] as string[]

  // Filter out grammar-related categories
  const filteredCategories = uniqueCategories.filter(cat =>
    !cat.includes('grammar') &&
    !cat.includes('class_markers') &&
    !cat.includes('endings')
  )

  // Map to objects with value and translated label
  return filteredCategories
    .map(cat => ({
      value: cat,
      label: translateCategory(cat)
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru'))
}

/**
 * Get dictionary stats
 */
export async function getDictionaryStats() {
  const supabase = await createSupabaseServer()

  const { count: totalCount } = await supabase
    .from('dictionary')
    .select('*', { count: 'exact', head: true })

  const { count: wordsCount } = await supabase
    .from('dictionary')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'word')

  const { count: phrasesCount } = await supabase
    .from('dictionary')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'phrase')

  return {
    total: totalCount || 0,
    words: wordsCount || 0,
    phrases: phrasesCount || 0,
  }
}
