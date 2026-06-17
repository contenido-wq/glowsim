import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: businessUser } = await supabase
    .from('business_users')
    .select('business_id, businesses(name, slug)')
    .eq('user_id', session.user.id)
    .single()

  if (!businessUser) redirect('/admin/login')

  const business = businessUser.businesses as any

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F5F8' }}>
      <div className="hidden lg:flex">
        <Sidebar businessName={business.name} businessSlug={business.slug} />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
