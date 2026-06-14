# GlowSim MVP — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir GlowSim — plataforma multi-tenant de simulación visual con IA para negocios de transformación estética, con landing page pública por negocio, simulador con FaceMap SVG + Gemini 2.0 Flash, panel admin por negocio, y panel super admin.

**Architecture:** Next.js 13 App Router monolítico. El middleware resuelve el tenant (negocio) por subdominio o dominio personalizado e inyecta `X-Business-ID` en los headers. Supabase para PostgreSQL + Auth. Gemini 2.0 Flash analiza fotos con `responseSchema` para forzar JSON válido. Vitest para tests unitarios de lógica de negocio.

**Tech Stack:** Next.js 13, TypeScript 5, TailwindCSS, shadcn/ui, @supabase/ssr, @google/generative-ai, Recharts, Vitest

---

## Mapa de Archivos

### Núcleo
- `middleware.ts` — Resolución de tenant multi-tenant + protección de rutas admin/superadmin
- `lib/tenant.ts` — Función pura `extractTenantIdentifier` (testeable)
- `lib/supabase/client.ts` — Cliente Supabase para browser
- `lib/supabase/server.ts` — Cliente Supabase para Server Components y Actions
- `lib/supabase/service.ts` — Cliente Supabase con service role key (solo servidor)
- `lib/supabase/middleware-client.ts` — Cliente Supabase para middleware
- `lib/gemini.ts` — Cliente Gemini + schema estructurado
- `lib/session.ts` — `getOrCreateSessionId` (localStorage)
- `lib/facemap.ts` — Carga SVG inline con caché
- `types/index.ts` — Tipos TypeScript de la app

### Base de Datos
- `supabase/migrations/001_schema.sql` — Tablas + índices
- `supabase/migrations/002_rls.sql` — Políticas RLS
- `supabase/migrations/003_seed.sql` — business_types + procedure_zones

### SVG FaceMaps
- `public/facemaps/face.svg` — Cara (9 zonas)
- `public/facemaps/hair.svg` — Cabello (6 zonas)
- `public/facemaps/hands.svg` — Manos (3 zonas)
- `public/facemaps/brows.svg` — Cejas/labios (4 zonas)

### Server Actions
- `app/actions/analyze.ts` — `analyzeImage()` — llama Gemini
- `app/actions/analytics.ts` — `logEvent()` — registra eventos anónimos
- `app/actions/admin.ts` — Acciones del panel admin
- `app/actions/superadmin.ts` — Acciones del panel superadmin

### Zona Pública
- `app/(public)/layout.tsx` — Carga business desde X-Business-ID header
- `app/(public)/page.tsx` — Landing page del negocio
- `app/(public)/simular/page.tsx` — Página del simulador
- `components/public/BusinessHero.tsx` — Hero + CTA principal
- `components/public/ProcedureCards.tsx` — Cards de procedimientos en scroll horizontal
- `components/simulator/SimulatorClient.tsx` — Orquestador cliente del simulador
- `components/simulator/PhotoUploader.tsx` — Upload + resize de foto
- `components/simulator/FaceMap.tsx` — SVG overlay interactivo
- `components/simulator/ZonePanel.tsx` — Bottom sheet de recomendaciones
- `components/simulator/WhatsAppCTA.tsx` — Botón WhatsApp

### Admin Panel
- `app/(admin)/layout.tsx` — Auth guard + sidebar
- `app/(admin)/login/page.tsx` — Login admin
- `app/(admin)/dashboard/page.tsx` — Overview con métricas del mes
- `app/(admin)/dashboard/configuracion/page.tsx` — Branding + config
- `app/(admin)/dashboard/procedimientos/page.tsx` — CRUD procedimientos
- `app/(admin)/dashboard/analytics/page.tsx` — Gráficos y UTMs
- `components/admin/Sidebar.tsx` — Navegación lateral
- `components/admin/MetricsCards.tsx` — Cards de métricas
- `components/admin/ConfigForm.tsx` — Formulario de configuración
- `components/admin/ProcedureTable.tsx` — Tabla con toggle/delete/add
- `components/admin/AnalyticsChart.tsx` — Gráfico Recharts

### Super Admin Panel
- `app/(superadmin)/layout.tsx` — Auth guard superadmin + nav
- `app/(superadmin)/login/page.tsx` — Login superadmin
- `app/(superadmin)/dashboard/page.tsx` — Overview global
- `app/(superadmin)/dashboard/negocios/page.tsx` — Lista de negocios
- `app/(superadmin)/dashboard/negocios/nuevo/page.tsx` — Crear negocio
- `app/(superadmin)/dashboard/analytics/page.tsx` — Analytics global
- `components/superadmin/BusinessTable.tsx` — Tabla de negocios con toggle
- `components/superadmin/CreateBusinessForm.tsx` — Formulario crear negocio

### Tests
- `__tests__/tenant.test.ts` — Tests del extractor de tenant
- `__tests__/analyze.test.ts` — Tests del Server Action analyzeImage
- `__tests__/analytics.test.ts` — Tests del logEvent
- `vitest.config.ts` — Configuración Vitest
- `vitest.setup.ts` — Setup de testing

---

## Task 1: Inicialización del proyecto

**Files:**
- Create: archivos base de Next.js 13
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Crear la app Next.js en el directorio actual**

```bash
cd /Users/jheitrujillo/Proyectos/glowsim
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-git
```

Expected: archivos base de Next.js creados. Acepta sobreescribir `docs/` si pregunta (no debería, solo agrega archivos nuevos).

- [ ] **Step 2: Instalar dependencias de producción**

```bash
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai recharts
```

- [ ] **Step 3: Instalar dependencias de desarrollo**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/jsdom
```

- [ ] **Step 4: Inicializar shadcn/ui**

```bash
npx shadcn@latest init --defaults
```

Cuando pregunte: style → Default, base color → Zinc, CSS variables → yes.

- [ ] **Step 5: Instalar componentes shadcn necesarios**

```bash
npx shadcn@latest add button card input label toast badge switch tabs dialog separator skeleton
```

- [ ] **Step 6: Crear `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 7: Crear `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Crear `.env.local.example`**

```bash
cat > .env.local.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# App
NEXT_PUBLIC_APP_DOMAIN=glowsim.app
NEXT_PUBLIC_APP_URL=https://glowsim.app

# Super Admin (debe coincidir con el email del usuario en Supabase Auth)
SUPERADMIN_EMAIL=admin@glowsim.app
EOF
```

Copiar a `.env.local` y rellenar los valores reales antes de continuar.

- [ ] **Step 9: Actualizar `next.config.js`**

Reemplazar el contenido completo con:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

module.exports = nextConfig
```

- [ ] **Step 10: Actualizar `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --radius: 0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }
}
```

- [ ] **Step 11: Actualizar `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'GlowSim',
  description: 'Simulación visual con IA para negocios de transformación estética',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: project setup — Next.js 13, shadcn/ui, Supabase, Vitest"
```

---

## Task 2: Tipos y clientes Supabase

**Files:**
- Create: `types/index.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/service.ts`
- Create: `lib/supabase/middleware-client.ts`
- Create: `__tests__/types.test.ts`

- [ ] **Step 1: Escribir el test de tipos**

Crear `__tests__/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type { Business, AnalysisResult } from '@/types'

describe('Types', () => {
  it('Business type has required fields', () => {
    const business: Business = {
      id: '123',
      name: 'Test Clinic',
      slug: 'test',
      primary_color: '#6366f1',
      secondary_color: '#a855f7',
      whatsapp_number: '+573001234567',
      is_active: true,
      face_map_type: 'face',
    }
    expect(business.id).toBe('123')
    expect(business.face_map_type).toBe('face')
  })

  it('AnalysisResult has zones array', () => {
    const result: AnalysisResult = {
      zones: [
        {
          svg_id: 'labios',
          zone_name: 'Labios',
          procedures: ['Relleno de labios'],
          description: 'Descripción test',
          confidence: 'high',
        },
      ],
      summary: 'Resumen test',
    }
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].svg_id).toBe('labios')
  })
})
```

- [ ] **Step 2: Correr test — debe fallar**

```bash
npx vitest run __tests__/types.test.ts
```

Expected: FAIL — "Cannot find module '@/types'"

- [ ] **Step 3: Crear `types/index.ts`**

