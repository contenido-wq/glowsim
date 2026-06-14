# GlowSim — Spec de Diseño
**Fecha:** 2026-06-14  
**Versión:** 1.0  
**Creador:** Jhei Trujillo (@elsolucionador)

---

## 1. Visión del Producto

GlowSim es una plataforma de simulación visual con IA para negocios de transformación estética: clínicas estéticas, barberías, spas de uñas, micropigmentación y cualquier negocio que muestre transformaciones visuales a sus clientes.

**Modelo de negocio:** Venta directa a precio fijo por implementación. Sin suscripciones ni billing en la app.

**Propuesta de valor:**
- Cada negocio tiene su propia landing page pública con simulador de IA
- Los clientes suben una foto, ven las zonas recomendadas con un overlay SVG interactivo y agendan por WhatsApp
- El dueño del negocio administra su branding, procedimientos y analíticas desde un panel propio

---

## 2. Stack Técnico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 13 (App Router) |
| UI | TailwindCSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| IA | Google Gemini 2.0 Flash |
| Deploy | Vercel |
| Dominios | Vercel Domains API |

---

## 3. Arquitectura General

### Enfoque: Monolítico Next.js con middleware de routing

Una sola aplicación Next.js 13 que sirve tres zonas con grupos de rutas independientes:

```
app/
├── (public)/                  ← Landing + simulador por negocio
│   ├── page.tsx               ← Home del negocio
│   └── simular/
│       └── page.tsx           ← Simulador con FaceMap + Gemini
│
├── (admin)/                   ← Panel del dueño del negocio
│   ├── login/
│   │   └── page.tsx
│   └── dashboard/
│       ├── page.tsx           ← Overview + métricas
│       ├── configuracion/
│       │   └── page.tsx       ← Info, branding, WhatsApp, dominio
│       ├── procedimientos/
│       │   └── page.tsx       ← CRUD de procedimientos
│       └── analytics/
│           └── page.tsx       ← Gráficos y tabla de UTMs
│
└── (superadmin)/              ← Panel de gestión global
    ├── login/
    │   └── page.tsx
    └── dashboard/
        ├── page.tsx           ← Lista de todos los negocios
        ├── negocios/
        │   ├── page.tsx       ← CRUD de negocios
        │   └── [id]/
        │       └── page.tsx   ← Detalle de un negocio
        └── analytics/
            └── page.tsx       ← Analytics globales
```

### Middleware de Routing (`middleware.ts`)

El middleware intercepta cada request y resuelve el tenant activo:

```
Request entra
   ↓
¿Host es *.glowsim.app?
   → Extrae slug del subdominio
   → Busca business en DB por slug
¿Host es dominio personalizado?
   → Busca business en DB por custom_domain
   ↓
Inyecta business_id en headers X-Business-ID
   ↓
Reescribe la URL internamente manteniendo el host original
```

Los Server Components leen `X-Business-ID` de los headers para cargar los datos del negocio sin calls adicionales.

### Dominios Personalizados

- Subdominio por defecto: `{slug}.glowsim.app` — configurado en Vercel como wildcard domain
- Dominio propio opcional: el admin ingresa su dominio, la plataforma provee los DNS a apuntar
- Certificados SSL: Vercel los gestiona automáticamente via Let's Encrypt

---

## 4. Base de Datos

### Tabla: `business_types`
Templates de categoría — seed data, no editable por usuarios.

```sql
id            uuid PRIMARY KEY
name          text NOT NULL          -- 'Clínica Estética', 'Barbería', 'Spa de Uñas', 'Micropigmentación'
slug          text UNIQUE NOT NULL   -- 'clinica', 'barberia', 'spa_unas', 'micropigmentacion'
face_map_type text NOT NULL          -- 'face', 'hair', 'hands', 'brows'
created_at    timestamptz DEFAULT now()
```

### Tabla: `businesses`
El tenant central — un registro por negocio registrado.

```sql
id                uuid PRIMARY KEY
business_type_id  uuid REFERENCES business_types
name              text NOT NULL
slug              text UNIQUE NOT NULL        -- jessica → jessica.glowsim.app
custom_domain     text UNIQUE                -- simulador.jessicaclinica.com (opcional)

-- Branding
logo_url          text
primary_color     text DEFAULT '#6366f1'     -- hex
secondary_color   text DEFAULT '#a855f7'     -- hex
tagline           text

-- Contacto
whatsapp_number   text NOT NULL              -- +573001234567
whatsapp_message  text                       -- mensaje predefinido

-- Info
city              text
country           text

-- Estado
is_active         boolean DEFAULT true
created_at        timestamptz DEFAULT now()
updated_at        timestamptz DEFAULT now()
```

