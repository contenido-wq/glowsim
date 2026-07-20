import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { ProcedureTable } from '@/components/admin/ProcedureTable'

export default async function ProcedimientosPage() {
  const supabase = await createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('business_type_id')
    .eq('id', businessId!)
    .single()

  const [{ data: procedures }, { data: zones }] = await Promise.all([
    supabase
      .from('procedures')
      .select('*, zone:procedure_zones(id, name, svg_id)')
      .eq('business_id', businessId!)
      .order('sort_order'),
    supabase
      .from('procedure_zones')
      .select('*')
      .eq('business_type_id', business?.business_type_id ?? '')
      .order('name'),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Procedimientos</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Gestiona los servicios de tu negocio</p>
      </div>
      <ProcedureTable procedures={(procedures ?? []) as any} availableZones={zones ?? []} />
    </div>
  )
}
