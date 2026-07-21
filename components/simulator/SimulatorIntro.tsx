import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Wand2, Sparkles, ShieldCheck, Lock, Star, Heart, MessageCircle } from 'lucide-react'

const GOLD = '#c9a876'

interface SimulatorIntroProps {
  businessName: string
  logoUrl?: string | null
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
  startHref?: string
  onStart?: () => void
  onWhatsAppClick?: () => void
}

export function SimulatorIntro({
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
  whatsappUrl,
  startHref,
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

  const heroDescription = tagline

  return (
    <div className="flex flex-col gap-7 pb-8">
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ background: '#0a0908' }}>
        {/* Anillo glow detrás de la foto */}
        {bannerUrl && (
          <div
            className="absolute top-8 right-[-10%] w-[70%] aspect-square rounded-full pointer-events-none"
            style={{
              border: '1px solid rgba(201,168,118,0.5)',
              boxShadow: '0 0 60px rgba(201,168,118,0.35), inset 0 0 40px rgba(201,168,118,0.15)',
            }}
          />
        )}

        {/* Logo + nombre arriba izquierda */}
        <div className="relative z-10 px-6 pt-8 flex flex-col gap-2">
          {logoUrl && <Image src={logoUrl} alt="" width={44} height={44} />}
          <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: GOLD }}>
            {businessName}
          </span>
        </div>

        {/* Foto a la derecha, texto a la izquierda */}
        <div className={`relative flex items-end ${bannerUrl ? 'min-h-[380px]' : 'pt-6'}`}>
          {bannerUrl && (
            <>
              <Image
                src={bannerUrl}
                alt={businessName}
                fill
                priority
                className="object-cover object-right-top"
                sizes="(max-width: 640px) 100vw, 640px"
              />
              {/* Gradiente para legibilidad del texto */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, rgba(10,9,8,0.95) 0%, rgba(10,9,8,0.6) 45%, transparent 70%)' }}
              />
            </>
          )}
          <div className={`relative z-10 px-6 pb-10 flex flex-col gap-4 ${bannerUrl ? 'max-w-[60%]' : ''}`}>
            <h1 className="text-[32px] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-white font-normal">{line1}</span>
              <br />
              <span className="italic" style={{ color: GOLD }}>{line2}</span>
            </h1>
            <span className="h-px w-20" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
            {heroDescription && (
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {heroDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-7">
        {/* Simulador CTA */}
        {(() => {
          const cta = (
            <div
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
            </div>
          )
          return startHref ? (
            <Link href={startHref} className="block w-full">
              {cta}
            </Link>
          ) : (
            <button onClick={onStart} className="block w-full">
              {cta}
            </button>
          )
        })()}

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