```typescript
export type FaceMapType = 'face' | 'hair' | 'hands' | 'brows'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type EventType = 'visit' | 'simulation_start' | 'simulation_complete' | 'whatsapp_click'

export interface BusinessType {
  id: string
  name: string
  slug: string
  face_map_type: FaceMapType
}

export interface Business {
  id: string
  business_type_id?: string
  name: string
  slug: string
  custom_domain?: string | null
  logo_url?: string | null
  primary_color: string
  secondary_color: string
  tagline?: string | null
  whatsapp_number: string
  whatsapp_message?: string | null
  city?: string | null
  country?: string | null
  is_active: boolean
  face_map_type: FaceMapType
  business_type_name?: string
}

export interface ProcedureZone {
  id: string
  business_type_id: string
  name: string
  svg_id: string
}

export interface Procedure {
  id: string
  business_id: string
  zone_id: string | null
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  zone?: ProcedureZone | null
}

export interface AnalysisZone {
  svg_id: string
  zone_name: string
  procedures: string[]
  description: string
  confidence: ConfidenceLevel
}

export interface AnalysisResult {
  zones: AnalysisZone[]
  summary: string
}

export interface SessionsLogInsert {
  business_id: string
  session_id: string
  event_type: EventType
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  metadata?: Record<string, unknown>
}

export interface MetricsSummary {
  visits: number
  simulation_starts: number
  simulation_completes: number
  whatsapp_clicks: number
}
```

- [ ] **Step 4: Correr test — debe pasar**

```bash
npx vitest run __tests__/types.test.ts
```

Expected: PASS

- [ ] **Step 5: Crear `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: Crear `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies read-only en este contexto
          }
        },
      },
    }
  )
}
```

- [ ] **Step 7: Crear `lib/supabase/service.ts`**

Este cliente usa la service role key y tiene permisos completos. Solo llamarlo desde Server Actions o API routes, nunca exponer al browser.

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada')
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
```

- [ ] **Step 8: Crear `lib/supabase/middleware-client.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

export function createMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add types/ lib/ __tests__/types.test.ts vitest.config.ts vitest.setup.ts
git commit -m "feat: types, Supabase clients, Vitest setup"
```

---

## Task 3: Migraciones de base de datos

**Files:**
- Create: `supabase/migrations/001_schema.sql`
- Create: `supabase/migrations/002_rls.sql`
- Create: `supabase/migrations/003_seed.sql`

- [ ] **Step 1: Crear `supabase/migrations/001_schema.sql`**

```sql
-- business_types: Seed data, no editable por usuarios
CREATE TABLE business_types (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  face_map_type text NOT NULL CHECK (face_map_type IN ('face', 'hair', 'hands', 'brows')),
  created_at    timestamptz DEFAULT now()
);

-- businesses: El tenant central
CREATE TABLE businesses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id  uuid REFERENCES business_types(id),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  custom_domain     text UNIQUE,
  logo_url          text,
  primary_color     text NOT NULL DEFAULT '#6366f1',
  secondary_color   text NOT NULL DEFAULT '#a855f7',
  tagline           text,
  whatsapp_number   text NOT NULL,
  whatsapp_message  text,
  city              text,
  country           text,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- business_users: Admins vinculados a un negocio
CREATE TABLE business_users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id  uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  role         text NOT NULL DEFAULT 'admin',
  created_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- procedure_zones: Zonas del FaceMap por tipo de negocio
CREATE TABLE procedure_zones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id  uuid REFERENCES business_types(id) ON DELETE CASCADE NOT NULL,
  name              text NOT NULL,
  svg_id            text NOT NULL,
  created_at        timestamptz DEFAULT now()
);

-- procedures: Procedimientos configurados por cada negocio
CREATE TABLE procedures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  zone_id     uuid REFERENCES procedure_zones(id),
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- sessions_log: Eventos anónimos para analytics
CREATE TABLE sessions_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  session_id   text NOT NULL,
  event_type   text NOT NULL CHECK (event_type IN ('visit', 'simulation_start', 'simulation_complete', 'whatsapp_click')),
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text,
  metadata     jsonb,
  created_at   timestamptz DEFAULT now()
);

-- Índices de performance
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_custom_domain ON businesses(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_sessions_log_business_id ON sessions_log(business_id);
CREATE INDEX idx_sessions_log_created_at ON sessions_log(created_at);
CREATE INDEX idx_procedures_business_id ON procedures(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
```

- [ ] **Step 2: Crear `supabase/migrations/002_rls.sql`**

```sql
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_log ENABLE ROW LEVEL SECURITY;

-- Helper: obtener business_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS uuid AS $$
  SELECT business_id FROM business_users
  WHERE user_id = auth.uid()
  LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: verificar si es superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean AS $$
  SELECT auth.jwt() ->> 'email' = current_setting('app.superadmin_email', true)
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- business_types: lectura pública
CREATE POLICY "public read business_types" ON business_types FOR SELECT USING (true);
CREATE POLICY "superadmin write business_types" ON business_types FOR ALL USING (is_superadmin());

-- businesses: lectura pública (para middleware), admin edita el suyo
CREATE POLICY "public read businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "admin update own business" ON businesses
  FOR UPDATE USING (id = get_user_business_id() OR is_superadmin());
CREATE POLICY "superadmin insert business" ON businesses FOR INSERT WITH CHECK (is_superadmin());

-- business_users: solo superadmin gestiona
CREATE POLICY "superadmin all business_users" ON business_users FOR ALL USING (is_superadmin());
CREATE POLICY "admin read own record" ON business_users FOR SELECT USING (user_id = auth.uid());

-- procedure_zones: lectura pública
CREATE POLICY "public read procedure_zones" ON procedure_zones FOR SELECT USING (true);
CREATE POLICY "superadmin write procedure_zones" ON procedure_zones FOR ALL USING (is_superadmin());

-- procedures: lectura pública de activas, admin gestiona las suyas
CREATE POLICY "public read active procedures" ON procedures FOR SELECT USING (is_active = true);
CREATE POLICY "admin manage own procedures" ON procedures
  FOR ALL USING (business_id = get_user_business_id() OR is_superadmin());

-- sessions_log: INSERT anónimo público, SELECT solo admin del negocio o superadmin
CREATE POLICY "public insert sessions_log" ON sessions_log FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read own sessions_log" ON sessions_log
  FOR SELECT USING (business_id = get_user_business_id() OR is_superadmin());
```

- [ ] **Step 3: Crear `supabase/migrations/003_seed.sql`**

```sql
INSERT INTO business_types (id, name, slug, face_map_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Clínica Estética', 'clinica', 'face'),
  ('22222222-2222-2222-2222-222222222222', 'Barbería', 'barberia', 'hair'),
  ('33333333-3333-3333-3333-333333333333', 'Spa de Uñas', 'spa_unas', 'hands'),
  ('44444444-4444-4444-4444-444444444444', 'Micropigmentación', 'micropigmentacion', 'brows');

-- Zonas: face
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Frente', 'frente'),
  ('11111111-1111-1111-1111-111111111111', 'Ojo Izquierdo', 'ojos_izq'),
  ('11111111-1111-1111-1111-111111111111', 'Ojo Derecho', 'ojos_der'),
  ('11111111-1111-1111-1111-111111111111', 'Nariz', 'nariz'),
  ('11111111-1111-1111-1111-111111111111', 'Labios', 'labios'),
  ('11111111-1111-1111-1111-111111111111', 'Mejilla Izquierda', 'mejilla_izq'),
  ('11111111-1111-1111-1111-111111111111', 'Mejilla Derecha', 'mejilla_der'),
  ('11111111-1111-1111-1111-111111111111', 'Mentón', 'menton'),
  ('11111111-1111-1111-1111-111111111111', 'Cuello', 'cuello');

-- Zonas: hair
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Parte Superior', 'parte_superior'),
  ('22222222-2222-2222-2222-222222222222', 'Lado Izquierdo', 'lado_izq'),
  ('22222222-2222-2222-2222-222222222222', 'Lado Derecho', 'lado_der'),
  ('22222222-2222-2222-2222-222222222222', 'Nuca', 'nuca'),
  ('22222222-2222-2222-2222-222222222222', 'Barba', 'barba'),
  ('22222222-2222-2222-2222-222222222222', 'Patillas', 'patillas');

-- Zonas: hands
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Uñas', 'unas'),
  ('33333333-3333-3333-3333-333333333333', 'Cutículas', 'cuticulas'),
  ('33333333-3333-3333-3333-333333333333', 'Dorso', 'dorso');

-- Zonas: brows
INSERT INTO procedure_zones (business_type_id, name, svg_id) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Ceja Izquierda', 'ceja_izq'),
  ('44444444-4444-4444-4444-444444444444', 'Ceja Derecha', 'ceja_der'),
  ('44444444-4444-4444-4444-444444444444', 'Labio Superior', 'labio_superior'),
  ('44444444-4444-4444-4444-444444444444', 'Labio Inferior', 'labio_inferior');
```

- [ ] **Step 4: Aplicar migraciones en Supabase**

Ir al dashboard de Supabase → SQL Editor. Ejecutar los 3 archivos en orden: `001_schema.sql` → `002_rls.sql` → `003_seed.sql`.

Verificar en Table Editor: deben aparecer las 6 tablas. `business_types` debe tener 4 filas. `procedure_zones` debe tener 22 filas.

