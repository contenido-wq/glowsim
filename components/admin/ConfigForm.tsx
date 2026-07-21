'use client'

import { useEffect, useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBusinessConfig, removeSimulatorBanner } from '@/app/actions/admin'
import { LogoUploader } from '@/components/admin/LogoUploader'
import { BannerUploader } from '@/components/admin/BannerUploader'
import type { Business } from '@/types'
import { toast } from 'sonner'

interface ConfigFormProps {
  business: Business
}

function buildPreviewUrl(values: {
  name: string
  tagline: string
  primaryColor: string
  city: string
  logoUrl: string
  bannerUrl: string
}) {
  const params = new URLSearchParams()
  params.set('name', values.name)
  if (values.tagline) params.set('tagline', values.tagline)
  params.set('primaryColor', values.primaryColor)
  if (values.city) params.set('city', values.city)
  if (values.logoUrl) params.set('logoUrl', values.logoUrl)
  if (values.bannerUrl) params.set('bannerUrl', values.bannerUrl)
  return `/admin/preview?${params.toString()}`
}

export function ConfigForm({ business }: ConfigFormProps) {
  const [isPending, startTransition] = useTransition()

  // Controlled values for live preview
  const [previewValues, setPreviewValues] = useState({
    name: business.name,
    tagline: business.tagline ?? '',
    primaryColor: business.primary_color,
    city: business.city ?? '',
    logoUrl: business.logo_url ?? '',
    bannerUrl: business.banner_url ?? '',
  })
  const [previewUrl, setPreviewUrl] = useState(() => buildPreviewUrl({
    name: business.name,
    tagline: business.tagline ?? '',
    primaryColor: business.primary_color,
    city: business.city ?? '',
    logoUrl: business.logo_url ?? '',
    bannerUrl: business.banner_url ?? '',
  }))

  // Debounce preview URL updates by 600ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewUrl(buildPreviewUrl(previewValues))
    }, 600)
    return () => clearTimeout(timer)
  }, [previewValues])

  function set(key: keyof typeof previewValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setPreviewValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

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

  // Public URL for quick-action buttons
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'glowsim.app'
  const publicBase = business.custom_domain
    ? `https://${business.custom_domain}`
    : `https://${business.slug}.${appDomain}`

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── Left: form ── */}
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-[420px] flex-shrink-0 space-y-5"
      >
        {/* Banner */}
        <div className="space-y-2">
          <Label className="text-white">Banner</Label>
          <BannerUploader
            currentBannerUrl={business.banner_url ?? null}
            onBannerChange={(url) =>
              setPreviewValues((prev) => ({ ...prev, bannerUrl: url ?? '' }))
            }
          />
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label className="text-white">Logo</Label>
          <LogoUploader
            businessName={business.name}
            currentLogoUrl={business.logo_url ?? null}
            onLogoChange={(url) =>
              setPreviewValues((prev) => ({ ...prev, logoUrl: url ?? '' }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Nombre del negocio</Label>
          <Input
            id="name"
            name="name"
            defaultValue={business.name}
            required
            onChange={set('name')}
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-white">Tagline</Label>
          <Input
            id="tagline"
            name="tagline"
            defaultValue={business.tagline ?? ''}
            placeholder="Tu frase de impacto"
            onChange={set('tagline')}
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number" className="text-white">Número WhatsApp</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={business.whatsapp_number}
            placeholder="+573001234567"
            required
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_message" className="text-white">Mensaje predefinido de WhatsApp</Label>
          <Input
            id="whatsapp_message"
            name="whatsapp_message"
            defaultValue={business.whatsapp_message ?? ''}
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-white">Redes y enlaces (opcional)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="instagram_url"
              defaultValue={business.instagram_url ?? ''}
              placeholder="Instagram (URL)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="tiktok_url"
              defaultValue={business.tiktok_url ?? ''}
              placeholder="TikTok (URL)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="facebook_url"
              defaultValue={business.facebook_url ?? ''}
              placeholder="Facebook (URL)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="website_url"
              defaultValue={business.website_url ?? ''}
              placeholder="Sitio web (URL)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="maps_url"
              defaultValue={business.maps_url ?? ''}
              placeholder="Google Maps (URL)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-white">Pantalla del simulador (opcional)</Label>
          <BannerUploader
            currentBannerUrl={business.simulator_banner_url ?? null}
            target="simulator-banner"
            removeAction={removeSimulatorBanner}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="simulator_headline_1"
              defaultValue={business.simulator_headline_1 ?? ''}
              placeholder="Titular línea 1 (ej: Descubre tu)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="simulator_headline_2"
              defaultValue={business.simulator_headline_2 ?? ''}
              placeholder="Titular línea 2 (ej: mejor versión)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
          </div>
          <Input
            name="simulator_results_title"
            defaultValue={business.simulator_results_title ?? ''}
            placeholder="Título tarjeta de resultados"
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
          <Input
            name="simulator_results_description"
            defaultValue={business.simulator_results_description ?? ''}
            placeholder="Descripción de la tarjeta de resultados"
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              name="simulator_badge_1"
              defaultValue={business.simulator_badge_1 ?? ''}
              placeholder="Badge 1 (ej: Privado y seguro)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="simulator_badge_2"
              defaultValue={business.simulator_badge_2 ?? ''}
              placeholder="Badge 2 (ej: Resultados realistas)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
            <Input
              name="simulator_badge_3"
              defaultValue={business.simulator_badge_3 ?? ''}
              placeholder="Badge 3 (ej: Atención personalizada)"
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color" className="text-white">Color primario</Label>
            <input
              type="color"
              id="primary_color"
              name="primary_color"
              defaultValue={business.primary_color}
              className="h-10 w-full rounded-md cursor-pointer p-1"
              style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
              onChange={set('primaryColor')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_color" className="text-white">Color secundario</Label>
            <input
              type="color"
              id="secondary_color"
              name="secondary_color"
              defaultValue={business.secondary_color}
              className="h-10 w-full rounded-md cursor-pointer p-1"
              style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-white">Ciudad</Label>
            <Input
              id="city"
              name="city"
              defaultValue={business.city ?? ''}
              onChange={set('city')}
              className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-white">País</Label>
            <Input id="country" name="country" defaultValue={business.country ?? ''} className="bg-white/5 text-white border-white/15 placeholder:text-white/35" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_domain" className="text-white">Dominio personalizado (opcional)</Label>
          <Input
            id="custom_domain"
            name="custom_domain"
            defaultValue={business.custom_domain ?? ''}
            placeholder="simulador.tunegocio.com"
            className="bg-white/5 text-white border-white/15 placeholder:text-white/35"
          />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Apunta un CNAME de tu dominio a: cname.vercel-dns.com
          </p>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </form>

      {/* ── Right: preview panel ── */}
      <div className="w-full lg:flex-1">
        {/* Mobile: collapsible */}
        <details className="lg:hidden mb-4">
          <summary
            className="cursor-pointer text-sm font-medium py-2"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Ver preview de tu landing
          </summary>
          <PreviewPanel publicBase={publicBase} previewUrl={previewUrl} />
        </details>

        {/* Desktop: sticky */}
        <div className="hidden lg:block sticky top-6">
          <PreviewPanel publicBase={publicBase} previewUrl={previewUrl} />
        </div>
      </div>
    </div>
  )
}

function PreviewPanel({ publicBase, previewUrl }: { publicBase: string; previewUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Quick-action buttons */}
      <div className="flex gap-2 self-stretch">
        <a
          href={publicBase}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          Ver landing ↗
        </a>
        <a
          href={`${publicBase}/simular`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'linear-gradient(135deg, #d7b98c 0%, #c9a876 100%)',
            color: '#2a2116',
          }}
        >
          Probar simulador ↗
        </a>
      </div>

      {/* Phone frame */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: '280px',
          height: '580px',
          border: '8px solid #1a1a2e',
          borderRadius: '40px',
          overflow: 'hidden',
          background: '#0f172a',
        }}
      >
        {/* Notch */}
        <div
          className="absolute z-10"
          style={{
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '72px',
            height: '18px',
            borderRadius: '9px',
            background: '#1a1a2e',
          }}
        />
        {/* Home indicator */}
        <div
          className="absolute z-10"
          style={{
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: '#4a5568',
          }}
        />
        {/* Iframe */}
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title="Vista previa de tu landing"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Actualiza en tiempo real mientras editas
      </p>
    </div>
  )
}
