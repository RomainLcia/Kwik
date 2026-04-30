'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Receipt, Users, BookOpen, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/quotes', label: 'Devis', icon: FileText },
  { href: '/invoices', label: 'Factures', icon: Receipt },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/catalog', label: 'Catalogue', icon: BookOpen },
]

interface AppSidebarProps {
  userEmail: string
  companyName: string
}

export function AppSidebar({ userEmail, companyName }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = companyName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen sticky top-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-gray-900">Kwik</span>
            <p className="text-xs text-gray-400 truncate leading-tight">{companyName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 pb-4 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/settings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-600">{initials}</span>
            </div>
            <span className="truncate text-xs">{userEmail}</span>
            <LogOut className="h-3.5 w-3.5 ml-auto flex-shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  )
}
