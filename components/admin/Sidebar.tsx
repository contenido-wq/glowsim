'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings, List, BarChart2, LogOut, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/dashboard/configuracion', icon: Settings, label: 'Configuración' },
  { href: '/admin/dashboard/procedimientos', icon: List, label: 'Procedimientos' },
  { href: '/admin/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
]

interface SidebarProps {
  businessName: string
  businessSlug: string
}

export function Sidebar({ businessName, businessSlug }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col">
      <div className="p-5 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Admin</p>
        <h2 className="font-semibold text-white truncate">{businessName}</h2>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-800 space-y-0.5">
        <a
          href={`https://${businessSlug}.glowsim.app`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Globe className="w-4 h-4" />
          Ver mi página
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
