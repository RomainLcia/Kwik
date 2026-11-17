'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileText, Receipt, Users, BookOpen, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewQuoteButton } from '@/components/new-quote-button'

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

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Settings; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors',
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
      {label}
    </Link>
  )
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0">

      {/* Marque + entreprise */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-200">
        <div className="w-6 h-6 bg-brand-gradient rounded-[5px] flex items-center justify-center flex-shrink-0">
          <span className="font-display text-white text-[13px] font-bold leading-none">K</span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-gray-900 leading-tight">Kwik</p>
          <p className="text-xs text-gray-500 truncate leading-tight">{companyName}</p>
        </div>
      </div>

      <div className="px-3 pt-4 pb-2">
        <NewQuoteButton className="w-full" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Navigation principale">
        {navItems.map(item => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-0.5">
        <NavLink href="/settings" label="Paramètres" icon={Settings} active={isActive('/settings')} />
        <div className="mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-gray-50"
            title="Se déconnecter"
          >
            <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-gray-600">
              {initials}
            </span>
            <span className="truncate text-xs text-gray-500 group-hover:text-gray-900">{userEmail}</span>
            <LogOut className="h-3.5 w-3.5 ml-auto flex-shrink-0 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </aside>
  )
}