- [ ] **Step 5: Configurar SUPERADMIN_EMAIL en Supabase**

En el SQL Editor de Supabase ejecutar (reemplazar con tu email real):

```sql
ALTER DATABASE postgres SET app.superadmin_email = 'admin@glowsim.app';
```

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: database schema, RLS policies, seed data"
```

---

## Task 4: Middleware multi-tenant

**Files:**
- Create: `lib/tenant.ts`
- Create: `middleware.ts`
- Create: `__tests__/tenant.test.ts`

- [ ] **Step 1: Escribir el test del extractor de tenant**

Crear `__tests__/tenant.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { extractTenantIdentifier } from '@/lib/tenant'

describe('extractTenantIdentifier', () => {
  const APP_DOMAIN = 'glowsim.app'

  it('extrae slug de subdominio glowsim.app', () => {
    const result = extractTenantIdentifier('jessica.glowsim.app', APP_DOMAIN)
    expect(result).toEqual({ type: 'slug', value: 'jessica' })
  })

  it('retorna custom_domain para dominios desconocidos', () => {
    const result = extractTenantIdentifier('simulador.jessicaclinica.com', APP_DOMAIN)
    expect(result).toEqual({ type: 'custom_domain', value: 'simulador.jessicaclinica.com' })
  })

  it('retorna none para el dominio raíz exacto', () => {
    const result = extractTenantIdentifier('glowsim.app', APP_DOMAIN)
    expect(result).toEqual({ type: 'none' })
  })

  it('retorna none para localhost', () => {
    const result = extractTenantIdentifier('localhost:3000', APP_DOMAIN)
    expect(result).toEqual({ type: 'none' })
  })

  it('extrae slug de subdominio con puerto en desarrollo', () => {
    // No aplica para subdominio (el subdominio no tiene puerto en real), pero
    // host puede tener puerto en desarrollo local con proxy
    const result = extractTenantIdentifier('demo.glowsim.app', APP_DOMAIN)
    expect(result).toEqual({ type: 'slug', value: 'demo' })
  })
})
```

- [ ] **Step 2: Correr test — debe fallar**

```bash
npx vitest run __tests__/tenant.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/tenant'"

- [ ] **Step 3: Crear `lib/tenant.ts`**

```typescript
type TenantIdentifier =
  | { type: 'slug'; value: string }
  | { type: 'custom_domain'; value: string }
  | { type: 'none' }

export function extractTenantIdentifier(
  host: string,
  appDomain: string
): TenantIdentifier {
  const cleanHost = host.split(':')[0]

  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return { type: 'none' }
  }

  if (cleanHost === appDomain) {
    return { type: 'none' }
  }

  const suffix = `.${appDomain}`
  if (cleanHost.endsWith(suffix)) {
    const slug = cleanHost.slice(0, -suffix.length)
    return { type: 'slug', value: slug }
  }

  return { type: 'custom_domain', value: cleanHost }
}
```

- [ ] **Step 4: Correr tests — deben pasar**

```bash
npx vitest run __tests__/tenant.test.ts
```

Expected: PASS (5/5)

- [ ] **Step 5: Crear `middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'
import { extractTenantIdentifier } from '@/lib/tenant'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)
  const pathname = req.nextUrl.pathname

  // Actualizar sesión Supabase en cada request
  await supabase.auth.getSession()

  // Rutas internas — sin lógica adicional
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return res
  }

  // Admin: proteger con auth, sin tenant
  if (pathname.startsWith('/admin')) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return res
  }

  // Super admin: proteger con auth + verificar email
  if (pathname.startsWith('/superadmin')) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session && pathname !== '/superadmin/login') {
      return NextResponse.redirect(new URL('/superadmin/login', req.url))
    }
    if (session && session.user.email !== process.env.SUPERADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return res
  }

  // Resolver tenant para rutas públicas
  const host = req.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'glowsim.app'
  const identifier = extractTenantIdentifier(host, appDomain)

  if (identifier.type === 'none') return res

  let businessId: string | null = null

  if (identifier.type === 'slug') {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', identifier.value)
      .eq('is_active', true)
      .single()
    businessId = data?.id ?? null
  } else {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('custom_domain', identifier.value)
      .eq('is_active', true)
      .single()
    businessId = data?.id ?? null
  }

  if (businessId) {
    res.headers.set('X-Business-ID', businessId)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/tenant.ts middleware.ts __tests__/tenant.test.ts
git commit -m "feat: multi-tenant middleware with slug/domain resolution"
```

---

## Task 5: SVG FaceMap assets

**Files:**
- Create: `public/facemaps/face.svg`
- Create: `public/facemaps/hair.svg`
- Create: `public/facemaps/hands.svg`
- Create: `public/facemaps/brows.svg`

Los SVG son overlays transparentes. `viewBox="0 0 100 130"`. Cada zona es un elemento con clase `facemap-zone` e `id` que corresponde al `svg_id` del seed. Se posicionan sobre la foto del usuario vía `absolute inset-0`. La opacidad se controla con JavaScript.

- [ ] **Step 1: Crear `public/facemaps/face.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" fill="none" width="100%" height="100%" style="position:absolute;inset:0;">
  <ellipse id="frente" cx="50" cy="22" rx="28" ry="12" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="ojos_izq" cx="36" cy="40" rx="10" ry="6" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="ojos_der" cx="64" cy="40" rx="10" ry="6" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="nariz" cx="50" cy="55" rx="8" ry="10" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="mejilla_izq" cx="30" cy="60" rx="12" ry="10" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="mejilla_der" cx="70" cy="60" rx="12" ry="10" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="labios" cx="50" cy="72" rx="14" ry="7" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="menton" cx="50" cy="84" rx="12" ry="7" fill="currentColor" opacity="0" class="facemap-zone"/>
  <rect id="cuello" x="34" y="95" width="32" height="25" rx="8" fill="currentColor" opacity="0" class="facemap-zone"/>
</svg>
```

- [ ] **Step 2: Crear `public/facemaps/hair.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" fill="none" width="100%" height="100%" style="position:absolute;inset:0;">
  <ellipse id="parte_superior" cx="50" cy="18" rx="30" ry="16" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="lado_izq" cx="18" cy="50" rx="14" ry="22" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="lado_der" cx="82" cy="50" rx="14" ry="22" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="nuca" cx="50" cy="95" rx="26" ry="14" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="barba" cx="50" cy="78" rx="18" ry="10" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="patillas" cx="50" cy="62" rx="28" ry="8" fill="currentColor" opacity="0" class="facemap-zone"/>
</svg>
```

- [ ] **Step 3: Crear `public/facemaps/hands.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" fill="none" width="100%" height="100%" style="position:absolute;inset:0;">
  <ellipse id="unas" cx="50" cy="28" rx="35" ry="18" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="cuticulas" cx="50" cy="50" rx="35" ry="8" fill="currentColor" opacity="0" class="facemap-zone"/>
  <rect id="dorso" x="20" y="55" width="60" height="55" rx="10" fill="currentColor" opacity="0" class="facemap-zone"/>
</svg>
```

- [ ] **Step 4: Crear `public/facemaps/brows.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" fill="none" width="100%" height="100%" style="position:absolute;inset:0;">
  <ellipse id="ceja_izq" cx="30" cy="42" rx="22" ry="8" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="ceja_der" cx="70" cy="42" rx="22" ry="8" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="labio_superior" cx="50" cy="72" rx="20" ry="7" fill="currentColor" opacity="0" class="facemap-zone"/>
  <ellipse id="labio_inferior" cx="50" cy="85" rx="18" ry="7" fill="currentColor" opacity="0" class="facemap-zone"/>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add public/facemaps/
git commit -m "feat: SVG facemap overlays for face, hair, hands, brows"
```

---

## Task 6: Server Actions — Gemini + Analytics

**Files:**
- Create: `lib/gemini.ts`
- Create: `lib/session.ts`
- Create: `app/actions/analyze.ts`
- Create: `app/actions/analytics.ts`
- Create: `__tests__/analyze.test.ts`
- Create: `__tests__/analytics.test.ts`

- [ ] **Step 1: Crear `lib/gemini.ts`**

```typescript
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { FaceMapType, AnalysisResult } from '@/types'

const ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    zones: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          svg_id: { type: SchemaType.STRING },
          zone_name: { type: SchemaType.STRING },
          procedures: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          description: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING, enum: ['high', 'medium', 'low'] },
        },
        required: ['svg_id', 'zone_name', 'procedures', 'description', 'confidence'],
      },
    },
    summary: { type: SchemaType.STRING },
  },
  required: ['zones', 'summary'],
}

const PROMPTS: Record<FaceMapType, (procedures: string) => string> = {
  face: (procedures) =>
    `Eres un experto en estética facial. Analiza esta fotografía de rostro y recomienda procedimientos para las zonas que lo necesiten.

