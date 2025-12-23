/**
 * Dictionary Types
 *
 * Types for vocabulary dictionary entries
 */

export interface DictionaryEntry {
  id: string
  ce: string // Chechen word
  ru: string // Russian translation
  type: 'word' | 'phrase' | 'proverb'
  category: string | null
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | null
  difficulty: number | null
  frequency: 'very_high' | 'high' | 'medium' | 'low' | null
  is_verified: boolean
  class: string | null
  created_at: string
}

export interface DictionaryFilters {
  search?: string
  category?: string
  type?: 'word' | 'phrase' | 'proverb'
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2'
  limit?: number
  offset?: number
}
