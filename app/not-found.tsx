import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center p-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-white">404</h1>
        <p className="text-zinc-400">Página no encontrada</p>
        <Link href="/" className="text-sm text-zinc-300 hover:text-white underline">Volver al inicio</Link>
      </div>
    </div>
  )
}
