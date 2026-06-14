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
    .select('name, slug')
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
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400 text-sm">Métricas del mes actual</p>
      </div>
      <MetricsCards metrics={metrics} businessSlug={business?.slug ?? ''} />
    </div>
  )
}
