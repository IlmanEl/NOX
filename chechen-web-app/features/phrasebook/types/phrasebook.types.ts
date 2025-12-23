/**
 * Phrasebook Types
 *
 * Types for phrasebook categories and phrases
 */

export interface PhrasebookCategory {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
  dbCategories: string[] // Categories from database to include
  phraseCount?: number
}

export interface Phrase {
  id: string
  ce: string
  ru: string
  category: string
  type: string
}
