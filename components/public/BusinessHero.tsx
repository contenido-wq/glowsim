import Link from 'next/link'

interface BusinessHeroProps {
  businessName: string
  tagline: string | null
  primaryColor: string
  logoUrl: string | null
}

export function BusinessHero({ businessName, tagline, primaryColor, logoUrl }: BusinessHeroProps) {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-12 pb-8 gap-6">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={businessName} className="h-16 w-auto object-contain" />
      ) : (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {businessName[0]}
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{businessName}</h1>
        {tagline && <p className="text-zinc-400 text-lg">{tagline}</p>}
      </div>

      <p className="text-zinc-200 text-xl font-medium">
        Descubre tu mejor versión con IA ✨
      </p>

      <Link href="/simular" className="block w-full max-w-xs">
        <button
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-transform active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          Iniciar simulación gratis
        </button>
      </Link>
    </section>
  )
}
