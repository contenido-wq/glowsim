# Admin Landing Customization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow clinic admins to upload their logo, customize their landing page, and see a live phone-frame preview with one-click access to the public landing and simulator.

**Architecture:** Five tasks in dependency order — Storage bucket first, then the logo server action, then the LogoUploader client component, then the `/admin/preview` endpoint, and finally the ConfigForm redesign that wires everything together. Each task is independently deployable except Task 5 which depends on Tasks 2-4.

**Tech Stack:** Next.js 16 App Router, Supabase Storage (`@supabase/ssr`), Tailwind CSS, React 18 (useEffect debounce, useState), Supabase CLI for migrations.

## Global Constraints

- UI language: español neutro latinoamericano (no castellano de España)
- Dark mode: forbidden in admin panel (uses Ocean blue light theme)
- Colors in use: `#0D1E2C` text, `#6B8194` muted, `#D4E4EE` border, `#F0F5F8` page bg, `#FFFFFF` card bg
- Public landing is dark (`bg-zinc-950`) — the preview iframe inherits this correctly
- Never expose `service_role` key in client code — use anon key + RLS only
- All server components must `await createClient()`
- Storage upsert requires INSERT + SELECT + UPDATE policies (Supabase requirement)
- `searchParams` in server components: follow existing codebase pattern (direct access, no await)
- No new npm packages allowed unless unavoidable

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/004_storage.sql` | Create | Bucket `logos` + all 4 RLS policies |
| `app/actions/admin.ts` | Modify | Add `updateBusinessLogo`, `removeBusinessLogo` |
| `components/admin/LogoUploader.tsx` | Create | Client-side upload UI + calls server action |
| `app/admin/preview/page.tsx` | Create | Iframe-safe preview (no sidebar layout) |
| `components/admin/ConfigForm.tsx` | Modify | Split layout, iframe, phone frame, quick-action links |

---

## Task 1: Storage Bucket + RLS Policies

**Files:**
- Create: `supabase/migrations/004_storage.sql`

**Interfaces:**
- Produces: public bucket `logos` where path = `{business_id}/{filename}`

- [ ] **Step 1: Create the migration file**

```bash
supabase migration new storage_logos_bucket
```

This creates `supabase/migrations/<timestamp>_storage_logos_bucket.sql`. Rename it or use the new file path in the next step.

Actually: create the file directly at the expected path:

```bash
touch supabase/migrations/004_storage.sql
```

- [ ] **Step 2: Write the migration SQL**

`supabase/migrations/004_storage.sql`:

```sql
-- Create public bucket for business logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own business folder
CREATE POLICY "logos_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can SELECT their own objects (required for upsert)
CREATE POLICY "logos_select_own_policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can UPDATE their own logos (required for upsert)
CREATE POLICY "logos_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can DELETE their own logos
CREATE POLICY "logos_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);
```

- [ ] **Step 3: Apply the migration to the linked Supabase project**

```bash
supabase db push
```

Expected output: `Applying migration 004_storage.sql...` (no errors)

- [ ] **Step 4: Verify the bucket exists**

```bash
supabase storage ls --experimental
```

Expected: `logos` appears in the list.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/004_storage.sql
git commit -m "feat: create logos storage bucket with RLS policies"
```

---

## Task 2: Logo Server Actions

**Files:**
- Modify: `app/actions/admin.ts`

**Interfaces:**
- Consumes: `getAdminBusinessId()` (already in the file)
- Produces:
  - `updateBusinessLogo(logoUrl: string): Promise<void>`
  - `removeBusinessLogo(): Promise<void>`

- [ ] **Step 1: Add the two actions at the end of `app/actions/admin.ts`**

