'use client'

import { SimulatorIntro } from '@/components/simulator/SimulatorIntro'
import { logEvent } from '@/app/actions/analytics'
import { getOrCreateSessionId } from '@/lib/session'

interface HomeIntroClientProps {
  businessId: string
  businessName: string
  logoUrl: string | null
  bannerUrl: string | null
  tagline: string | null
  procedureNames: string[]
  headline1: string | null
  headline2: string | null
  resultsTitle: string | null
  resultsDescription: string | null
  badge1: string | null
  badge2: string | null
  badge3: string | null
  whatsappNumber: string
  whatsappMessage: string | null
}

export function HomeIntroClient({
  businessId,
  businessName,
  logoUrl,
  bannerUrl,
  tagline,
  procedureNames,
  headline1,
  headline2,
  resultsTitle,
  resultsDescription,
  badge1,
  badge2,
  badge3,
  whatsappNumber,
  whatsappMessage,
}: HomeIntroClientProps) {
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        whatsappMessage || `Hola, quiero agendar una consulta con ${businessName} 😊`
      )}`
    : null

  async function handleWhatsAppClick() {
    await logEvent({
      business_id: businessId,
      session_id: getOrCreateSessionId(),
      event_type: 'whatsapp_click',
    })
  }

  return (
    <SimulatorIntro
      businessName={businessName}
      logoUrl={logoUrl}
      bannerUrl={bannerUrl}
      tagline={tagline}
      procedureNames={procedureNames}
      headline1={headline1}
      headline2={headline2}
      resultsTitle={resultsTitle}
      resultsDescription={resultsDescription}
      badge1={badge1}
      badge2={badge2}
      badge3={badge3}
      whatsappUrl={whatsappUrl}
      startHref="/simular"
      onWhatsAppClick={handleWhatsAppClick}
    />
  )
}
