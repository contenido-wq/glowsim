import type { MetricsSummary } from '@/types'

interface MetricsCardsProps {
  metrics: MetricsSummary
  businessSlug: string
}

export function MetricsCards({ metrics, businessSlug }: MetricsCardsProps) {
  const convRate =
    metrics.visits > 0
      ? ((metrics.simulation_completes / metrics.visits) * 100).toFixed(1)
      : '0'

  const cards = [
    { label: 'Visitas', value: metrics.visits, color: 'text-blue-400' },
    { label: 'Simulaciones', value: metrics.simulation_completes, color: 'text-purple-400' },
    { label: 'WhatsApp clicks', value: metrics.whatsapp_clicks, color: 'text-green-400' },
    { label: 'Conversión', value: `${convRate}%`, color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">Tu página pública</p>
          <p className="text-sm text-white font-mono">{businessSlug}.glowsim.app</p>
        </div>
        <a
          href={`https://${businessSlug}.glowsim.app`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Ver ↗
        </a>
      </div>
    </div>
  )
}
