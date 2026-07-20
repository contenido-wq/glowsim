import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { MetricsCards } from '@/components/admin/MetricsCards'
import type { MetricsSummary } from '@/types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug, custom_domain')
    .eq('id', businessId!)
    .single()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: events } = await supabase
    .from('sessions_log')
    .select('event_type')
    .eq('business_id', businessId!)
    .gte('created_at', startOfMonth.toISOString())

  const metrics: MetricsSummary = {
    visits: events?.filter((e: { event_type: string }) => e.event_type === 'visit').length ?? 0,
    simulation_starts: events?.filter((e: { event_type: string }) => e.event_type === 'simulation_start').length ?? 0,
    simulation_completes: events?.filter((e: { event_type: string }) => e.event_type === 'simulation_complete').length ?? 0,
    whatsapp_clicks: events?.filter((e: { event_type: string }) => e.event_type === 'whatsapp_click').length ?? 0,
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Panel de control
        </p>
        <h1 className="text-2xl font-bold text-white">{business?.name}</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Métricas del mes actual
        </p>
      </div>
      <MetricsCards
        metrics={metrics}
        businessSlug={business?.slug ?? ''}
        customDomain={business?.custom_domain ?? null}
      />
    </div>
  )
}
