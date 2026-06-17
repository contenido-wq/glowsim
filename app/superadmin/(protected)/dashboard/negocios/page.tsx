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
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#9AAAB8' }}>
            Plataforma
          </p>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1E2C' }}>Negocios</h1>
          <p className="text-sm mt-1" style={{ color: '#6B8194' }}>
            {businesses.length} registrados · {activeCount} activos
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

      <BusinessTable businesses={businesses as any} />
    </div>
  )
}
