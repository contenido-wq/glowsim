import { getBusinesses } from '@/app/actions/superadmin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SuperAdminDashboardPage() {
  const businesses = await getBusinesses()
  const activeCount = businesses.filter((b) => b.is_active).length

  const cards = [
    { label: 'Total negocios', value: businesses.length, accent: '#1B72D9' },
    { label: 'Activos', value: activeCount, accent: '#22C55E' },
    { label: 'Inactivos', value: businesses.length - activeCount, accent: '#F87171' },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#9AAAB8' }}>
            Panel de control
          </p>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1E2C' }}>Overview</h1>
          <p className="text-sm mt-1" style={{ color: '#6B8194' }}>
            Plataforma GlowSim
          </p>
        </div>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button
            className="gap-2 text-sm font-medium"
            style={{
              background: '#1B72D9',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(27,114,217,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />Nuevo negocio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5"
            style={{ background: '#FFFFFF', border: '1px solid #DCE8EE' }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#9AAAB8' }}>
              {card.label}
            </p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: card.accent }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
