'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBusinessConfig } from '@/app/actions/admin'
import type { Business } from '@/types'
import { toast } from 'sonner'

interface ConfigFormProps {
  business: Business
}

export function ConfigForm({ business }: ConfigFormProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateBusinessConfig(formData)
        toast('Configuración guardada')
      } catch {
        toast.error('Error al guardar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del negocio</Label>
        <Input id="name" name="name" defaultValue={business.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={business.tagline ?? ''} placeholder="Tu frase de impacto" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
        <Input id="whatsapp_number" name="whatsapp_number" defaultValue={business.whatsapp_number} placeholder="+573001234567" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp_message">Mensaje predefinido de WhatsApp</Label>
        <Input id="whatsapp_message" name="whatsapp_message" defaultValue={business.whatsapp_message ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary_color">Color primario</Label>
          <input type="color" id="primary_color" name="primary_color" defaultValue={business.primary_color} className="h-10 w-full rounded-md cursor-pointer p-1" style={{ border: '1px solid #D4E4EE', background: '#FFFFFF' }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondary_color">Color secundario</Label>
          <input type="color" id="secondary_color" name="secondary_color" defaultValue={business.secondary_color} className="h-10 w-full rounded-md cursor-pointer p-1" style={{ border: '1px solid #D4E4EE', background: '#FFFFFF' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={business.city ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" defaultValue={business.country ?? ''} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="custom_domain">Dominio personalizado (opcional)</Label>
        <Input id="custom_domain" name="custom_domain" defaultValue={business.custom_domain ?? ''} placeholder="simulador.tunegocio.com" />
        <p className="text-xs" style={{ color: '#9AAAB8' }}>Apunta un CNAME de tu dominio a: cname.vercel-dns.com</p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </form>
  )
}
