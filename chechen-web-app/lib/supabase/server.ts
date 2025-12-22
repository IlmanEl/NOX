/**
 * Supabase Client - Server
 *
 * Use this client in Server Components and Server Actions.
 * This client properly handles cookies on the server side.
 *
 * @example
 * ```tsx
 * // app/page.tsx (Server Component)
 * import { createSupabaseServer } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createSupabaseServer()
 *   const { data } = await supabase
 *     .from('lessons')
 *     .select('*')
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
