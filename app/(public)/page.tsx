import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BusinessHero } from '@/components/public/BusinessHero'
import { ProcedureCards } from '@/components/public/ProcedureCards'
import { logEvent } from '@/app/actions/analytics'

export default async function PublicPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const businessId = headers().get('X-Business-ID')
  if (!businessId) return null

  const supabase = createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const { data: procedures } = await supabase
    .from('procedures')
    .select('*, zone:procedure_zones(svg_id, name)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order')

  // Fire-and-forget — no await para no bloquear render
  logEvent({
    business_id: businessId,
    session_id: 'server-visit',
    event_type: 'visit',
    utm_source: searchParams.utm_source ?? null,
    utm_medium: searchParams.utm_medium ?? null,
    utm_campaign: searchParams.utm_campaign ?? null,
    utm_term: searchParams.utm_term ?? null,
    utm_content: searchParams.utm_content ?? null,
  })

  return (
    <main>
      <BusinessHero
        businessName={business.name}
        tagline={business.tagline}
        primaryColor={business.primary_color}
        logoUrl={business.logo_url}
      />
      <ProcedureCards procedures={procedures ?? []} primaryColor={business.primary_color} />
      <footer className="text-center py-8 text-xs text-zinc-700">
        {business.city && `${business.city} · `}Powered by GlowSim
      </footer>
    </main>
  )
}
