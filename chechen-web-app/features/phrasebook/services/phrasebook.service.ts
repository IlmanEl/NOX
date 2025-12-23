/**
 * Phrasebook Service
 *
 * Business logic for phrasebook feature
 */

import { createSupabaseServer } from '@/lib/supabase/server'
import type { Phrase } from '../types/phrasebook.types'

/**
 * Get phrases for a specific category
 */
export async function getPhrasesByCategory(dbCategories: string[]): Promise<Phrase[]> {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('dictionary')
    .select('id, ce, ru, category, type')
    .eq('type', 'phrase')
    .is('class', null)
    .in('category', dbCategories)
    .order('ru', { ascending: true })

  if (error) {
    console.error('Error fetching phrases:', error)
    return []
  }

  return data || []
}

/**
 * Get phrase count for categories
 */
export async function getPhraseCounts(dbCategories: string[]): Promise<number> {
  const supabase = await createSupabaseServer()

  const { count, error } = await supabase
    .from('dictionary')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'phrase')
    .is('class', null)
    .in('category', dbCategories)

  if (error) {
    console.error('Error counting phrases:', error)
    return 0
  }

  return count || 0
}
