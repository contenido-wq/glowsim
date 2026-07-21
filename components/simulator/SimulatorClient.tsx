'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { AnalysisResult, FaceMapType } from '@/types'
import { PhotoUploader } from './PhotoUploader'
import { FaceMap } from './FaceMap'
import { ZonePanel } from './ZonePanel'
import { WhatsAppCTA } from './WhatsAppCTA'
import { SimulatorIntro } from './SimulatorIntro'
import { analyzeImage } from '@/app/actions/analyze'
import { logEvent } from '@/app/actions/analytics'
import { getOrCreateSessionId } from '@/lib/session'

interface SimulatorClientProps {
  businessId: string
  businessName: string
  faceMapType: FaceMapType
  primaryColor: string
  logoUrl?: string | null
  bannerUrl?: string | null
  tagline?: string | null
  procedureNames?: string[]
  headline1?: string | null
  headline2?: string | null
  resultsTitle?: string | null
  resultsDescription?: string | null
  badge1?: string | null
  badge2?: string | null
  badge3?: string | null
  whatsappNumber: string
  whatsappMessage: string
}

type Step = 'intro' | 'upload' | 'analyzing' | 'results'

export function SimulatorClient({
  businessId,
  businessName,
  faceMapType,
  primaryColor,
  logoUrl,
  bannerUrl,
  tagline,
  procedureNames = [],
  headline1,
  headline2,
  resultsTitle,
  resultsDescription,
  badge1,
  badge2,
  badge3,
  whatsappNumber,
  whatsappMessage,
}: SimulatorClientProps) {
  const [step, setStep] = useState<Step>('intro')
  const [photoBase64, setPhotoBase64] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  function utmParams() {
    return {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_term: searchParams.get('utm_term'),
      utm_content: searchParams.get('utm_content'),
    }
  }

  const handlePhotoSelected = useCallback(
    async (base64: string) => {
      setPhotoBase64(base64)
      setStep('analyzing')
      setError(null)

      const sessionId = getOrCreateSessionId()
      await logEvent({ business_id: businessId, session_id: sessionId, event_type: 'simulation_start', ...utmParams() })

      try {
        const analysis = await analyzeImage(base64, businessId)
        setResult(analysis)
        setActiveZoneId(analysis.zones[0]?.svg_id ?? null)
        setStep('results')
        await logEvent({
          business_id: businessId,
          session_id: sessionId,
          event_type: 'simulation_complete',
          ...utmParams(),
          metadata: {
            zones_analyzed: analysis.zones.map((z) => z.svg_id),
            procedures_count: analysis.zones.flatMap((z) => z.procedures).length,
          },
        })
      } catch {
        setError('Hubo un error al analizar tu foto. Por favor intenta de nuevo.')
        setStep('upload')
      }
    },
    [businessId, searchParams]
  )

  async function handleWhatsAppClick() {
    await logEvent({
      business_id: businessId,
      session_id: getOrCreateSessionId(),
      event_type: 'whatsapp_click',
      ...utmParams(),
    })
  }

  const activeZone = result?.zones.find((z) => z.svg_id === activeZoneId) ?? null

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        whatsappMessage || `Hola, quiero agendar una consulta con ${businessName} 😊`
      )}`
    : null

  return (
    <div className="flex flex-col min-h-[calc(100vh-57px)]">
      {step === 'intro' && (
        <SimulatorIntro
          businessName={businessName}
          logoUrl={logoUrl ?? null}
          bannerUrl={bannerUrl ?? null}
          tagline={tagline ?? null}
          procedureNames={procedureNames}
          headline1={headline1 ?? null}
          headline2={headline2 ?? null}
          resultsTitle={resultsTitle ?? null}
          resultsDescription={resultsDescription ?? null}
          badge1={badge1 ?? null}
          badge2={badge2 ?? null}
          badge3={badge3 ?? null}
          whatsappUrl={whatsappUrl}
          onStart={() => setStep('upload')}
          onWhatsAppClick={handleWhatsAppClick}
        />
      )}

      {(step === 'upload' || step === 'analyzing') && (
        <div className="flex-1 flex flex-col items-center justify-center">
          {error && <p className="text-red-400 text-sm text-center px-6 mb-4">{error}</p>}
          <PhotoUploader onPhotoSelected={handlePhotoSelected} isLoading={step === 'analyzing'} />
        </div>
      )}

      {step === 'results' && result && (
        <div className="flex flex-col flex-1">
          <div className="p-4">
            <FaceMap
              faceMapType={faceMapType}
              zones={result.zones}
              activeZoneId={activeZoneId}
              onZoneClick={setActiveZoneId}
              primaryColor={primaryColor}
              userPhotoBase64={photoBase64}
            />
          </div>
          <div className="mt-auto">
            <ZonePanel
              activeZone={activeZone}
              allZones={result.zones}
              summary={result.summary}
              onZoneSelect={setActiveZoneId}
            />
            <div className="bg-zinc-900 px-6 pb-8 pt-4 border-t border-zinc-800">
              <WhatsAppCTA
                whatsappNumber={whatsappNumber}
                whatsappMessage={whatsappMessage}
                businessName={businessName}
                primaryColor={primaryColor}
                onClick={handleWhatsAppClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
