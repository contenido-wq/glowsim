'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness } from '@/app/actions/superadmin'
import { toast } from 'sonner'

interface BusinessType { id: string; name: string }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{hint}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '12px',
  padding: '0 14px',
  fontSize: '14px',
  color: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export function CreateBusinessForm({ businessTypes }: { businessTypes: BusinessType[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [accessMethod, setAccessMethod] = useState<'email' | 'password'>('email')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createBusiness(formData)
        toast(accessMethod === 'email' ? 'Negocio creado — invitación enviada por email' : 'Negocio creado — el admin ya puede ingresar')
        router.push('/superadmin/dashboard/negocios')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al crear negocio')
      }
    })
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        <Field label="Nombre del negocio">
          <input
            name="name"
            required
            placeholder="Clínica Belleza Total"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          />
        </Field>

        <Field label="Slug (subdominio)" hint="Solo letras minúsculas, números y guiones">
          <div className="flex items-center gap-2">
            <input
              name="slug"
              required
              placeholder="belleza-total"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
            />
            <span
              className="text-xs whitespace-nowrap px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              .glowsim.app
            </span>
          </div>
        </Field>

        <Field label="Tipo de negocio">
          <select
            name="business_type_id"
            required
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          >
            <option value="" className="bg-[#171721]">Selecciona un tipo</option>
            {businessTypes.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#171721]">{t.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Número WhatsApp">
          <input
            name="whatsapp_number"
            required
            placeholder="+573001234567"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          />
        </Field>

        <Field label="Nombre del doctor / admin">
          <input
            name="admin_name"
            required
            placeholder="Dra. Jessica García"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          />
        </Field>

        {/* Método de acceso */}
        <div className="space-y-3">
          <span className="block text-[10px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Método de acceso
          </span>
          <div className="flex flex-col gap-2">
            {([
              { value: 'email', label: 'Enviar invitación por email' },
              { value: 'password', label: 'Crear con contraseña directa' },
            ] as const).map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="access_method"
                  value={value}
                  checked={accessMethod === value}
                  onChange={() => setAccessMethod(value)}
                  className="accent-blue-600"
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span className="text-sm text-white">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <Field
          label="Email del admin"
          hint={accessMethod === 'email' ? 'Recibirá un correo para crear su contraseña' : 'El admin usará este email para ingresar'}
        >
          <input
            name="admin_email"
            type="email"
            required
            placeholder="admin@tuclinica.com"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          />
        </Field>

        {accessMethod === 'password' && (
          <Field label="Contraseña" hint="Mínimo 8 caracteres — compártela directamente con el admin">
            <div className="relative">
              <input
                name="admin_password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => (e.target.style.borderColor = '#4A9BB0')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
              >
                {showPassword ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </Field>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full font-semibold text-sm transition-all"
          style={{
            height: '48px',
            borderRadius: '14px',
            background: isPending ? 'rgba(27,114,217,0.5)' : 'linear-gradient(135deg, #1B72D9 0%, #4A9BB0 100%)',
            color: '#fff',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            boxShadow: isPending ? 'none' : '0 4px 14px rgba(27,114,217,0.3)',
            letterSpacing: '0.01em',
          }}
        >
          {isPending ? 'Creando negocio...' : accessMethod === 'email' ? 'Crear negocio y enviar invitación' : 'Crear negocio'}
        </button>
      </form>
    </div>
  )
}
