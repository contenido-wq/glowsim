import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimulatorClient } from '@/components/simulator/SimulatorClient'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function SimularPage() {
  const businessId = headers().get('X-Business-ID')
  if (!businessId) notFound()

  const supabase = createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const faceMapType = (business.business_types as any)?.face_map_type ?? 'face'

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">←</Link>
        <span className="text-sm font-medium text-white truncate">{business.name}</span>
      </div>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 text-zinc-500 text-sm">Cargando simulador...</div>}>
        <SimulatorClient
          businessId={businessId}
          businessName={business.name}
          faceMapType={faceMapType}
          primaryColor={business.primary_color}
          whatsappNumber={business.whatsapp_number}
          whatsappMessage={business.whatsapp_message ?? ''}
        />
      </Suspense>
    </main>
  )
}
