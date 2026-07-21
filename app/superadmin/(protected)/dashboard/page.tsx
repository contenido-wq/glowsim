import { getBusinesses } from '@/app/actions/superadmin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SuperAdminDashboardPage() {
  const businesses = await getBusinesses()
  const activeCount = businesses.filter((b) => b.is_active).length

  const cards = [
    { label: 'Activos', value: activeCount, accent: '#22C55E' },
    { label: 'Inactivos', value: businesses.length - activeCount, accent: '#F87171' },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Panel de control
          </p>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Plataforma GlowSim
          </p>
        </div>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button
            className="gap-2 text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, #d7b98c 0%, #c9a876 100%)',
              color: '#2a2116',
              border: 'none',
              boxShadow: '0 4px 14px rgba(201,168,118,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />Nuevo negocio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Hero gradient card */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #d7b98c 0%, #c9a876 100%)' }}
        >
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
            style={{ background: '#FFFFFF', opacity: 0.15 }}
          />
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(42,33,22,0.65)' }}>
            Total negocios
          </p>
          <p className="text-3xl font-bold tabular-nums" style={{ color: '#2a2116' }}>
            {businesses.length}
          </p>
        </div>

        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5"
            style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