### Tabla: `business_users`
Usuarios admin vinculados a un negocio.

```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES auth.users NOT NULL
business_id  uuid REFERENCES businesses NOT NULL
role         text DEFAULT 'admin'
created_at   timestamptz DEFAULT now()

UNIQUE(user_id, business_id)
```

### Tabla: `procedure_zones`
Zonas del FaceMap disponibles por tipo de negocio.

```sql
id                uuid PRIMARY KEY
business_type_id  uuid REFERENCES business_types NOT NULL
name              text NOT NULL    -- 'Frente', 'Labios', 'Mejillas', 'Barba', 'Uñas'
svg_id            text NOT NULL    -- ID del elemento SVG a resaltar
created_at        timestamptz DEFAULT now()
```

Ejemplos de seed:
- `face`: frente, ojos, nariz, labios, mejillas, menton, cuello
- `hair`: parte_superior, lados, nuca, barba, patillas
- `hands`: unas, cuticulas, dorso
- `brows`: cejas, labios_superior, labios_inferior

### Tabla: `procedures`
Procedimientos configurados por cada negocio.

```sql
id          uuid PRIMARY KEY
business_id uuid REFERENCES businesses NOT NULL
zone_id     uuid REFERENCES procedure_zones   -- nullable para zonas custom
name        text NOT NULL         -- 'Relleno de labios', 'Corte Fade', 'Manicure gel'
description text
is_active   boolean DEFAULT true
sort_order  integer DEFAULT 0
created_at  timestamptz DEFAULT now()
```

### Tabla: `sessions_log`
Eventos anónimos para analytics — nunca guarda datos personales del visitante.

```sql
id           uuid PRIMARY KEY
business_id  uuid REFERENCES businesses NOT NULL
session_id   text NOT NULL        -- UUID anónimo generado en el browser (localStorage)
event_type   text NOT NULL        -- 'visit' | 'simulation_start' | 'simulation_complete' | 'whatsapp_click'

-- UTM tracking
utm_source   text
utm_medium   text
utm_campaign text
utm_term     text
utm_content  text

-- Metadata adicional
metadata     jsonb                -- { zones_analyzed: ['labios'], procedures_count: 3 }
created_at   timestamptz DEFAULT now()
```

### Políticas RLS

- `businesses`: admin solo lee/escribe su propio negocio (`business_id = auth.uid()` via `business_users`)
- `procedures`: admin solo accede a procedimientos de su negocio
- `sessions_log`: INSERT público anónimo, SELECT solo para admin de ese negocio y superadmin
- `business_types` / `procedure_zones`: lectura pública, escritura solo superadmin
- Superadmin: usuario con email fijo definido en variable de entorno `SUPERADMIN_EMAIL` — la política RLS verifica `auth.jwt() ->> 'email' = SUPERADMIN_EMAIL`

---

## 5. Flujo de Simulación

### Paso 1 — Subida de foto (cliente)
- El visitante sube una foto desde su galería o toma una con la cámara
- **Mobile-first:** el input de cámara usa `capture="user"` para selfie directo
- La imagen se redimensiona en el cliente a máximo 1024px (Canvas API) antes de enviar
- Se convierte a base64 — no se guarda en Storage (privacidad)
- Se registra evento `simulation_start` en `sessions_log`

### Paso 2 — Server Action `analyzeImage()`

```typescript
// app/actions/analyze.ts
async function analyzeImage(base64: string, businessId: string): Promise<AnalysisResult>
```

Flujo interno:
1. Carga procedimientos activos del negocio desde Supabase
2. Construye prompt adaptado al `business_type`:
   - Clínica: análisis facial estético
   - Barbería: análisis de tipo de cabello y estructura del rostro
   - Uñas: análisis de manos y forma de uñas
3. Llama `gemini-2.0-flash` con la imagen y el prompt
4. Usa `response_schema` de Gemini para forzar JSON validado
5. Retorna resultado estructurado

### Estructura de respuesta de Gemini

```typescript
interface AnalysisResult {
  zones: Array<{
    svg_id: string           // Mapea al elemento SVG
    zone_name: string        // Nombre legible
    procedures: string[]     // Procedimientos recomendados
    description: string      // Descripción de Gemini (2-3 oraciones)
    confidence: 'high' | 'medium' | 'low'
  }>
  summary: string            // Resumen general (1 párrafo)
}
```

### Paso 3 — FaceMap SVG Interactivo

