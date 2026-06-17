import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { BusinessHero } from '@/components/public/BusinessHero'
import { ProcedureCards } from '@/components/public/ProcedureCards'

export default async function AdminPreviewPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId!)
    .single()

  if (!business) redirect('/admin/login')

  const { data: procedures } = await supabase
    .from('procedures')
    .select('*, zone:procedure_zones(svg_id, name)')
    .eq('business_id', businessId!)
    .eq('is_active', true)
    .order('sort_order')

  // URL params override DB values for live preview
  const name = searchParams.name ?? business.name
  const tagline = searchParams.tagline ?? business.tagline ?? null
  const primaryColor = searchParams.primaryColor ?? business.primary_color
  const logoUrl = searchParams.logoUrl ?? business.logo_url ?? null
  const city = searchParams.city ?? business.city ?? null

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{ ['--business-primary' as string]: primaryColor }}
    >
      {/* Floating preview badge */}
      <div className="fixed top-3 right-3 z-50 px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 pointer-events-none">
        Vista previa
      </div>

      <BusinessHero
        businessName={name}
        tagline={tagline}
        primaryColor={primaryColor}
        logoUrl={logoUrl}
      />
      <ProcedureCards procedures={procedures ?? []} primaryColor={primaryColor} />
      <footer className="text-center py-8 text-xs text-zinc-700">
        {city && `${city} · `}Powered by GlowSim
      </footer>
    </div>
  )
}
