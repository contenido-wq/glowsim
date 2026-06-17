'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness } from '@/app/actions/superadmin'
import { toast } from 'sonner'

interface BusinessType { id: string; name: string }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-widest font-medium" style={{ color: '#9AAAB8' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs" style={{ color: '#9AAAB8' }}>{hint}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  background: '#FFFFFF',
  border: '1px solid #D4E4EE',
  borderRadius: '12px',
  padding: '0 14px',
  fontSize: '14px',
  color: '#0D1E2C',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export function CreateBusinessForm({ businessTypes }: { businessTypes: BusinessType[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createBusiness(formData)
        toast('Negocio creado y admin invitado por email')
        router.push('/superadmin/dashboard/negocios')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al crear negocio')
      }
    })
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        <Field label="Nombre del negocio">
          <input
            name="name"
            required
            placeholder="Clínica Belleza Total"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#1B72D9')}
            onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
          />
        </Field>

        <Field label="Slug (subdominio)" hint="Solo letras minúsculas, números y guiones">
          <div className="flex items-center gap-2">
            <input
              name="slug"
              required
              placeholder="belleza-total"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              onFocus={e => (e.target.style.borderColor = '#1B72D9')}
              onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
            />
            <span
              className="text-xs whitespace-nowrap px-3 py-2 rounded-xl"
              style={{
                background: '#F0F5F8',
                color: '#9AAAB8',
                border: '1px solid #D4E4EE',
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
            onFocus={e => (e.target.style.borderColor = '#1B72D9')}
            onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
          >
            <option value="">Selecciona un tipo</option>
            {businessTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Número WhatsApp">
          <input
            name="whatsapp_number"
            required
            placeholder="+573001234567"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#1B72D9')}
            onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
          />
        </Field>

        <Field label="Nombre del doctor / admin">
          <input
            name="admin_name"
            required
            placeholder="Dra. Jessica García"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#1B72D9')}
            onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
          />
        </Field>

        <Field label="Email del admin" hint="Recibirá un correo para crear su contraseña">
          <input
            name="admin_email"
            type="email"
            required
            placeholder="admin@tuclinica.com"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#1B72D9')}
            onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
          />
        </Field>

        <button
          type="submit"
          disabled={isPending}
          className="w-full font-semibold text-sm transition-all"
          style={{
            height: '48px',
            borderRadius: '14px',
            background: isPending ? 'rgba(27,114,217,0.5)' : '#1B72D9',
            color: '#fff',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            boxShadow: isPending ? 'none' : '0 4px 14px rgba(27,114,217,0.3)',
            letterSpacing: '0.01em',
          }}
        >
          {isPending ? 'Creando negocio...' : 'Crear negocio y enviar invitación'}
        </button>
      </form>
    </div>
  )
}