- Se carga el SVG correspondiente al `face_map_type` del negocio
- Las zonas retornadas por Gemini se resaltan con `primary_color` del negocio (opacity 0.6)
- Las zonas no analizadas permanecen en gris sutil
- Al tocar/click una zona → panel inferior muestra nombre + procedimientos + descripción
- **Mobile:** panel deslizable desde abajo (bottom sheet) en lugar de panel lateral

### Paso 4 — Registro de evento

```typescript
// Al completar el análisis
await logEvent({
  business_id: businessId,
  session_id: getOrCreateSessionId(),   // localStorage
  event_type: 'simulation_complete',
  utm_source: searchParams.get('utm_source'),
  // ... resto de UTMs
  metadata: {
    zones_analyzed: result.zones.map(z => z.svg_id),
    procedures_count: result.zones.flatMap(z => z.procedures).length
  }
})
```

### Paso 5 — CTA WhatsApp

```
Botón: "Agendar mi consulta 💬"
URL: https://wa.me/{whatsapp_number}?text={whatsapp_message_encoded}

Mensaje predefinido editable por el admin:
"Hola, acabo de hacer mi simulación en {nombre_negocio} y me gustaría 
agendar una consulta gratuita 😊"
```

Al hacer click se registra `whatsapp_click` en `sessions_log`.

---

## 6. Diseño de UI/UX

### Principios de diseño
- **Mobile-first obligatorio** — la mayoría de visitantes llegan por Instagram/TikTok desde celular
- Dark mode en toda la plataforma
- Las landing pages públicas adaptan colores al branding de cada negocio
- Los paneles admin usan paleta neutral oscura (`zinc-900`, `zinc-800`)
- Tipografía: Inter (Google Fonts)
- Componentes base: shadcn/ui

### Responsive breakpoints
- `sm`: 640px — layout de 1 columna en simulador
- `md`: 768px — layout de 2 columnas (foto + SVG lado a lado)
- `lg`: 1024px — dashboard admin completo

---

### Superficie 1: Landing Page Pública (`/`)

**Mobile (1 columna, scroll vertical):**
```
┌─────────────────────────┐
│ [Logo]    [Nav mínimo]  │
├─────────────────────────┤
│                         │
│  "Descubre tu mejor     │
│   versión"              │
│  [Tagline del negocio]  │
│                         │
│  [ INICIAR SIMULACIÓN ] │  ← CTA primario, color de marca
│                         │
├─────────────────────────┤
│  Procedimientos         │
│  ┌────┐ ┌────┐ ┌────┐  │
│  │ P1 │ │ P2 │ │ P3 │  │
│  └────┘ └────┘ └────┘  │
│   scroll horizontal     │
├─────────────────────────┤
│  Sobre nosotros         │
│  [Ciudad · País]        │
└─────────────────────────┘
```

**Desktop:** Hero de 2 columnas — texto a la izquierda, imagen ilustrativa a la derecha.

---

### Superficie 2: Simulador (`/simular`)

**Mobile (flujo de pasos vertical):**

```
Paso 1 — Upload
┌─────────────────────────┐
│                         │
│   [ 📷 Tomar selfie ]   │
│   [ 🖼 Subir foto ]     │
│                         │
│  "Tu foto no se guarda" │
└─────────────────────────┘

Paso 2 — Analizando
┌─────────────────────────┐
│  [Foto del usuario]     │
│  Skeleton + spinner     │
│  "Analizando con IA..." │
└─────────────────────────┘

Paso 3 — Resultados
┌─────────────────────────┐
│  [Foto con SVG overlay] │
│  Zonas iluminadas       │
│  en color de marca      │
├─────────────────────────┤
│  ↑ Desliza para ver     │
│  tus recomendaciones    │
├─────────────────────────┤  ← Bottom sheet
│  Labios                 │
│  • Relleno de labios    │
│  • Perfilado labial     │
│  "Se observa asimetría  │
│   leve, el relleno..."  │
│                         │
│  [Agendar por WhatsApp] │
└─────────────────────────┘
```

**Desktop:** Foto + SVG a la izquierda, panel de resultados a la derecha.

---

### Superficie 3: Admin Dashboard (`/admin/dashboard`)

**Tabs de navegación:** Overview · Configuración · Procedimientos · Analytics

**Overview (mobile):**
```
┌─────────────────────────┐
│  Métricas este mes      │
│  ┌──────┐  ┌──────┐    │
│  │ 234  │  │  89  │    │
│  │Visitas│  │Simul.│    │
│  └──────┘  └──────┘    │
│  ┌──────┐              │
│  │  12  │              │
│  │WA clk│              │
│  └──────┘              │
├─────────────────────────┤
│  Link de tu página      │
│  jessica.glowsim.app ↗  │
└─────────────────────────┘
```