```typescript
export async function updateBusinessLogo(logoUrl: string) {
  const supabase = await createClient()
  const businessId = await getAdminBusinessId()
  const { error } = await supabase
    .from('businesses')
    .update({ logo_url: logoUrl })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/configuracion')
}

export async function removeBusinessLogo() {
  const supabase = await createClient()
  const businessId = await getAdminBusinessId()
  const { error } = await supabase
    .from('businesses')
    .update({ logo_url: null })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/configuracion')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `app/actions/admin.ts`

- [ ] **Step 3: Commit**

```bash
git add app/actions/admin.ts
git commit -m "feat: add updateBusinessLogo and removeBusinessLogo server actions"
```

---

## Task 3: LogoUploader Component

**Files:**
- Create: `components/admin/LogoUploader.tsx`

**Interfaces:**
- Consumes:
  - `updateBusinessLogo(logoUrl: string): Promise<void>` from `@/app/actions/admin`
  - `removeBusinessLogo(): Promise<void>` from `@/app/actions/admin`
  - `createClient()` from `@/lib/supabase/client` (browser client)
- Produces:
  - `<LogoUploader businessId={string} businessName={string} currentLogoUrl={string|null} onLogoChange={(url: string|null) => void} />`

**Design (from frontend-design brief):**
- Circular zone 80px — matches the rounded logo in BusinessHero
- Empty state: avatar with business initial, dashed `#D4E4EE` border
- Has logo: shows the image, solid border, hover overlay with "Cambiar" text
- Uploading: pulsing border animation, spinner in center
- Error: red border + inline message below
- Max file size: 2MB, accept: `image/*`

- [ ] **Step 1: Create the file**

`components/admin/LogoUploader.tsx`:

