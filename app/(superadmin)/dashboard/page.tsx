import { getBusinesses } from '@/app/actions/superadmin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SuperAdminDashboardPage() {
  const businesses = await getBusinesses()
  const activeCount = businesses.filter((b) => b.is_active).length

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 text-sm">{activeCount} de {businesses.length} negocios activos</p>
        </div>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button className="gap-2"><Plus className="w-4 h-4" />Nuevo negocio</Button>
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total negocios', value: businesses.length },
          { label: 'Activos', value: activeCount },
          { label: 'Inactivos', value: businesses.length - activeCount },
        ].map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
