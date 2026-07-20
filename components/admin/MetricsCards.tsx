import type { MetricsSummary } from '@/types'
import { getPublicUrl } from '@/lib/tenant'

interface MetricsCardsProps {
  metrics: MetricsSummary
  businessSlug: string
  customDomain?: string | null
}

export function MetricsCards({ metrics, businessSlug, customDomain }: MetricsCardsProps) {
  const publicUrl = getPublicUrl({ slug: businessSlug, custom_domain: customDomain })
  const publicLabel = publicUrl.replace(/^https?:\/\//, '')
  const convRate =
    metrics.visits > 0
      ? ((metrics.simulation_completes / metrics.visits) * 100).toFixed(1)
      : '0.0'

  const darkCards = [
    { label: 'Visitas', value: metrics.visits, sub: 'este mes', accent: '#5AA9E6' },
    { label: 'Simulaciones', value: metrics.simulation_completes, sub: 'completadas', accent: '#7EC8DC' },
    { label: 'Conversión', value: `${convRate}%`, sub: 'visita → simulación', accent: '#E0A05A' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hero gradient card */}
        <div
          className="col-span-2 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1B72D9 0%, #4A9BB0 100%)' }}
        >
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
            style={{ background: '#FFFFFF', opacity: 0.15 }}
          />
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Clics WhatsApp
          </p>
          <p className="text-3xl font-bold tabular-nums leading-none text-white">
            {metrics.whatsapp_clicks}
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            consultas generadas este mes
          </p>
        </div>

        {darkCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: '#171721',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {card.label}
            </p>
            <p
              className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: card.accent }}
            >
              {card.value}
            </p>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Página pública */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: '#171721',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Tu página pública
          </p>
          <p className="text-sm font-mono text-white">{publicLabel}</p>
        </div>
        <a
          href={publicUrl}
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
