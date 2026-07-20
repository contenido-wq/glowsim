import { getBusinesses } from '@/app/actions/superadmin'
import { BusinessTable } from '@/components/superadmin/BusinessTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function NegociosPage() {
  const businesses = await getBusinesses()
  const activeCount = businesses.filter((b: any) => b.is_active).length

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Plataforma
          </p>
          <h1 className="text-2xl font-bold text-white">Negocios</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {businesses.length} registrados · {activeCount} activos
          </p>
        </div>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button
            className="gap-2 text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, #1B72D9 0%, #4A9BB0 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(27,114,217,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />Nuevo negocio
          </Button>
        </Link>
      </div>

      <BusinessTable businesses={businesses as any} />
    </div>
  )
}
