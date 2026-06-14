import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type, name)')
    .eq('id', businessId!)
    .single()

  if (!business) redirect('/admin/login')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Configuración</h1>
        <p className="text-zinc-400 text-sm">Personaliza tu página pública y datos de contacto</p>
      </div>
      <ConfigForm business={{ ...business, face_map_type: (business.business_types as any)?.face_map_type ?? 'face' } as any} />
    </div>
  )
}
