import { createClient } from '@/lib/supabase/server'
import { getBusinesses } from '@/app/actions/superadmin'

export default async function SuperAdminAnalyticsPage() {
  const supabase = await createClient()
  const businesses = await getBusinesses()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: events } = await supabase
    .from('sessions_log')
    .select('business_id')
    .eq('event_type', 'simulation_complete')
    .gte('created_at', startOfMonth.toISOString())

  const countByBusiness: Record<string, number> = {}
  events?.forEach(({ business_id }) => {
    countByBusiness[business_id] = (countByBusiness[business_id] ?? 0) + 1
  })

  const ranked = businesses
    .map((b) => ({ ...b, sims: countByBusiness[b.id] ?? 0 }))
    .sort((a, b) => b.sims - a.sims)

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics Global</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Simulaciones completas este mes</p>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Negocio</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Simulaciones</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((biz) => (
              <tr key={biz.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="last:border-0">
                <td className="px-4 py-3 text-white">{biz.name}</td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: '#7EC8DC' }}>{biz.sims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
