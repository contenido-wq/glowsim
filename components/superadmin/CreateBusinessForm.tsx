'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBusiness } from '@/app/actions/superadmin'
import { toast } from 'sonner'

interface BusinessType { id: string; name: string }

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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del negocio</Label>
        <Input id="name" name="name" required placeholder="Clínica Belleza Total" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <div className="flex items-center gap-2">
          <Input id="slug" name="slug" required placeholder="belleza-total" className="font-mono" />
          <span className="text-xs text-zinc-500 whitespace-nowrap">.glowsim.app</span>
        </div>
        <p className="text-xs text-zinc-500">Solo letras minúsculas, números y guiones</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="business_type_id">Tipo de negocio</Label>
        <select name="business_type_id" id="business_type_id" required
          className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-md px-3 text-sm text-white">
          <option value="">Selecciona un tipo</option>
          {businessTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
        <Input id="whatsapp_number" name="whatsapp_number" required placeholder="+573001234567" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin_email">Email del admin del negocio</Label>
        <Input id="admin_email" name="admin_email" type="email" required placeholder="admin@tuclinica.com" />
        <p className="text-xs text-zinc-500">Recibirá un email para crear su contraseña</p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear negocio y enviar invitación'}
      </Button>
    </form>
  )
}
