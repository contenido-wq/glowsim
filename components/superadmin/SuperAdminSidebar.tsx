'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, BarChart2, LogOut, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/superadmin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/superadmin/dashboard/negocios', icon: Building2, label: 'Negocios' },
  { href: '/superadmin/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/superadmin/login')
    router.refresh()
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #16233a 0%, #111a2c 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo + badge */}
      <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-baseline gap-0 mb-4">
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'white' }}>glow</span>
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#c9a876' }}>sim</span>
        </div>
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-medium"
          style={{
            background: 'rgba(201,168,118,0.15)',
            color: '#c9a876',
            border: '1px solid rgba(201,168,118,0.3)',
          }}
        >
          Superadmin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/superadmin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={
                active
                  ? {
                      color: '#ffffff',
                      background: 'rgba(255,255,255,0.12)',
                      
                      paddingLeft: '12px',
                      paddingRight: '12px',
                    }
                  : {
                      color: 'rgba(255,255,255,0.55)',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                    }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={active ? { color: '#c9a876' } : {}} />
              {label}
            </Link>
          )
        })}

        {/* Acceso rápido */}
        <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '12px' }}>
          <Link
            href="/superadmin/dashboard/negocios/nuevo"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            <Plus className="w-4 h-4" />
            Nuevo negocio
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