Procedimientos disponibles: ${procedures}

Usa solo estos svg_id exactos: frente, ojos_izq, ojos_der, nariz, labios, mejilla_izq, mejilla_der, menton, cuello.
Solo incluye zonas que realmente veas y necesiten atención. Máximo 5 zonas.
Descripción de cada zona: 2-3 oraciones en español. Summary: 1 párrafo motivador.`,

  hair: (procedures) =>
    `Eres un barbero/estilista experto. Analiza esta fotografía y recomienda servicios para las zonas del cabello.

Servicios disponibles: ${procedures}

Usa solo estos svg_id exactos: parte_superior, lado_izq, lado_der, nuca, barba, patillas.
Máximo 4 zonas. Descripción en español, 2-3 oraciones. Summary motivador.`,

  hands: (procedures) =>
    `Eres una especialista en spa de uñas. Analiza esta fotografía de manos y recomienda tratamientos.

Tratamientos disponibles: ${procedures}

Usa solo estos svg_id exactos: unas, cuticulas, dorso.
Descripción en español, 2-3 oraciones. Summary motivador.`,

  brows: (procedures) =>
    `Eres una experta en micropigmentación. Analiza esta fotografía y recomienda tratamientos.

Tratamientos disponibles: ${procedures}

Usa solo estos svg_id exactos: ceja_izq, ceja_der, labio_superior, labio_inferior.
Descripción en español, 2-3 oraciones. Summary motivador.`,
}

export async function analyzeWithGemini(
  base64Image: string,
  faceMapType: FaceMapType,
  procedureNames: string[]
): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA as any,
    },
  })

  const mimeType = base64Image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
  const prompt = PROMPTS[faceMapType](procedureNames.join(', '))

  const result = await model.generateContent([
    { inlineData: { data: base64Image, mimeType } },
    prompt,
  ])

  return JSON.parse(result.response.text()) as AnalysisResult
}
```

- [ ] **Step 2: Crear `lib/session.ts`**

```typescript
const SESSION_KEY = 'glowsim_session_id'

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}
```

- [ ] **Step 3: Escribir test del Server Action analyze**

Crear `__tests__/analyze.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/gemini', () => ({
  analyzeWithGemini: vi.fn().mockResolvedValue({
    zones: [
      {
        svg_id: 'labios',
        zone_name: 'Labios',
        procedures: ['Relleno de labios'],
        description: 'Se observa asimetría leve.',
        confidence: 'high',
      },
    ],
    summary: 'En general, el rostro muestra buen estado.',
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'businesses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'biz-123', business_types: { face_map_type: 'face' } },
            error: null,
          }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'p1', name: 'Relleno de labios', zone: { svg_id: 'labios' } }],
          error: null,
        }),
      }
    }),
  })),
}))

describe('analyzeImage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna AnalysisResult con zonas', async () => {
    const { analyzeImage } = await import('@/app/actions/analyze')
    const result = await analyzeImage('/9j/fakejpeg', 'biz-123')
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].svg_id).toBe('labios')
    expect(result.summary).toBeTruthy()
  })

  it('lanza error si base64 está vacío', async () => {
    const { analyzeImage } = await import('@/app/actions/analyze')
    await expect(analyzeImage('', 'biz-123')).rejects.toThrow('La imagen es requerida')
  })

  it('lanza error si businessId está vacío', async () => {
    const { analyzeImage } = await import('@/app/actions/analyze')
    await expect(analyzeImage('/9j/fake', '')).rejects.toThrow('El negocio es requerido')
  })
})
```

- [ ] **Step 4: Correr test — debe fallar**

```bash
npx vitest run __tests__/analyze.test.ts
```

Expected: FAIL — "Cannot find module '@/app/actions/analyze'"

- [ ] **Step 5: Crear `app/actions/analyze.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { analyzeWithGemini } from '@/lib/gemini'
import type { AnalysisResult, FaceMapType } from '@/types'

export async function analyzeImage(
  base64: string,
  businessId: string
): Promise<AnalysisResult> {
  if (!base64) throw new Error('La imagen es requerida')
  if (!businessId) throw new Error('El negocio es requerido')

  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64

  const supabase = createClient()

  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (bizError || !business) throw new Error('Negocio no encontrado')

  const faceMapType = (business.business_types as any)?.face_map_type as FaceMapType

  const { data: procedures } = await supabase
    .from('procedures')
    .select('name, zone:procedure_zones(svg_id)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order')

  const procedureNames = (procedures ?? []).map((p: any) => p.name)

  return analyzeWithGemini(cleanBase64, faceMapType, procedureNames)
}
```

- [ ] **Step 6: Correr test — debe pasar**

```bash
npx vitest run __tests__/analyze.test.ts
```

Expected: PASS

- [ ] **Step 7: Escribir test del logEvent**

Crear `__tests__/analytics.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}))

describe('logEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserta evento en sessions_log', async () => {
    const { logEvent } = await import('@/app/actions/analytics')
    await logEvent({
      business_id: 'biz-123',
      session_id: 'session-abc',
      event_type: 'visit',
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        business_id: 'biz-123',
        session_id: 'session-abc',
        event_type: 'visit',
      })
    )
  })

  it('no lanza error aunque falle el insert (analytics no bloquea UX)', async () => {
    mockInsert.mockResolvedValueOnce({ error: new Error('DB error') })
    const { logEvent } = await import('@/app/actions/analytics')
    await expect(
      logEvent({ business_id: 'biz', session_id: 'sid', event_type: 'visit' })
    ).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 8: Crear `app/actions/analytics.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import type { SessionsLogInsert } from '@/types'

export async function logEvent(event: SessionsLogInsert): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('sessions_log').insert(event)
  } catch {
    // Analytics no debe bloquear la UX del usuario
  }
}
```

- [ ] **Step 9: Correr todos los tests**

```bash
npx vitest run
```

Expected: PASS — todos los tests pasan.

- [ ] **Step 10: Commit**

```bash
git add lib/gemini.ts lib/session.ts app/actions/ __tests__/
git commit -m "feat: analyzeImage (Gemini), logEvent (analytics), tests"
```

---

## Task 7: Componentes del simulador

**Files:**
- Create: `lib/facemap.ts`
- Create: `components/simulator/PhotoUploader.tsx`
- Create: `components/simulator/FaceMap.tsx`
- Create: `components/simulator/ZonePanel.tsx`
- Create: `components/simulator/WhatsAppCTA.tsx`

- [ ] **Step 1: Crear `lib/facemap.ts`**

```typescript
const cache: Record<string, string> = {}

export async function loadFaceMapSVG(type: string): Promise<string> {
  if (cache[type]) return cache[type]
  const res = await fetch(`/facemaps/${type}.svg`)
  const text = await res.text()
  cache[type] = text
  return text
}
```

- [ ] **Step 2: Crear `components/simulator/PhotoUploader.tsx`**

```typescript
'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, Loader2 } from 'lucide-react'

interface PhotoUploaderProps {
  onPhotoSelected: (base64: string) => void
  isLoading: boolean
}

