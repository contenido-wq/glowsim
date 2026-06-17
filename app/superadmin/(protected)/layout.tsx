import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SuperAdminSidebar } from '@/components/superadmin/SuperAdminSidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/superadmin/login')
  if (session.user.email !== process.env.SUPERADMIN_EMAIL) redirect('/admin/login')

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F5F8' }}>
      <div className="hidden lg:flex">
        <SuperAdminSidebar />
      </div>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