**Configuración:** formulario con logo upload, color pickers, tagline, número WhatsApp, dominio personalizado.

**Procedimientos:** tabla con switch activo/inactivo, zona asignada, botón añadir.

**Analytics:** gráfico de línea (simulaciones por día), tabla de UTM sources con conteo.

---

### Superficie 4: Super Admin (`/superadmin`)

- Lista de negocios: nombre, tipo, slug, fecha creación, is_active toggle
- Crear negocio: formulario con nombre, tipo de negocio, slug, email del admin → crea usuario en Supabase Auth + envía email de invitación
- Analytics global: card por negocio con simulaciones totales del mes
- Botón "Ver landing" para previsualizar cualquier negocio

---

## 7. Seguridad

- JWT de Supabase en cookies httpOnly
- RLS en todas las tablas — ningún cliente puede acceder a datos de otro negocio
- Server Actions validan `business_id` contra la sesión del usuario antes de cualquier operación
- Las fotos del simulador nunca se persisten — solo viven en memoria durante el análisis
- API keys (Gemini, Supabase service role) solo en variables de entorno del servidor
- `NEXT_PUBLIC_*` solo para claves anónimas de Supabase

---

## 8. Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       ← solo servidor, nunca al cliente

# Google Gemini
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_DOMAIN=glowsim.app
NEXT_PUBLIC_APP_URL=https://glowsim.app
```

---

## 9. Analytics

Todos los eventos son anónimos — no se captura nombre, email ni teléfono del visitante.

| Evento | Cuándo se registra |
|--------|-------------------|
| `visit` | Al cargar la landing page |
| `simulation_start` | Al subir la foto |
| `simulation_complete` | Al recibir resultado de Gemini |
| `whatsapp_click` | Al tocar el botón de WhatsApp |

UTM params capturados automáticamente de la URL en cada evento.

**Métricas disponibles en el admin:**
- Tasa de conversión: visitas → simulaciones (`simulation_complete / visit`)
- Tasa de intención: simulaciones → WhatsApp (`whatsapp_click / simulation_complete`)
- Top UTM sources del mes
- Gráfico de simulaciones por día (últimos 30 días)

---

## 10. Seed Data (Templates)

### business_types
| name | slug | face_map_type |
|------|------|---------------|
| Clínica Estética | clinica | face |
| Barbería | barberia | hair |
| Spa de Uñas | spa_unas | hands |
| Micropigmentación | micropigmentacion | brows |

### procedure_zones por tipo
**face:** frente, ojos_izq, ojos_der, nariz, labios, mejilla_izq, mejilla_der, menton, cuello  
**hair:** parte_superior, lado_izq, lado_der, nuca, barba, patillas  
**hands:** unas, cuticulas, dorso  
**brows:** ceja_izq, ceja_der, labio_superior, labio_inferior

---

## 11. Restricciones y Decisiones Técnicas

1. **Sin imagen generada:** Gemini solo analiza y recomienda — el SVG es un overlay, no una transformación real de la imagen. Más rápido, más confiable, sin costos de generación.
2. **Fotos no persistidas:** La foto del visitante solo vive en base64 durante el análisis. No se guarda en Storage.
3. **Sin billing en el MVP:** El modelo de venta es precio fijo por implementación — no hay lógica de suscripciones ni Stripe en esta versión.
4. **Mobile-first:** El simulador está diseñado primero para celular. El 80%+ del tráfico llega desde redes sociales vía móvil.
5. **SVG FaceMap:** Archivos SVG estáticos en `/public/facemaps/face.svg`, `hair.svg`, `hands.svg`, `brows.svg`. Cada zona es un elemento `<path>` o `<ellipse>` con `id` que coincide con el campo `svg_id` de `procedure_zones`. Se resaltan vía clase CSS dinámica.
6. **Temperatura Gemini:** 0.1 para outputs consistentes y reproducibles.
6. **Gemini 2.0 Flash:** Elegido sobre GPT-4o y Claude por velocidad + costo. 20x más barato que GPT-4o con calidad suficiente para análisis estético.

---

## 12. Fuera de Scope (MVP)

- Sistema de pagos / suscripciones
- App nativa iOS/Android
- Generación de imágenes transformadas (inpainting)
- Chat con el negocio dentro de la plataforma
- Multilenguaje (solo español latinoamericano)
- Notificaciones push
