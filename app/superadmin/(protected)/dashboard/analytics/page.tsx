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
        <p className="text-zinc-400 text-sm">Simulaciones completas este mes</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Negocio</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Simulaciones</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((biz) => (
              <tr key={biz.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3 text-white">{biz.name}</td>
                <td className="px-4 py-3 text-right text-purple-400 font-medium">{biz.sims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
