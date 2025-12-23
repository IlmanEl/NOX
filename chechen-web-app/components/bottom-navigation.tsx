'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BookMarked, User, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Bottom Navigation Component
 *
 * Modern circular icon navigation inspired by Drops app (17:35 reference)
 * Clean, minimal, with active state indicators
 */

const navItems = [
  {
    name: 'Главная',
    href: '/',
    icon: Home,
  },
  {
    name: 'Разговорник',
    href: '/phrasebook',
    icon: MessageSquare,
  },
  {
    name: 'Словарь',
    href: '/dictionary',
    icon: BookMarked,
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: User,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  // Check if current path matches
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around px-6 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                {/* Circular Icon Container */}
                <motion.div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                    active
                      ? 'bg-gray-900 shadow-lg'
                      : 'bg-transparent'
                  }`}
                  animate={{
                    scale: active ? 1.05 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <Icon
                    className={`transition-colors ${
                      active ? 'text-white' : 'text-gray-500'
                    }`}
                    size={22}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </motion.div>

                {/* Active Dot Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="h-1 w-1 rounded-full bg-gray-900"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Safe area for iOS */}
      <div className="h-safe-bottom bg-white/80" />
    </nav>
  )
}
