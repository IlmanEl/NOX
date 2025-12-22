/**
 * Supabase Client - Browser
 *
 * Use this client in Client Components ('use client').
 * This client uses browser cookies for authentication.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { supabaseBrowser } from '@/lib/supabase/client'
 *
 * export function Component() {
 *   const fetchData = async () => {
 *     const { data } = await supabaseBrowser
 *       .from('lessons')
 *       .select('*')
 *   }
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const supabaseBrowser = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
