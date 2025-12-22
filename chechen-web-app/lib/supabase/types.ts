/**
 * Type utilities for Supabase
 *
 * Re-exports commonly used types from database.types.ts
 */

export type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

// Helper type for extracting table row types
export type DbTable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

// Helper type for insert operations
export type DbInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

// Helper type for update operations
export type DbUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
