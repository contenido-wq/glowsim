import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { SimulatorIntro } from '@/components/simulator/SimulatorIntro'

export default async function AdminPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
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
    .select('id, name')
    .eq('business_id', businessId!)
    .eq('is_active', true)
    .order('sort_order')

  const params = await searchParams

  // URL params override DB values for live preview
  const name = params.name ?? business.name
  const tagline = params.tagline ?? business.tagline ?? null
  const logoUrl = params.logoUrl ?? business.logo_url ?? null
  const bannerUrl = params.bannerUrl ?? business.banner_url ?? null
  const city = params.city ?? business.city ?? null

  const whatsappUrl = business.whatsapp_number
    ? `https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
        business.whatsapp_message || `Hola, quiero agendar una consulta con ${name} 😊`
      )}`
    : null

  return (
    <div className="min-h-screen" style={{ background: '#0a0908' }}>
      {/* Floating preview badge */}
      <div className="fixed top-3 right-3 z-50 px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 pointer-events-none">
        Vista previa
      </div>

      <SimulatorIntro
        businessName={name}
        logoUrl={logoUrl}
        bannerUrl={bannerUrl}
        tagline={tagline}
        procedureNames={(procedures ?? []).map((p) => p.name)}
        headline1={business.simulator_headline_1}
        headline2={business.simulator_headline_2}
        resultsTitle={business.simulator_results_title}
        resultsDescription={business.simulator_results_description}
        badge1={business.simulator_badge_1}
        badge2={business.simulator_badge_2}
        badge3={business.simulator_badge_3}
        whatsappUrl={whatsappUrl}
      />
      <footer className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {city && `${city} · `}Powered by GlowSim
      </footer>
    </div>
  )
}
