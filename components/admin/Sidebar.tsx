'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings, List, BarChart2, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPublicUrl } from '@/lib/tenant'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/dashboard/procedimientos', icon: List, label: 'Procedimientos' },
  { href: '/admin/dashboard/configuracion', icon: Settings, label: 'Configuración' },
  { href: '/admin/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
]

interface SidebarProps {
  businessName: string
  businessSlug: string
  customDomain?: string | null
}

export function Sidebar({ businessName, businessSlug, customDomain }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const publicUrl = getPublicUrl({ slug: businessSlug, custom_domain: customDomain })

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
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
      {/* Logo + negocio */}
      <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-baseline gap-0 mb-5">
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'white' }}>glow</span>
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#4A9BB0' }}>sim</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#52C49A', boxShadow: '0 0 8px #52C49A' }}
          />
          <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Admin activo
          </span>
        </div>
        <p className="text-sm font-semibold text-white truncate">{businessName}</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
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
              <Icon className="w-4 h-4 flex-shrink-0" style={active ? { color: '#7EC8DC' } : {}} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <ExternalLink className="w-4 h-4" />
          Ver mi página
        </a>
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
