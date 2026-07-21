import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const businessId = headersList.get('X-Business-ID')

  if (!businessId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,118,0.08), transparent),
            #0a0908`,
        }}
      >
        <div className="text-center p-8">
          <h1 className="text-4xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Glow</span>
            <span className="italic" style={{ color: '#c9a876' }}>Sim</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)' }}>Simulación visual con IA para tu negocio</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('primary_color, secondary_color')
    .eq('id', businessId)
    .single()

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#0a0908',
        ['--business-primary' as string]: business?.primary_color ?? '#6366f1',
        ['--business-secondary' as string]: business?.secondary_color ?? '#a855f7',
      }}
    >
      {children}
    </div>
  )
}
