import type { MetricsSummary } from '@/types'

interface MetricsCardsProps {
  metrics: MetricsSummary
  businessSlug: string
}

export function MetricsCards({ metrics, businessSlug }: MetricsCardsProps) {
  const convRate =
    metrics.visits > 0
      ? ((metrics.simulation_completes / metrics.visits) * 100).toFixed(1)
      : '0.0'

  const cards = [
    {
      label: 'Visitas',
      value: metrics.visits,
      sub: 'este mes',
      accent: '#1B72D9',
      glow: false,
    },
    {
      label: 'Simulaciones',
      value: metrics.simulation_completes,
      sub: 'completadas',
      accent: '#4A9BB0',
      glow: false,
    },
    {
      label: 'Clics WhatsApp',
      value: metrics.whatsapp_clicks,
      sub: 'consultas generadas',
      accent: '#22C55E',
      glow: false,
    },
    {
      label: 'Conversión',
      value: `${convRate}%`,
      sub: 'visita → simulación',
      accent: '#E07B5A',
      glow: true,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: '#FFFFFF',
              border: '1px solid #DCE8EE',
            }}
          >
            {card.glow && (
              <div
                className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl pointer-events-none"
                style={{ background: card.accent, opacity: 0.12 }}
              />
            )}
            <p
              className="text-[10px] uppercase tracking-widest mb-3"
              style={{ color: '#9AAAB8' }}
            >
              {card.label}
            </p>
            <p
              className="text-3xl font-bold tabular-nums leading-none"
              style={{
                color: card.accent,
                textShadow: card.glow ? `0 0 24px ${card.accent}70` : undefined,
              }}
            >
              {card.value}
            </p>
            <p className="text-xs mt-2" style={{ color: '#9AAAB8' }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Página pública */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: '#FFFFFF',
          border: '1px solid #DCE8EE',
        }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#9AAAB8' }}>
            Tu página pública
          </p>
          <p className="text-sm font-mono" style={{ color: '#1A2B3C' }}>{businessSlug}.glowsim.app</p>
        </div>
        <a
          href={`https://${businessSlug}.glowsim.app`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-4 py-2 rounded-xl font-medium transition-all"
          style={{
            background: '#1B72D9',
            color: '#FFFFFF',
            border: 'none',
          }}
        >
          Abrir ↗
        </a>
      </div>
    </div>
  )
}
