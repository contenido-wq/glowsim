import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HomeIntroClient } from '@/components/public/HomeIntroClient'
import { logEvent } from '@/app/actions/analytics'

export default async function PublicPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const businessId = (await headers()).get('X-Business-ID')
  if (!businessId) return null

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const { data: procedures } = await supabase
    .from('procedures')
    .select('id, name')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order')

  const params = await searchParams

  // Fire-and-forget — no await para no bloquear render
  logEvent({
    business_id: businessId,
    session_id: 'server-visit',
    event_type: 'visit',
    utm_source: params.utm_source ?? null,
    utm_medium: params.utm_medium ?? null,
    utm_campaign: params.utm_campaign ?? null,
    utm_term: params.utm_term ?? null,
    utm_content: params.utm_content ?? null,
  })

  return (
    <main
      style={{
        background: `
          radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,118,0.08), transparent),
          #0a0908`,
      }}
    >
      <HomeIntroClient
        businessId={businessId}
        businessName={business.name}
        logoUrl={business.logo_url}
        bannerUrl={business.banner_url}
        tagline={business.tagline}
        procedureNames={(procedures ?? []).map((p) => p.name)}
        headline1={business.simulator_headline_1}
        headline2={business.simulator_headline_2}
        resultsTitle={business.simulator_results_title}
        resultsDescription={business.simulator_results_description}
        badge1={business.simulator_badge_1}
        badge2={business.simulator_badge_2}
        badge3={business.simulator_badge_3}
        whatsappNumber={business.whatsapp_number}
        whatsappMessage={business.whatsapp_message}
      />
      <footer className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {business.city && `${business.city} · `}Powered by GlowSim
      </footer>
    </main>
  )
}
