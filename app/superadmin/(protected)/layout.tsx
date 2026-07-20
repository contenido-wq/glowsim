import { createClient } from '@/lib/supabase/server'
import { SuperAdminSidebar } from '@/components/superadmin/SuperAdminSidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // TEMP: auth check disabled for local access, re-enable before deploying
  await supabase.auth.getSession()

  return (
    <div
      className="min-h-screen p-3 lg:p-6"
      style={{
        background:
          'radial-gradient(1200px 600px at 15% -10%, rgba(74,155,176,0.16), transparent), radial-gradient(1000px 500px at 100% 100%, rgba(107,63,217,0.14), transparent), #08080c',
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
          <SuperAdminSidebar />
        </div>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  )
}
