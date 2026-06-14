import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/superadmin/dashboard', label: 'Overview' },
  { href: '/superadmin/dashboard/negocios', label: 'Negocios' },
  { href: '/superadmin/dashboard/analytics', label: 'Analytics' },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/superadmin/login')
  if (session.user.email !== process.env.SUPERADMIN_EMAIL) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-white text-sm">GlowSim</span>
        <span className="text-xs text-zinc-600 border border-zinc-700 px-2 py-0.5 rounded">superadmin</span>
        <div className="flex gap-4 ml-2">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