```tsx
'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateBusinessLogo, removeBusinessLogo } from '@/app/actions/admin'

interface LogoUploaderProps {
  businessId: string
  businessName: string
  currentLogoUrl: string | null
  onLogoChange?: (url: string | null) => void
}

type UploadState = 'idle' | 'uploading' | 'error'

export function LogoUploader({ businessId, businessName, currentLogoUrl, onLogoChange }: LogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Solo se permiten imágenes')
      setUploadState('error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('El logo debe pesar menos de 2MB')
      setUploadState('error')
      return
    }

    setUploadState('uploading')
    setErrorMsg('')

    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${businessId}/logo.${ext}`
      const supabase = createClient()

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path)

      // Bust cache by appending timestamp
      const urlWithCache = `${publicUrl}?t=${Date.now()}`

      startTransition(async () => {
        await updateBusinessLogo(urlWithCache)
        setLogoUrl(urlWithCache)
        setUploadState('idle')
        onLogoChange?.(urlWithCache)
      })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al subir el logo')
      setUploadState('error')
    }

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  async function handleRemove() {
    startTransition(async () => {
      await removeBusinessLogo()
      setLogoUrl(null)
      onLogoChange?.(null)
    })
  }

  const isLoading = uploadState === 'uploading' || isPending

  return (
    <div className="flex items-center gap-4">
      {/* Circle zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 transition-all focus:outline-none focus-visible:ring-2"
        style={{
          border: uploadState === 'error'
            ? '2px solid #ef4444'
            : uploadState === 'uploading'
            ? '2px solid #1A6FA8'
            : logoUrl
            ? '2px solid #D4E4EE'
            : '2px dashed #D4E4EE',
          animation: uploadState === 'uploading' ? 'logo-pulse 1.2s ease-in-out infinite' : 'none',
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: '#6B8194' }}
          >
            {businessName[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        {/* Hover overlay */}
        {!isLoading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Cambiar</span>
          </div>
        )}

        {/* Uploading spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#1A6FA8' }}
            />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="text-sm font-medium disabled:opacity-50"
          style={{ color: '#1A6FA8' }}
        >
          {logoUrl ? 'Cambiar logo' : 'Subir logo'}
        </button>
        {logoUrl && !isLoading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs"
            style={{ color: '#9AAAB8' }}
          >
            Eliminar
          </button>
        )}
        <p className="text-xs" style={{ color: '#9AAAB8' }}>PNG, JPG · Máx 2MB</p>
        {uploadState === 'error' && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { border-color: #D4E4EE; }
          50% { border-color: #1A6FA8; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `components/admin/LogoUploader.tsx`

- [ ] **Step 3: Manual test — upload and remove**

Start the dev server (`npm run dev`), log in as admin, go to `/admin/dashboard/configuracion`. You won't see the uploader yet (Task 5 wires it in), but you can test by temporarily importing it in the configuracion page.

- [ ] **Step 4: Commit**

```bash
git add components/admin/LogoUploader.tsx
git commit -m "feat: add LogoUploader component with Supabase Storage upload"
```

---

## Task 4: /admin/preview Page

**Files:**
- Create: `app/admin/preview/page.tsx`

**Notes:**
- This page lives OUTSIDE `(protected)` — so it gets no admin sidebar
- Auth is already handled by `proxy.ts` middleware (all `/admin/*` routes redirect to login if no session)
- It reads `businessId` from the authenticated session via `getAdminBusinessId()`
- Accepts query params that override DB values for live preview
- Renders `BusinessHero` + `ProcedureCards` with `bg-zinc-950` (matches public landing)
- Shows a floating "Vista previa" badge so the user knows this is preview-only

**Interfaces:**
- Consumes:
  - `getAdminBusinessId(): Promise<string>` from `@/app/actions/admin`
  - `BusinessHero` from `@/components/public/BusinessHero`
  - `ProcedureCards` from `@/components/public/ProcedureCards`
- Query params: `name`, `tagline`, `primaryColor`, `logoUrl`, `city` (all optional strings)
- Produces: full-page iframe-safe render

- [ ] **Step 1: Create the file**

`app/admin/preview/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { BusinessHero } from '@/components/public/BusinessHero'
import { ProcedureCards } from '@/components/public/ProcedureCards'

export default async function AdminPreviewPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId!)
    .single()

  if (!business) redirect('/admin/login')

  const { data: procedures } = await supabase
    .from('procedures')
    .select('*, zone:procedure_zones(svg_id, name)')
    .eq('business_id', businessId!)
    .eq('is_active', true)
    .order('sort_order')

  // URL params override DB values for live preview
  const name = searchParams.name ?? business.name
  const tagline = searchParams.tagline ?? business.tagline ?? null
  const primaryColor = searchParams.primaryColor ?? business.primary_color
  const logoUrl = searchParams.logoUrl ?? business.logo_url ?? null
  const city = searchParams.city ?? business.city ?? null

  return (
    <div className="min-h-screen bg-zinc-950" style={{ ['--business-primary' as string]: primaryColor }}>
      {/* Floating preview badge */}
      <div className="fixed top-3 right-3 z-50 px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 pointer-events-none">
        Vista previa
      </div>

      <BusinessHero
        businessName={name}
        tagline={tagline}
        primaryColor={primaryColor}
        logoUrl={logoUrl}
      />
      <ProcedureCards procedures={procedures ?? []} primaryColor={primaryColor} />
      <footer className="text-center py-8 text-xs text-zinc-700">
        {city && `${city} · `}Powered by GlowSim
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual test — open preview page directly**

With dev server running and logged in as admin, open:
```
http://localhost:3000/admin/preview
```
Expected: shows the business landing (dark background, BusinessHero, ProcedureCards) with a floating "Vista previa" badge. No admin sidebar.

Then test with params:
```
http://localhost:3000/admin/preview?name=Test+Clinic&primaryColor=%23FF5500
```
Expected: name and color override.

- [ ] **Step 4: Test auth guard**

Log out. Open `http://localhost:3000/admin/preview` in a fresh browser tab.
Expected: redirect to `/admin/login`.

- [ ] **Step 5: Commit**

```bash
git add app/admin/preview/page.tsx
git commit -m "feat: add /admin/preview iframe-safe endpoint with live param overrides"
```

---

## Task 5: ConfigForm Split Layout + Live Preview

**Files:**
- Modify: `components/admin/ConfigForm.tsx`
- Modify: `app/admin/(protected)/dashboard/configuracion/page.tsx`

**Design (phone frame + split layout):**

