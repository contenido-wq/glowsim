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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F0F5F8' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0 mb-2">
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#0D1E2C' }}>glow</span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#4A9BB0' }}>sim</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(74,155,176,0.12)', color: '#4A9BB0', border: '1px solid rgba(74,155,176,0.25)' }}>Superadmin</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#9AAAB8' }}>
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
