import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const businessId = headersList.get('X-Business-ID')

  if (!businessId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-2">GlowSim</h1>
          <p className="text-zinc-400">Simulación visual con IA para tu negocio</p>
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
      className="min-h-screen bg-zinc-950"
      style={{
        ['--business-primary' as string]: business?.primary_color ?? '#6366f1',
        ['--business-secondary' as string]: business?.secondary_color ?? '#a855f7',
      }}
    >
      {children}
    </div>
  )
}