```
Desktop (lg+):
┌──────────────────────────┬──────────────────────────────┐
│ Form (overflow-y-auto)   │ Preview panel (sticky top-6) │
│                          │                              │
│ [LogoUploader]           │ [Ver landing ↗][Simular ↗]  │
│ Nombre *                 │                              │
│ Tagline                  │  ┌──────────────────────┐   │
│ WhatsApp *               │  │  ┌────────────────┐  │   │
│ Mensaje WA               │  │  │ ·· notch ··    │  │   │
│ [Color primario]         │  │  │                │  │   │
│ [Color secundario]       │  │  │  BusinessHero  │  │   │
│ Ciudad | País            │  │  │  ProcedureCards│  │   │
│ Dominio                  │  │  │                │  │   │
│                          │  │  └────────────────┘  │   │
│ [Guardar configuración]  │  │     ─────────────     │   │
│                          │  └──────────────────────┘   │
│                          │                              │
│                          │  Actualiza al escribir       │
└──────────────────────────┴──────────────────────────────┘

Mobile: form full width, preview in an <details> accordion below
```

**Phone frame CSS (pure Tailwind + inline styles):**
- Outer: `rounded-[40px]` border `8px solid #1a1a2e`, width 280px, height 580px
- Notch: `absolute` top-2, centered, 72px × 18px, `rounded-full`, bg `#1a1a2e`
- Home indicator: `absolute` bottom-2, centered, 40px × 4px, `rounded-full`, bg `#4a5568`
- Iframe: `w-full h-full border-0`, `pointer-events-none` (prevents click-jacking inside admin)

**Debounce:** `useEffect` + `setTimeout(600ms)` — no new libraries.

**Interfaces:**
- Consumes:
  - `LogoUploader` from `@/components/admin/LogoUploader`
  - `Business` type with `id`, `slug`, `name`, `tagline`, `primary_color`, `secondary_color`, `whatsapp_number`, `whatsapp_message`, `city`, `country`, `custom_domain`, `logo_url`
- Produces: updated ConfigForm with live iframe preview

