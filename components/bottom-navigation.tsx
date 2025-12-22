'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, BookMarked, User } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Bottom Navigation Component
 *
 * Mobile-first navigation bar with smooth animations
 * Styled based on app-v2.jsx reference
 */

const navItems = [
  {
    name: 'Уроки',
    href: '/',
    icon: BookOpen,
  },
  {
    name: 'Словарь',
    href: '/dictionary',
    icon: BookMarked,
    disabled: true, // Coming soon
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: User,
    disabled: true, // Coming soon
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.disabled ? '#' : item.href}
                className={`relative flex flex-col items-center gap-1 rounded-xl px-6 py-2 transition-all ${
                  item.disabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:scale-105 active:scale-95'
                }`}
                aria-disabled={item.disabled}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gray-900"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <Icon
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label */}
                <span
                  className={`relative z-10 text-xs font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Safe area for iOS */}
      <div className="h-safe-bottom bg-white" />
    </nav>
  )
}
