import Image from 'next/image'
import { ChevronRight, Wand2, Sparkles, ShieldCheck, Lock, Star, Heart, MessageCircle } from 'lucide-react'

const GOLD = '#c9a876'

interface SimulatorIntroProps {
  businessName: string
  bannerUrl: string | null
  tagline: string | null
  procedureNames: string[]
  headline1?: string | null
  headline2?: string | null
  resultsTitle?: string | null
  resultsDescription?: string | null
  badge1?: string | null
  badge2?: string | null
  badge3?: string | null
  whatsappUrl: string | null
  onStart: () => void
  onWhatsAppClick: () => void
}

export function SimulatorIntro({
  businessName,
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
  whatsappUrl,
  onStart,
  onWhatsAppClick,
}: SimulatorIntroProps) {
  const line1 = headline1 || 'Descubre tu'
  const line2 = headline2 || 'mejor versión'
  const resultsTitleText = resultsTitle || 'Resultados personalizados'
  const resultsDescText = resultsDescription || 'Tecnología avanzada para mostrarte resultados reales y naturales.'
  const badges = [
    { icon: Lock, label: badge1 || 'Privado y seguro' },
    { icon: Star, label: badge2 || 'Resultados realistas' },
    { icon: Heart, label: badge3 || 'Atención personalizada' },
  ]

  return (
    <div className="flex flex-col gap-7 pb-8">
      {/* Hero photo */}
      {bannerUrl ? (
        <div className="relative w-full aspect-[4/5]">
          <Image
            src={bannerUrl}
            alt={businessName}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)' }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-6 gap-4 max-w-[75%]">
            <h1 className="text-3xl leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-white">{line1}</span>
              <br />
              <span style={{ color: GOLD }}>{line2}</span>
            </h1>
            <span className="h-px w-16" style={{ background: GOLD }} />
            {tagline && <p className="text-sm text-zinc-300 leading-relaxed">{tagline}</p>}
          </div>
        </div>
      ) : (
        <div className="px-6 pt-10 flex flex-col gap-4">
          <h1 className="text-3xl leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">{line1}</span>
            <br />
            <span style={{ color: GOLD }}>{line2}</span>
          </h1>
          <span className="h-px w-16" style={{ background: GOLD }} />
          {tagline && <p className="text-sm text-zinc-300 leading-relaxed">{tagline}</p>}
        </div>
      )}

      <div className="px-6 flex flex-col gap-7">
        {/* Simulador CTA */}
        <button
          onClick={onStart}
          className="flex items-center gap-4 w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.98]"
          style={{ border: `1px solid ${GOLD}`, background: 'rgba(201,168,118,0.06)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: `1px solid ${GOLD}` }}
          >
            <Wand2 className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Simulador
            </h3>
            <p className="text-xs" style={{ color: GOLD }}>
              Visualiza tu resultado ideal
            </p>
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
        </button>

        {/* Explora y simula */}
        {procedureNames.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
              <span className="text-xs text-white whitespace-nowrap">Explora y simula</span>
              <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {procedureNames.slice(0, 6).map((name) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 rounded-xl p-3 text-center"
                  style={{ border: '1px solid rgba(201,168,118,0.4)' }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: GOLD }} />
                  <span className="text-xs text-white leading-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultados personalizados */}
        <div
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{ border: '1px solid rgba(201,168,118,0.4)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: `1px solid ${GOLD}` }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{resultsTitleText}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {resultsDescText}
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-between text-center">
          {badges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1 px-1">
              <Icon className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Agendar */}
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={onWhatsAppClick} className="block w-full">
            <button
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-transform active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, #d7b98c 0%, ${GOLD} 100%)`, color: '#2a2116' }}
            >
              <MessageCircle className="w-5 h-5" />
              Agendar mi consulta
            </button>
          </a>
        )}
      </div>
    </div>
  )
}