- [ ] **Step 1: Rewrite `components/admin/ConfigForm.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBusinessConfig } from '@/app/actions/admin'
import { LogoUploader } from '@/components/admin/LogoUploader'
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
}) {
  const params = new URLSearchParams()
  params.set('name', values.name)
  if (values.tagline) params.set('tagline', values.tagline)
  params.set('primaryColor', values.primaryColor)
  if (values.city) params.set('city', values.city)
  if (values.logoUrl) params.set('logoUrl', values.logoUrl)
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
  })
  const [previewUrl, setPreviewUrl] = useState(() => buildPreviewUrl({
    name: business.name,
    tagline: business.tagline ?? '',
    primaryColor: business.primary_color,
    city: business.city ?? '',
    logoUrl: business.logo_url ?? '',
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
        {/* Logo */}
        <div className="space-y-2">
          <Label>Logo</Label>
          <LogoUploader
            businessId={business.id}
            businessName={business.name}
            currentLogoUrl={business.logo_url ?? null}
            onLogoChange={(url) =>
              setPreviewValues((prev) => ({ ...prev, logoUrl: url ?? '' }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre del negocio</Label>
          <Input
            id="name"
            name="name"
            defaultValue={business.name}
            required
            onChange={set('name')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            name="tagline"
            defaultValue={business.tagline ?? ''}
            placeholder="Tu frase de impacto"
            onChange={set('tagline')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={business.whatsapp_number}
            placeholder="+573001234567"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_message">Mensaje predefinido de WhatsApp</Label>
          <Input
            id="whatsapp_message"
            name="whatsapp_message"
            defaultValue={business.whatsapp_message ?? ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Color primario</Label>
            <input
              type="color"
              id="primary_color"
              name="primary_color"
              defaultValue={business.primary_color}
              className="h-10 w-full rounded-md cursor-pointer p-1"
              style={{ border: '1px solid #D4E4EE', background: '#FFFFFF' }}
              onChange={set('primaryColor')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_color">Color secundario</Label>
            <input
              type="color"
              id="secondary_color"
              name="secondary_color"
              defaultValue={business.secondary_color}
              className="h-10 w-full rounded-md cursor-pointer p-1"
              style={{ border: '1px solid #D4E4EE', background: '#FFFFFF' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              defaultValue={business.city ?? ''}
              onChange={set('city')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input id="country" name="country" defaultValue={business.country ?? ''} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_domain">Dominio personalizado (opcional)</Label>
          <Input
            id="custom_domain"
            name="custom_domain"
            defaultValue={business.custom_domain ?? ''}
            placeholder="simulador.tunegocio.com"
          />
          <p className="text-xs" style={{ color: '#9AAAB8' }}>
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
            style={{ color: '#6B8194' }}
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
            background: '#F0F5F8',
            color: '#0D1E2C',
            border: '1px solid #D4E4EE',
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
            background: '#0D1E2C',
            color: '#FFFFFF',
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

      <p className="text-xs" style={{ color: '#9AAAB8' }}>
        Actualiza en tiempo real mientras editas
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Update `configuracion/page.tsx` — remove `max-w-lg` constraint**

The ConfigForm now handles its own layout. Update the page wrapper to give full width:

In `app/admin/(protected)/dashboard/configuracion/page.tsx`, change the wrapper:

```tsx
return (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-xl font-bold" style={{ color: '#0D1E2C' }}>Configuración</h1>
      <p className="text-sm" style={{ color: '#6B8194' }}>Personaliza tu página pública y datos de contacto</p>
    </div>
    <ConfigForm business={{ ...business, face_map_type: (business.business_types as any)?.face_map_type ?? 'face' } as any} />
  </div>
)
```

The key change: remove any `max-w-lg` or width constraint on the outer `<div>` — the page should be full width. The current page doesn't have one explicitly, so verify it remains as-is.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual test — full flow**

Start dev server. Log in as admin. Navigate to `/admin/dashboard/configuracion`.

Verify:
1. Logo uploader shows circular zone with business initial (or current logo)
2. Page shows split layout on desktop (form left, preview right)
3. Phone frame renders with notch + home indicator
4. Iframe inside phone frame shows the business landing (dark background)
5. Typing in the "Nombre" field → after ~600ms the name updates in the iframe
6. Changing primary color → after 600ms, button color in iframe updates
7. "Ver landing ↗" opens the public URL in a new tab
8. "Probar simulador ↗" opens the simulator in a new tab
9. On mobile viewport: form is full width, preview is in collapsible `<details>`
10. Upload a logo → see the circular preview update immediately, iframe updates after debounce

- [ ] **Step 5: Commit**

```bash
git add components/admin/ConfigForm.tsx app/admin/(protected)/dashboard/configuracion/page.tsx
git commit -m "feat: ConfigForm split layout with live phone-frame preview and logo uploader"
```

---

## Self-Review

**Spec coverage:**
- [x] Storage bucket `logos` — Task 1
- [x] Logo upload in admin — Tasks 2 + 3
- [x] `/admin/preview` page — Task 4
- [x] Split layout in Configuración — Task 5
- [x] Phone frame CSS — Task 5 (PreviewPanel component)
- [x] Debounced live preview — Task 5 (useEffect + setTimeout)
- [x] "Ver landing ↗" button — Task 5
- [x] "Probar simulador ↗" button — Task 5
- [x] Mobile accordion — Task 5 (`<details>`)
- [x] Auth guard on preview page — Task 4 (getAdminBusinessId + redirect)

**No placeholders:** All steps have concrete code.

**Type consistency:**
- `updateBusinessLogo(logoUrl: string)` — defined Task 2, consumed Task 3 ✓
- `removeBusinessLogo()` — defined Task 2, consumed Task 3 ✓
- `LogoUploader` props — defined Task 3, consumed Task 5 ✓
- `buildPreviewUrl(values)` — defined and used in Task 5 ✓
- `PreviewPanel({ publicBase, previewUrl })` — defined and used in Task 5 ✓
- `Business.id`, `Business.slug`, `Business.logo_url` — all exist in `types/index.ts` ✓
