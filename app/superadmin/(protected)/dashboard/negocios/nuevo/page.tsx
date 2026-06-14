import { createClient } from '@/lib/supabase/server'
import { CreateBusinessForm } from '@/components/superadmin/CreateBusinessForm'
import Link from 'next/link'

export default async function NuevoNegocioPage() {
  const supabase = await createClient()
  const { data: businessTypes } = await supabase.from('business_types').select('id, name').order('name')
  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/superadmin/dashboard/negocios" className="text-zinc-400 hover:text-white">←</Link>
        <div>
          <h1 className="text-xl font-bold text-white">Nuevo negocio</h1>
          <p className="text-zinc-400 text-sm">Crea un negocio e invita al admin</p>
        </div>
      </div>
      <CreateBusinessForm businessTypes={businessTypes ?? []} />
    </div>
  )
}
