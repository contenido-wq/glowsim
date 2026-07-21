import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'
import { getAdminBusinessId } from '@/app/actions/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // TEMP: auth check disabled for local access, re-enable before deploying
  let business: { name: string; slug: string; custom_domain: string | null } | null = null
  try {
    const businessId = await getAdminBusinessId()
    const { data } = await supabase
      .from('businesses')
      .select('name, slug, custom_domain')
      .eq('id', businessId)
      .single()
    business = data
  } catch {
    business = null
  }
  business ??= { name: 'Dev', slug: 'dev', custom_domain: null }

  return (
    <div
      className="min-h-screen p-3 lg:p-6"
      style={{
        background:
          'radial-gradient(1200px 600px at 15% -10%, rgba(201,168,118,0.12), transparent), radial-gradient(1000px 500px at 100% 100%, rgba(201,168,118,0.08), transparent), #0a0908',
      }}
    >
      <div
        className="flex min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-3rem)] rounded-[28px] overflow-hidden"
        style={{
          background: '#101018',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div className="hidden lg:flex">
          <Sidebar businessName={business.name} businessSlug={business.slug} customDomain={business.custom_domain} />
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
