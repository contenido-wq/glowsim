import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimulatorClient } from '@/components/simulator/SimulatorClient'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function SimularPage() {
  const businessId = (await headers()).get('X-Business-ID')
  if (!businessId) notFound()

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const faceMapType = (business.business_types as any)?.face_map_type ?? 'face'

  const { data: procedures } = await supabase
    .from('procedures')
    .select('id, name')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order')

  return (
    <main
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,118,0.08), transparent),
          #0a0908`,
      }}
    >
      <div className="sticky top-0 z-10 backdrop-blur border-b px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(10,9,8,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">←</Link>
        <span className="text-sm font-medium text-white truncate">{business.name}</span>
      </div>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 text-zinc-500 text-sm">Cargando simulador...</div>}>
        <SimulatorClient
          businessId={businessId}
          businessName={business.name}
          faceMapType={faceMapType}
          primaryColor={business.primary_color}
          logoUrl={business.logo_url}
          bannerUrl={business.simulator_banner_url ?? business.banner_url}
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
          whatsappMessage={business.whatsapp_message ?? ''}
        />
      </Suspense>
    </main>
  )
}
