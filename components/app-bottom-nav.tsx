'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, BookOpen, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { href: '/quotes', label: 'Devis', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/catalog', label: 'Catalogue', icon: BookOpen },
  { href: '/settings', label: 'Réglages', icon: Settings },
]

export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch justify-around px-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[52px] py-1.5',
                active ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-blue-600" aria-hidden="true" />}
              <Icon className={cn('h-5 w-5', active && 'text-blue-600')} />
              <span className="text-[10.5px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
