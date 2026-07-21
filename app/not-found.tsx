import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center text-center p-8"
      style={{
        background: `
          radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,118,0.08), transparent),
          #0a0908`,
      }}
    >
      <div className="space-y-4">
        <h1 className="text-5xl italic" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a876' }}>404</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)' }}>Página no encontrada</p>
        <Link href="/" className="text-sm underline transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>Volver al inicio</Link>
      </div>
    </div>
  )
}
