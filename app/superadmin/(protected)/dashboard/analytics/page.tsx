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
        <h1 className="text-xl font-bold" style={{ color: '#0D1E2C' }}>Analytics Global</h1>
        <p className="text-sm" style={{ color: '#6B8194' }}>Simulaciones completas este mes</p>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #EBF2F5' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#9AAAB8' }}>Negocio</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: '#9AAAB8' }}>Simulaciones</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((biz) => (
              <tr key={biz.id} style={{ borderBottom: '1px solid #EBF2F5' }} className="last:border-0">
                <td className="px-4 py-3" style={{ color: '#0D1E2C' }}>{biz.name}</td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: '#4A9BB0' }}>{biz.sims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
