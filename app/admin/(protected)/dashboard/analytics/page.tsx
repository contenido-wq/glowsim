import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'

function groupByDay(events: { created_at: string; event_type: string }[]) {
  const map: Record<string, { visitas: number; simulaciones: number }> = {}
  events.forEach(({ created_at, event_type }) => {
    const date = created_at.slice(5, 10) // MM-DD
    if (!map[date]) map[date] = { visitas: 0, simulaciones: 0 }
    if (event_type === 'visit') map[date].visitas++
    if (event_type === 'simulation_complete') map[date].simulaciones++
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))
}

function groupBySource(events: { utm_source: string | null }[]) {
  const map: Record<string, number> = {}
  events.forEach(({ utm_source }) => {
    const src = utm_source ?? '(directo)'
    map[src] = (map[src] ?? 0) + 1
  })
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const thirtyAgo = new Date()
  thirtyAgo.setDate(thirtyAgo.getDate() - 30)

  const { data: events } = await supabase
    .from('sessions_log')
    .select('event_type, utm_source, created_at')
    .eq('business_id', businessId!)
    .gte('created_at', thirtyAgo.toISOString())
    .order('created_at')

  const chartData = groupByDay(events ?? [])
  const sources = groupBySource((events ?? []).filter((e: { event_type: string; utm_source: string | null; created_at: string }) => e.event_type === 'visit'))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0D1E2C' }}>Analytics</h1>
        <p className="text-sm" style={{ color: '#6B8194' }}>Últimos 30 días</p>
      </div>
      <AnalyticsChart data={chartData} />
      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #EBF2F5' }}>
          <h3 className="text-sm font-medium" style={{ color: '#0D1E2C' }}>Fuentes de tráfico</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #EBF2F5' }}>
              <th className="text-left px-4 py-2 font-medium" style={{ color: '#9AAAB8' }}>Fuente</th>
              <th className="text-right px-4 py-2 font-medium" style={{ color: '#9AAAB8' }}>Visitas</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-6 text-center text-xs" style={{ color: '#9AAAB8' }}>Sin datos aún</td></tr>
            ) : (
              sources.map(({ source, count }) => (
                <tr key={source} style={{ borderBottom: '1px solid #EBF2F5' }} className="last:border-0">
                  <td className="px-4 py-2" style={{ color: '#6B8194' }}>{source}</td>
                  <td className="px-4 py-2 text-right font-medium" style={{ color: '#1B72D9' }}>{count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