async function resizeToBase64(file: File, maxPx = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export function PhotoUploader({ onPhotoSelected, isLoading }: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    const base64 = await resizeToBase64(file)
    setPreview(base64)
    onPhotoSelected(base64)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      {!preview ? (
        <>
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900">
            <Camera className="w-16 h-16 text-zinc-600" />
          </div>
          <p className="text-xs text-zinc-500 text-center">
            Tu foto no se guarda en ningún servidor
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => cameraRef.current?.click()} className="w-full gap-2">
              <Camera className="w-4 h-4" />
              Tomar selfie
            </Button>
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full gap-2">
              <Upload className="w-4 h-4" />
              Subir foto
            </Button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </>
      ) : (
        <div className="relative w-full max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Tu foto" className="w-full rounded-xl object-cover" />
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <p className="text-sm text-white font-medium">Analizando con IA...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Crear `components/simulator/FaceMap.tsx`**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import type { AnalysisZone, FaceMapType } from '@/types'
import { loadFaceMapSVG } from '@/lib/facemap'

interface FaceMapProps {
  faceMapType: FaceMapType
  zones: AnalysisZone[]
  activeZoneId: string | null
  onZoneClick: (svgId: string) => void
  primaryColor: string
  userPhotoBase64: string
}

export function FaceMap({
  faceMapType,
  zones,
  activeZoneId,
  onZoneClick,
  primaryColor,
  userPhotoBase64,
}: FaceMapProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState('')
  const analyzedIds = new Set(zones.map((z) => z.svg_id))

  useEffect(() => {
    loadFaceMapSVG(faceMapType).then(setSvgContent)
  }, [faceMapType])

  useEffect(() => {
    const container = overlayRef.current
    if (!container || !svgContent) return
    const elements = container.querySelectorAll<SVGElement>('.facemap-zone')
    elements.forEach((el) => {
      if (analyzedIds.has(el.id)) {
        el.style.fill = primaryColor
        el.style.opacity = el.id === activeZoneId ? '0.65' : '0.35'
        el.style.cursor = 'pointer'
        el.style.transition = 'opacity 0.2s'
      } else {
        el.style.fill = '#6b7280'
        el.style.opacity = '0.08'
        el.style.cursor = 'default'
      }
    })
  }, [svgContent, zones, activeZoneId, primaryColor, analyzedIds])

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as SVGElement
    if (target.classList.contains('facemap-zone') && analyzedIds.has(target.id)) {
      onZoneClick(target.id)
    }
  }

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={userPhotoBase64} alt="Tu foto" className="w-full rounded-xl object-cover" />
      {svgContent && (
        <div
          ref={overlayRef}
          onClick={handleClick}
          className="absolute inset-0 rounded-xl overflow-hidden"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
      <p className="mt-2 text-xs text-center text-zinc-500">
        Toca una zona iluminada para ver las recomendaciones
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Crear `components/simulator/ZonePanel.tsx`**

```typescript
'use client'

import type { AnalysisZone } from '@/types'
import { Badge } from '@/components/ui/badge'

interface ZonePanelProps {
  activeZone: AnalysisZone | null
  allZones: AnalysisZone[]
  summary: string
  onZoneSelect: (svgId: string) => void
}

export function ZonePanel({ activeZone, allZones, summary, onZoneSelect }: ZonePanelProps) {
  return (
    <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-6 space-y-4">
      <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

      <div className="flex flex-wrap gap-2">
        {allZones.map((zone) => (
          <button
            key={zone.svg_id}
            onClick={() => onZoneSelect(zone.svg_id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeZone?.svg_id === zone.svg_id
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {zone.zone_name}
          </button>
        ))}
      </div>

      {activeZone ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">{activeZone.zone_name}</h3>
          <div className="flex flex-wrap gap-2">
            {activeZone.procedures.map((proc) => (
              <Badge key={proc} variant="secondary" className="text-xs">{proc}</Badge>
            ))}
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{activeZone.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Confianza:</span>
            <Badge
              variant="outline"
              className={`text-xs ${
                activeZone.confidence === 'high'
                  ? 'border-green-500 text-green-400'
                  : activeZone.confidence === 'medium'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-red-500 text-red-400'
              }`}
            >
              {activeZone.confidence === 'high' ? 'Alta' : activeZone.confidence === 'medium' ? 'Media' : 'Baja'}
            </Badge>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Crear `components/simulator/WhatsAppCTA.tsx`**

```typescript
'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppCTAProps {
  whatsappNumber: string
  whatsappMessage: string
  businessName: string
  primaryColor: string
  onClick: () => void
}

export function WhatsAppCTA({
  whatsappNumber,
  whatsappMessage,
  businessName,
  primaryColor,
  onClick,
}: WhatsAppCTAProps) {
  const message =
    whatsappMessage ||
    `Hola, acabo de hacer mi simulación en ${businessName} y me gustaría agendar una consulta gratuita 😊`

  const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={onClick} className="block w-full">
      <button
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-transform active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageCircle className="w-6 h-6" />
        Agendar mi consulta gratis
      </button>
    </a>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/facemap.ts components/simulator/
git commit -m "feat: simulator components — PhotoUploader, FaceMap, ZonePanel, WhatsAppCTA"
```

---

## Task 8: Zona pública — Landing page y Simulador

**Files:**
- Create: `components/public/BusinessHero.tsx`
- Create: `components/public/ProcedureCards.tsx`
- Create: `components/simulator/SimulatorClient.tsx`
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/simular/page.tsx`

- [ ] **Step 1: Crear `components/public/BusinessHero.tsx`**

```typescript
import Link from 'next/link'

interface BusinessHeroProps {
  businessName: string
  tagline: string | null
  primaryColor: string
  logoUrl: string | null
}

export function BusinessHero({ businessName, tagline, primaryColor, logoUrl }: BusinessHeroProps) {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-12 pb-8 gap-6">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={businessName} className="h-16 w-auto object-contain" />
      ) : (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {businessName[0]}
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{businessName}</h1>
        {tagline && <p className="text-zinc-400 text-lg">{tagline}</p>}
      </div>

      <p className="text-zinc-200 text-xl font-medium">
        Descubre tu mejor versión con IA ✨
      </p>

      <Link href="/simular" className="block w-full max-w-xs">
        <button
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-transform active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          Iniciar simulación gratis
        </button>
      </Link>
    </section>
  )
}
```

- [ ] **Step 2: Crear `components/public/ProcedureCards.tsx`**

```typescript
import type { Procedure } from '@/types'

interface ProcedureCardsProps {
  procedures: Procedure[]
  primaryColor: string
}

export function ProcedureCards({ procedures, primaryColor }: ProcedureCardsProps) {
  if (!procedures.length) return null

  return (
    <section className="px-6 py-8">
      <h2 className="text-base font-semibold text-white mb-4">Nuestros servicios</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {procedures.map((proc) => (
          <div
            key={proc.id}
            className="flex-shrink-0 snap-start w-44 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2"
          >
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: `${primaryColor}33` }}
            />
            <h3 className="text-sm font-medium text-white">{proc.name}</h3>
            {proc.description && (
              <p className="text-xs text-zinc-400 line-clamp-2">{proc.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Crear `components/simulator/SimulatorClient.tsx`**

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { AnalysisResult, FaceMapType } from '@/types'
import { PhotoUploader } from './PhotoUploader'
import { FaceMap } from './FaceMap'
import { ZonePanel } from './ZonePanel'
import { WhatsAppCTA } from './WhatsAppCTA'
import { analyzeImage } from '@/app/actions/analyze'
import { logEvent } from '@/app/actions/analytics'
import { getOrCreateSessionId } from '@/lib/session'

interface SimulatorClientProps {
  businessId: string
  businessName: string
  faceMapType: FaceMapType
  primaryColor: string
  whatsappNumber: string
  whatsappMessage: string
}

type Step = 'upload' | 'analyzing' | 'results'

export function SimulatorClient({
  businessId,
  businessName,
  faceMapType,
  primaryColor,
  whatsappNumber,
  whatsappMessage,
}: SimulatorClientProps) {
  const [step, setStep] = useState<Step>('upload')
  const [photoBase64, setPhotoBase64] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  function utmParams() {
    return {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_term: searchParams.get('utm_term'),
      utm_content: searchParams.get('utm_content'),
    }
  }

  const handlePhotoSelected = useCallback(
    async (base64: string) => {
      setPhotoBase64(base64)
      setStep('analyzing')
      setError(null)

      const sessionId = getOrCreateSessionId()
      await logEvent({ business_id: businessId, session_id: sessionId, event_type: 'simulation_start', ...utmParams() })

      try {
        const analysis = await analyzeImage(base64, businessId)
        setResult(analysis)
        setActiveZoneId(analysis.zones[0]?.svg_id ?? null)
        setStep('results')
        await logEvent({
          business_id: businessId,
          session_id: sessionId,
          event_type: 'simulation_complete',
          ...utmParams(),
          metadata: {
            zones_analyzed: analysis.zones.map((z) => z.svg_id),
            procedures_count: analysis.zones.flatMap((z) => z.procedures).length,
          },
        })
      } catch {
        setError('Hubo un error al analizar tu foto. Por favor intenta de nuevo.')
        setStep('upload')
      }
    },
    [businessId, searchParams]
  )

  async function handleWhatsAppClick() {
    await logEvent({
      business_id: businessId,
      session_id: getOrCreateSessionId(),
      event_type: 'whatsapp_click',
      ...utmParams(),
    })
  }

  const activeZone = result?.zones.find((z) => z.svg_id === activeZoneId) ?? null

  return (
    <div className="flex flex-col min-h-[calc(100vh-57px)]">
      {(step === 'upload' || step === 'analyzing') && (
        <div className="flex-1 flex flex-col items-center justify-center">
          {error && <p className="text-red-400 text-sm text-center px-6 mb-4">{error}</p>}
          <PhotoUploader onPhotoSelected={handlePhotoSelected} isLoading={step === 'analyzing'} />
        </div>
      )}

      {step === 'results' && result && (
        <div className="flex flex-col flex-1">
          <div className="p-4">
            <FaceMap
              faceMapType={faceMapType}
              zones={result.zones}
              activeZoneId={activeZoneId}
              onZoneClick={setActiveZoneId}
              primaryColor={primaryColor}
              userPhotoBase64={photoBase64}
            />
          </div>
          <div className="mt-auto">
            <ZonePanel
              activeZone={activeZone}
              allZones={result.zones}
              summary={result.summary}
              onZoneSelect={setActiveZoneId}
            />
            <div className="bg-zinc-900 px-6 pb-8 pt-4 border-t border-zinc-800">
              <WhatsAppCTA
                whatsappNumber={whatsappNumber}
                whatsappMessage={whatsappMessage}
                businessName={businessName}
                primaryColor={primaryColor}
                onClick={handleWhatsAppClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Crear `app/(public)/layout.tsx`**

```typescript
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const businessId = headersList.get('X-Business-ID')

  if (!businessId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-2">GlowSim</h1>
          <p className="text-zinc-400">Simulación visual con IA para tu negocio</p>
        </div>
      </div>
    )
  }

  const supabase = createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('primary_color, secondary_color')
    .eq('id', businessId)
    .single()

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        ['--business-primary' as string]: business?.primary_color ?? '#6366f1',
        ['--business-secondary' as string]: business?.secondary_color ?? '#a855f7',
      }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Crear `app/(public)/page.tsx`**

```typescript
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BusinessHero } from '@/components/public/BusinessHero'
import { ProcedureCards } from '@/components/public/ProcedureCards'
import { logEvent } from '@/app/actions/analytics'

export default async function PublicPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const businessId = headers().get('X-Business-ID')
  if (!businessId) return null

  const supabase = createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const { data: procedures } = await supabase
    .from('procedures')
    .select('*, zone:procedure_zones(svg_id, name)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order')

  // Fire-and-forget — no await para no bloquear render
  logEvent({
    business_id: businessId,
    session_id: 'server-visit',
    event_type: 'visit',
    utm_source: searchParams.utm_source ?? null,
    utm_medium: searchParams.utm_medium ?? null,
    utm_campaign: searchParams.utm_campaign ?? null,
    utm_term: searchParams.utm_term ?? null,
    utm_content: searchParams.utm_content ?? null,
  })

  return (
    <main>
      <BusinessHero
        businessName={business.name}
        tagline={business.tagline}
        primaryColor={business.primary_color}
        logoUrl={business.logo_url}
      />
      <ProcedureCards procedures={procedures ?? []} primaryColor={business.primary_color} />
      <footer className="text-center py-8 text-xs text-zinc-700">
        {business.city && `${business.city} · `}Powered by GlowSim
      </footer>
    </main>
  )
}
```

- [ ] **Step 6: Crear `app/(public)/simular/page.tsx`**

`useSearchParams()` en `SimulatorClient` requiere que el componente esté envuelto en `<Suspense>`.

```typescript
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SimulatorClient } from '@/components/simulator/SimulatorClient'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function SimularPage() {
  const businessId = headers().get('X-Business-ID')
  if (!businessId) notFound()

  const supabase = createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type)')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const faceMapType = (business.business_types as any)?.face_map_type ?? 'face'

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">←</Link>
        <span className="text-sm font-medium text-white truncate">{business.name}</span>
      </div>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 text-zinc-500 text-sm">Cargando simulador...</div>}>
        <SimulatorClient
          businessId={businessId}
          businessName={business.name}
          faceMapType={faceMapType}
          primaryColor={business.primary_color}
          whatsappNumber={business.whatsapp_number}
          whatsappMessage={business.whatsapp_message ?? ''}
        />
      </Suspense>
    </main>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(public\)/ components/public/ components/simulator/SimulatorClient.tsx
git commit -m "feat: public landing page, simulator page, SimulatorClient orchestrator"
```

---

## Task 9: Panel Admin — Auth, Layout y Login

**Files:**
- Create: `components/admin/Sidebar.tsx`
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/login/page.tsx`

- [ ] **Step 1: Crear `components/admin/Sidebar.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings, List, BarChart2, LogOut, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/dashboard/configuracion', icon: Settings, label: 'Configuración' },
  { href: '/admin/dashboard/procedimientos', icon: List, label: 'Procedimientos' },
  { href: '/admin/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
]

interface SidebarProps {
  businessName: string
  businessSlug: string
}

export function Sidebar({ businessName, businessSlug }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col">
      <div className="p-5 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Admin</p>
        <h2 className="font-semibold text-white truncate">{businessName}</h2>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-800 space-y-0.5">
        <a
          href={`https://${businessSlug}.glowsim.app`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Globe className="w-4 h-4" />
          Ver mi página
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Crear `app/(admin)/layout.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: businessUser } = await supabase
    .from('business_users')
    .select('business_id, businesses(name, slug)')
    .eq('user_id', session.user.id)
    .single()

  if (!businessUser) redirect('/admin/login')

  const business = businessUser.businesses as any

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <div className="hidden lg:flex">
        <Sidebar businessName={business.name} businessSlug={business.slug} />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Crear `app/(admin)/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">GlowSim Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">Accede a tu panel de negocio</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(admin\)/ components/admin/Sidebar.tsx
git commit -m "feat: admin auth — layout guard, login page, sidebar"
```

---

## Task 10: Panel Admin — Server Actions y páginas

**Files:**
- Create: `app/actions/admin.ts`
- Create: `components/admin/MetricsCards.tsx`
- Create: `components/admin/ConfigForm.tsx`
- Create: `components/admin/ProcedureTable.tsx`
- Create: `components/admin/AnalyticsChart.tsx`
- Create: `app/(admin)/dashboard/page.tsx`
- Create: `app/(admin)/dashboard/configuracion/page.tsx`
- Create: `app/(admin)/dashboard/procedimientos/page.tsx`
- Create: `app/(admin)/dashboard/analytics/page.tsx`

- [ ] **Step 1: Crear `app/actions/admin.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminBusinessId(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autenticado')

  const { data } = await supabase
    .from('business_users')
    .select('business_id')
    .eq('user_id', session.user.id)
    .single()

  if (!data?.business_id) throw new Error('No vinculado a un negocio')
  return data.business_id
}

export async function updateBusinessConfig(formData: FormData) {
  const supabase = createClient()
  const businessId = await getAdminBusinessId()

  const { error } = await supabase.from('businesses').update({
    name: formData.get('name') as string,
    tagline: (formData.get('tagline') as string) || null,
    whatsapp_number: formData.get('whatsapp_number') as string,
    whatsapp_message: (formData.get('whatsapp_message') as string) || null,
    primary_color: formData.get('primary_color') as string,
    secondary_color: formData.get('secondary_color') as string,
    city: (formData.get('city') as string) || null,
    country: (formData.get('country') as string) || null,
    custom_domain: (formData.get('custom_domain') as string) || null,
  }).eq('id', businessId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/configuracion')
}

export async function addProcedure(formData: FormData) {
  const supabase = createClient()
  const businessId = await getAdminBusinessId()

  const { error } = await supabase.from('procedures').insert({
    business_id: businessId,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    zone_id: (formData.get('zone_id') as string) || null,
    is_active: true,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/procedimientos')
}

export async function toggleProcedure(procedureId: string, isActive: boolean) {
  const supabase = createClient()
  const businessId = await getAdminBusinessId()
  await supabase
    .from('procedures')
    .update({ is_active: isActive })
    .eq('id', procedureId)
    .eq('business_id', businessId)
  revalidatePath('/admin/dashboard/procedimientos')
}

export async function deleteProcedure(procedureId: string) {
  const supabase = createClient()
  const businessId = await getAdminBusinessId()
  await supabase
    .from('procedures')
    .delete()
    .eq('id', procedureId)
    .eq('business_id', businessId)
  revalidatePath('/admin/dashboard/procedimientos')
}
```

- [ ] **Step 2: Crear `components/admin/MetricsCards.tsx`**

```typescript
import type { MetricsSummary } from '@/types'

interface MetricsCardsProps {
  metrics: MetricsSummary
  businessSlug: string
}

export function MetricsCards({ metrics, businessSlug }: MetricsCardsProps) {
  const convRate =
    metrics.visits > 0
      ? ((metrics.simulation_completes / metrics.visits) * 100).toFixed(1)
      : '0'

  const cards = [
    { label: 'Visitas', value: metrics.visits, color: 'text-blue-400' },
    { label: 'Simulaciones', value: metrics.simulation_completes, color: 'text-purple-400' },
    { label: 'WhatsApp clicks', value: metrics.whatsapp_clicks, color: 'text-green-400' },
    { label: 'Conversión', value: `${convRate}%`, color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">Tu página pública</p>
          <p className="text-sm text-white font-mono">{businessSlug}.glowsim.app</p>
        </div>
        <a
          href={`https://${businessSlug}.glowsim.app`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Ver ↗
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear `app/(admin)/dashboard/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { MetricsCards } from '@/components/admin/MetricsCards'
import type { MetricsSummary } from '@/types'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug')
    .eq('id', businessId!)
    .single()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: events } = await supabase
    .from('sessions_log')
    .select('event_type')
    .eq('business_id', businessId!)
    .gte('created_at', startOfMonth.toISOString())

  const metrics: MetricsSummary = {
    visits: events?.filter((e) => e.event_type === 'visit').length ?? 0,
    simulation_starts: events?.filter((e) => e.event_type === 'simulation_start').length ?? 0,
    simulation_completes: events?.filter((e) => e.event_type === 'simulation_complete').length ?? 0,
    whatsapp_clicks: events?.filter((e) => e.event_type === 'whatsapp_click').length ?? 0,
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400 text-sm">Métricas del mes actual</p>
      </div>
      <MetricsCards metrics={metrics} businessSlug={business?.slug ?? ''} />
    </div>
  )
}
```

- [ ] **Step 4: Crear `components/admin/ConfigForm.tsx`**

```typescript
'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBusinessConfig } from '@/app/actions/admin'
import type { Business } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface ConfigFormProps {
  business: Business
}

export function ConfigForm({ business }: ConfigFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateBusinessConfig(formData)
        toast({ title: 'Configuración guardada' })
      } catch {
        toast({ title: 'Error al guardar', variant: 'destructive' })
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
          <input type="color" id="primary_color" name="primary_color" defaultValue={business.primary_color} className="h-10 w-full rounded-md cursor-pointer border border-zinc-700 bg-zinc-950 p-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondary_color">Color secundario</Label>
          <input type="color" id="secondary_color" name="secondary_color" defaultValue={business.secondary_color} className="h-10 w-full rounded-md cursor-pointer border border-zinc-700 bg-zinc-950 p-1" />
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
        <p className="text-xs text-zinc-500">Apunta un CNAME de tu dominio a: cname.vercel-dns.com</p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Crear `app/(admin)/dashboard/configuracion/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const supabase = createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_types(face_map_type, name)')
    .eq('id', businessId!)
    .single()

  if (!business) redirect('/admin/login')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Configuración</h1>
        <p className="text-zinc-400 text-sm">Personaliza tu página pública y datos de contacto</p>
      </div>
      <ConfigForm business={{ ...business, face_map_type: (business.business_types as any)?.face_map_type ?? 'face' } as any} />
    </div>
  )
}
```

- [ ] **Step 6: Crear `components/admin/ProcedureTable.tsx`**

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'
import type { Procedure, ProcedureZone } from '@/types'
import { toggleProcedure, deleteProcedure, addProcedure } from '@/app/actions/admin'
import { useToast } from '@/hooks/use-toast'

interface ProcedureTableProps {
  procedures: Procedure[]
  availableZones: ProcedureZone[]
}

export function ProcedureTable({ procedures, availableZones }: ProcedureTableProps) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleProcedure(id, !current) })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este procedimiento?')) return
    startTransition(async () => {
      await deleteProcedure(id)
      toast({ title: 'Procedimiento eliminado' })
    })
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addProcedure(formData)
        setShowForm(false)
        toast({ title: 'Procedimiento agregado' })
      } catch {
        toast({ title: 'Error al agregar', variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {procedures.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-10">No hay procedimientos. Agrega el primero.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Zona</th>
                <th className="px-4 py-3 text-zinc-400 font-medium">Activo</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {procedures.map((proc) => (
                <tr key={proc.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 text-white">{proc.name}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{proc.zone?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={proc.is_active} onCheckedChange={() => handleToggle(proc.id, proc.is_active)} disabled={isPending} />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button onClick={() => handleDelete(proc.id)} className="text-zinc-600 hover:text-red-400 transition-colors" disabled={isPending}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Button variant="outline" onClick={() => setShowForm(!showForm)} className="gap-2">
        <Plus className="w-4 h-4" />
        Agregar procedimiento
      </Button>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-name">Nombre</Label>
              <Input id="proc-name" name="name" required placeholder="Ej: Relleno de labios" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone_id">Zona</Label>
              <select name="zone_id" id="zone_id" className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-md px-3 text-sm text-white">
                <option value="">Sin zona específica</option>
                {availableZones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Descripción breve" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Crear `app/(admin)/dashboard/procedimientos/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { ProcedureTable } from '@/components/admin/ProcedureTable'

export default async function ProcedimientosPage() {
  const supabase = createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('business_type_id')
    .eq('id', businessId!)
    .single()

  const [{ data: procedures }, { data: zones }] = await Promise.all([
    supabase
      .from('procedures')
      .select('*, zone:procedure_zones(id, name, svg_id)')
      .eq('business_id', businessId!)
      .order('sort_order'),
    supabase
      .from('procedure_zones')
      .select('*')
      .eq('business_type_id', business?.business_type_id ?? '')
      .order('name'),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Procedimientos</h1>
        <p className="text-zinc-400 text-sm">Gestiona los servicios de tu negocio</p>
      </div>
      <ProcedureTable procedures={(procedures ?? []) as any} availableZones={zones ?? []} />
    </div>
  )
}
```

- [ ] **Step 8: Crear `components/admin/AnalyticsChart.tsx`**

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartPoint {
  date: string
  visitas: number
  simulaciones: number
}

export function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-4">Últimos 30 días</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} width={25} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
          <Line type="monotone" dataKey="visitas" stroke="#60a5fa" strokeWidth={2} dot={false} name="Visitas" />
          <Line type="monotone" dataKey="simulaciones" stroke="#a78bfa" strokeWidth={2} dot={false} name="Simulaciones" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 9: Crear `app/(admin)/dashboard/analytics/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminBusinessId } from '@/app/actions/admin'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'

function groupByDay(events: { created_at: string; event_type: string }[]) {
  const map: Record<string, { visitas: number; simulaciones: number }> = {}
  events.forEach(({ created_at, event_type }) => {
    const date = created_at.slice(5, 10) // MM-DD
    if (!map[date]) map[date] = { visitas: 0, simulaciones: 0 }
    if (event_type === 'visit') map[date].visitas++
    if (event_type === 'simulation_complete') map[date].simulaciones++
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))
}

function groupBySource(events: { utm_source: string | null }[]) {
  const map: Record<string, number> = {}
  events.forEach(({ utm_source }) => {
    const src = utm_source ?? '(directo)'
    map[src] = (map[src] ?? 0) + 1
  })
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))
}

export default async function AnalyticsPage() {
  const supabase = createClient()
  let businessId: string
  try {
    businessId = await getAdminBusinessId()
  } catch {
    redirect('/admin/login')
  }

  const thirtyAgo = new Date()
  thirtyAgo.setDate(thirtyAgo.getDate() - 30)

  const { data: events } = await supabase
    .from('sessions_log')
    .select('event_type, utm_source, created_at')
    .eq('business_id', businessId!)
    .gte('created_at', thirtyAgo.toISOString())
    .order('created_at')

  const chartData = groupByDay(events ?? [])
  const sources = groupBySource((events ?? []).filter((e) => e.event_type === 'visit'))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-400 text-sm">Últimos 30 días</p>
      </div>
      <AnalyticsChart data={chartData} />
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-white">Fuentes de tráfico</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-2 text-zinc-400 font-medium">Fuente</th>
              <th className="text-right px-4 py-2 text-zinc-400 font-medium">Visitas</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-6 text-center text-zinc-600 text-xs">Sin datos aún</td></tr>
            ) : (
              sources.map(({ source, count }) => (
                <tr key={source} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-2 text-zinc-300">{source}</td>
                  <td className="px-4 py-2 text-right text-white font-medium">{count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Commit**

```bash
git add app/\(admin\)/dashboard/ components/admin/ app/actions/admin.ts
git commit -m "feat: admin dashboard — overview, config, procedures, analytics"
```

---

## Task 11: Panel Super Admin

**Files:**
- Create: `app/actions/superadmin.ts`
- Create: `app/(superadmin)/layout.tsx`
- Create: `app/(superadmin)/login/page.tsx`
- Create: `app/(superadmin)/dashboard/page.tsx`
- Create: `app/(superadmin)/dashboard/negocios/page.tsx`
- Create: `app/(superadmin)/dashboard/negocios/nuevo/page.tsx`
- Create: `app/(superadmin)/dashboard/analytics/page.tsx`
- Create: `components/superadmin/BusinessTable.tsx`
- Create: `components/superadmin/CreateBusinessForm.tsx`

- [ ] **Step 1: Crear `app/actions/superadmin.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

async function assertSuperAdmin() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autenticado')
  if (session.user.email !== process.env.SUPERADMIN_EMAIL) throw new Error('No autorizado')
  return supabase
}

export async function getBusinesses() {
  const supabase = await assertSuperAdmin()
  const { data } = await supabase
    .from('businesses')
    .select('*, business_types(name, face_map_type)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function toggleBusinessActive(businessId: string, isActive: boolean) {
  const supabase = await assertSuperAdmin()
  await supabase.from('businesses').update({ is_active: isActive }).eq('id', businessId)
  revalidatePath('/superadmin/dashboard/negocios')
}

export async function createBusiness(formData: FormData) {
  await assertSuperAdmin()

  const adminEmail = formData.get('admin_email') as string
  const businessTypeId = formData.get('business_type_id') as string
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string).toLowerCase().replace(/\s+/g, '-')
  const whatsappNumber = formData.get('whatsapp_number') as string

  // Usar service client para operaciones admin
  const serviceClient = createServiceClient()

  const { data: business, error: bizError } = await serviceClient
    .from('businesses')
    .insert({ business_type_id: businessTypeId, name, slug, whatsapp_number: whatsappNumber })
    .select('id')
    .single()

  if (bizError || !business) throw new Error(bizError?.message ?? 'Error al crear negocio')

  // Invitar al admin por email (enviará email de configuración de contraseña)
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(adminEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
  })

  if (inviteError || !inviteData.user) {
    // Limpiar negocio si falla la invitación
    await serviceClient.from('businesses').delete().eq('id', business.id)
    throw new Error(inviteError?.message ?? 'Error al invitar admin')
  }

  await serviceClient.from('business_users').insert({
    user_id: inviteData.user.id,
    business_id: business.id,
    role: 'admin',
  })

  revalidatePath('/superadmin/dashboard/negocios')
  return business.id
}
```

- [ ] **Step 2: Crear `app/(superadmin)/layout.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/superadmin/dashboard', label: 'Overview' },
  { href: '/superadmin/dashboard/negocios', label: 'Negocios' },
  { href: '/superadmin/dashboard/analytics', label: 'Analytics' },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/superadmin/login')
  if (session.user.email !== process.env.SUPERADMIN_EMAIL) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-white text-sm">GlowSim</span>
        <span className="text-xs text-zinc-600 border border-zinc-700 px-2 py-0.5 rounded">superadmin</span>
        <div className="flex gap-4 ml-2">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Crear `app/(superadmin)/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">GlowSim Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear `components/superadmin/BusinessTable.tsx`**

```typescript
'use client'

import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { toggleBusinessActive } from '@/app/actions/superadmin'

interface Business {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
  business_types: { name: string } | null
}

export function BusinessTable({ businesses }: { businesses: Business[] }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleBusinessActive(id, !current) })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {businesses.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-10">No hay negocios registrados.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Negocio</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">URL</th>
              <th className="px-4 py-3 text-zinc-400 font-medium">Activo</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => (
              <tr key={biz.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{biz.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{biz.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{biz.business_types?.name ?? '—'}</Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <a href={`https://${biz.slug}.glowsim.app`} target="_blank" rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs">
                    {biz.slug}.glowsim.app <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={biz.is_active} onCheckedChange={() => handleToggle(biz.id, biz.is_active)} disabled={isPending} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Crear `components/superadmin/CreateBusinessForm.tsx`**

```typescript
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBusiness } from '@/app/actions/superadmin'
import { useToast } from '@/hooks/use-toast'

interface BusinessType { id: string; name: string }

export function CreateBusinessForm({ businessTypes }: { businessTypes: BusinessType[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createBusiness(formData)
        toast({ title: 'Negocio creado y admin invitado por email' })
        router.push('/superadmin/dashboard/negocios')
      } catch (err: any) {
        toast({ title: err.message ?? 'Error al crear negocio', variant: 'destructive' })
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
```

- [ ] **Step 6: Crear páginas del super admin dashboard**

`app/(superadmin)/dashboard/page.tsx`:

```typescript
import { getBusinesses } from '@/app/actions/superadmin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SuperAdminDashboardPage() {
  const businesses = await getBusinesses()
  const activeCount = businesses.filter((b) => b.is_active).length

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 text-sm">{activeCount} de {businesses.length} negocios activos</p>
        </div>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button className="gap-2"><Plus className="w-4 h-4" />Nuevo negocio</Button>
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total negocios', value: businesses.length },
          { label: 'Activos', value: activeCount },
          { label: 'Inactivos', value: businesses.length - activeCount },
        ].map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

`app/(superadmin)/dashboard/negocios/page.tsx`:

```typescript
import { getBusinesses } from '@/app/actions/superadmin'
import { BusinessTable } from '@/components/superadmin/BusinessTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function NegociosPage() {
  const businesses = await getBusinesses()
  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Negocios</h1>
        <Link href="/superadmin/dashboard/negocios/nuevo">
          <Button className="gap-2"><Plus className="w-4 h-4" />Nuevo</Button>
        </Link>
      </div>
      <BusinessTable businesses={businesses as any} />
    </div>
  )
}
```

`app/(superadmin)/dashboard/negocios/nuevo/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { CreateBusinessForm } from '@/components/superadmin/CreateBusinessForm'
import Link from 'next/link'

export default async function NuevoNegocioPage() {
  const supabase = createClient()
  const { data: businessTypes } = await supabase.from('business_types').select('id, name').order('name')
  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/superadmin/dashboard/negocios" className="text-zinc-400 hover:text-white">←</Link>
        <div>
          <h1 className="text-xl font-bold text-white">Nuevo negocio</h1>
          <p className="text-zinc-400 text-sm">Crea un negocio e invita al admin</p>
        </div>
      </div>
      <CreateBusinessForm businessTypes={businessTypes ?? []} />
    </div>
  )
}
```

`app/(superadmin)/dashboard/analytics/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { getBusinesses } from '@/app/actions/superadmin'

export default async function SuperAdminAnalyticsPage() {
  const supabase = createClient()
  const businesses = await getBusinesses()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: events } = await supabase
    .from('sessions_log')
    .select('business_id')
    .eq('event_type', 'simulation_complete')
    .gte('created_at', startOfMonth.toISOString())

  const countByBusiness: Record<string, number> = {}
  events?.forEach(({ business_id }) => {
    countByBusiness[business_id] = (countByBusiness[business_id] ?? 0) + 1
  })

  const ranked = businesses
    .map((b) => ({ ...b, sims: countByBusiness[b.id] ?? 0 }))
    .sort((a, b) => b.sims - a.sims)

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics Global</h1>
        <p className="text-zinc-400 text-sm">Simulaciones completas este mes</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Negocio</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Simulaciones</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((biz) => (
              <tr key={biz.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3 text-white">{biz.name}</td>
                <td className="px-4 py-3 text-right text-purple-400 font-medium">{biz.sims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(superadmin\)/ components/superadmin/ app/actions/superadmin.ts
git commit -m "feat: super admin panel — businesses CRUD, invite admin, global analytics"
```

---

## Task 12: Integración final y verificación

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Crear `app/not-found.tsx`**

```typescript
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
```

- [ ] **Step 2: Correr todos los tests**

```bash
npx vitest run
```

Expected: PASS — todos pasan. Si hay errores de módulo no encontrado en los tests de analyze/analytics, es porque Vitest resetea los módulos entre tests. Agregar `vi.resetModules()` en los `beforeEach` si falla.

- [ ] **Step 3: Build de producción**

```bash
npm run build
```

Expected: Build exitoso. Si hay errores de TypeScript, corregirlos antes de continuar. El error más común es `business_types as any` — es esperado dado que no generamos tipos de Supabase en este plan.

- [ ] **Step 4: Configuración post-build en Supabase**

Crear el usuario superadmin en Supabase Auth:
- Dashboard → Authentication → Users → Add user
- Email: el valor de `SUPERADMIN_EMAIL` en `.env.local`
- Contraseña segura

- [ ] **Step 5: Configuración en Vercel**

1. Conectar el repositorio en Vercel
2. Agregar todas las variables de entorno de `.env.local`
3. Agregar wildcard domain: `*.glowsim.app` apuntando al deployment
4. El dominio raíz `glowsim.app` también en Vercel

- [ ] **Step 6: Prueba end-to-end**

1. Ir a `/superadmin/login` → ingresar con las credenciales del superadmin
2. Crear un negocio de prueba (tipo: Clínica Estética, slug: `demo`)
3. El admin recibe email de invitación → acepta y crea contraseña
4. Abrir `demo.glowsim.app` → verificar que carga la landing page
5. Click en "Iniciar simulación" → subir foto → verificar análisis Gemini
6. Verificar overlay SVG con zonas iluminadas
7. Verificar CTA de WhatsApp
8. Ir al admin dashboard → verificar que aparecen las métricas

- [ ] **Step 7: Commit final**

```bash
git add app/not-found.tsx
git commit -m "feat: complete GlowSim MVP — multi-tenant simulator with AI, admin panel, super admin"
```

---

## Checklist pre-demo con cliente

- [ ] Superadmin creado en Supabase Auth
- [ ] `app.superadmin_email` configurado en Supabase DB
- [ ] Variables de entorno en Vercel
- [ ] Wildcard domain `*.glowsim.app` en Vercel
- [ ] Al menos 1 negocio de demo creado con procedimientos
- [ ] Foto de prueba analizada exitosamente end-to-end
- [ ] Métricas visibles en admin dashboard
