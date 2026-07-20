import { createClient } from '@/lib/supabase/server'
import { CreateBusinessForm } from '@/components/superadmin/CreateBusinessForm'
import Link from 'next/link'

export default async function NuevoNegocioPage() {
  const supabase = await createClient()
  const { data: businessTypes } = await supabase.from('business_types').select('id, name').order('name')
  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <Link
          href="/superadmin/dashboard/negocios"
          className="inline-flex items-center gap-2 text-xs mb-6 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          ← Volver a negocios
        </Link>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Nuevo negocio
        </p>
        <h1 className="text-2xl font-bold text-white">Crear negocio</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          El admin recibirá su acceso por email
        </p>
      </div>
      <CreateBusinessForm businessTypes={businessTypes ?? []} />
    </div>
  )
}
