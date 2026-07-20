import Image from 'next/image'
import { Sparkles, MessageCircle, List, Globe, MapPin } from 'lucide-react'
import { InstagramIcon, TikTokIcon, FacebookIcon } from './BrandIcons'
import { LinkCard } from './LinkCard'

interface BusinessHeroProps {
  businessName: string
  tagline: string | null
  primaryColor: string
  logoUrl: string | null
  bannerUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  facebookUrl?: string | null
  websiteUrl?: string | null
  mapsUrl?: string | null
  hasProcedures?: boolean
}

export function BusinessHero({
  businessName,
  tagline,
  primaryColor,
  logoUrl,
  bannerUrl,
  whatsappNumber,
  whatsappMessage,
  instagramUrl,
  tiktokUrl,
  facebookUrl,
  websiteUrl,
  mapsUrl,
  hasProcedures,
}: BusinessHeroProps) {
  const socialLinks = [
    instagramUrl && { href: instagramUrl, Icon: InstagramIcon, label: 'Instagram' },
    tiktokUrl && { href: tiktokUrl, Icon: TikTokIcon, label: 'TikTok' },
    facebookUrl && { href: facebookUrl, Icon: FacebookIcon, label: 'Facebook' },
  ].filter(Boolean) as { href: string; Icon: typeof InstagramIcon; label: string }[]

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        whatsappMessage || `Hola, quiero agendar una consulta con ${businessName} 😊`
      )}`
    : null

  return (
    <section className="flex flex-col items-center text-center gap-7 pb-8">
      {/* Hero photo with overlaid brand mark */}
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
            className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)' }}
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-6 pb-6">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={businessName}
                width={52}
                height={52}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid #c9a876' }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  border: '1px solid #c9a876',
                  color: '#d9c2a0',
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {businessName[0]}
              </div>
            )}
            <h1
              className="text-2xl text-white text-left leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {businessName}
            </h1>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 pt-12 px-6">
          {logoUrl ? (
            <Image src={logoUrl} alt={businessName} width={64} height={64} className="h-16 w-auto object-contain" />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ border: '1px solid #c9a876', color: '#d9c2a0', fontFamily: "'Playfair Display', serif" }}
            >
              {businessName[0]}
            </div>
          )}
          <h1
            className="text-3xl text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {businessName}
          </h1>
        </div>
      )}

      {/* Social row */}
      {socialLinks.length > 0 && (
        <div className="flex items-center gap-3 px-6">
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #c9a876)' }} />
          <span className="w-1.5 h-1.5 rotate-45" style={{ background: '#c9a876' }} />
          {socialLinks.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: '#141210', border: '1px solid rgba(201,168,118,0.4)', color: '#d9c2a0' }}
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
          <span className="w-1.5 h-1.5 rotate-45" style={{ background: '#c9a876' }} />
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, #c9a876, transparent)' }} />
        </div>
      )}

      {/* Script tagline */}
      {tagline && (
        <p
          className="text-2xl px-8 leading-snug"
          style={{ fontFamily: "'Dancing Script', cursive", color: '#d9b98a' }}
        >
          {tagline}
        </p>
      )}

      {/* Link cards */}
      <div className="w-full max-w-sm px-6 space-y-3.5">
        <LinkCard
          icon={Sparkles}
          title="Simulación IA"
          description="Descubre tu transformación con IA, gratis."
          href="/simular"
          accentColor={primaryColor}
        />

        {whatsappUrl && (
          <LinkCard
            icon={MessageCircle}
            title="Agendar"
            description="Agenda tu consulta directo por WhatsApp."
            href={whatsappUrl}
            accentColor={primaryColor}
            external
          />
        )}

        {hasProcedures && (
          <LinkCard
            icon={List}
            title="Servicios"
            description="Conoce todos los servicios que ofrecemos."
            href="#servicios"
            accentColor={primaryColor}
            external
          />
        )}

        {websiteUrl && (
          <LinkCard
            icon={Globe}
            title="Sitio web"
            description="Visita nuestro sitio web."
            href={websiteUrl}
            accentColor={primaryColor}
            external
          />
        )}

        {mapsUrl && (
          <LinkCard
            icon={MapPin}
            title="Ubicación"
            description="Encuentra cómo llegar."
            href={mapsUrl}
            accentColor={primaryColor}
            external
          />
        )}
      </div>
    </section>
  )
}
