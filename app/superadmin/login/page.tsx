'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/superadmin/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,118,0.08), transparent),
          #0a0908`,
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-2xl font-medium tracking-tight text-white">glow</span>
            <span className="text-2xl italic tracking-tight" style={{ color: '#c9a876' }}>sim</span>
          </div>
          <span
            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-medium"
            style={{ background: 'rgba(201,168,118,0.12)', color: '#c9a876', border: '1px solid rgba(201,168,118,0.3)' }}
          >
            Superadmin
          </span>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 rounded-2xl"
          style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 bg-white/5 text-white border-white/15 placeholder:text-white/35"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
        </form>
      </div>
    </div>
  )
}
