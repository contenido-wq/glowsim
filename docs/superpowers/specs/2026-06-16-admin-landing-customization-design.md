# Admin — Personalización de Landing + Preview Live

**Fecha:** 2026-06-16  
**Estado:** Aprobado

---

## Contexto

GlowSim ya tiene: landing pública (`/`), simulador (`/simular`), admin dashboard con configuración básica y gestión de procedimientos. El campo `logo_url` existe en la tabla `businesses` pero no hay forma de subir un logo desde el admin. Tampoco hay preview de cómo se ve la landing.

## Objetivo

Permitir al admin de una clínica:
1. Subir su logo directamente desde el panel de configuración
2. Ver en tiempo real cómo quedará su landing mientras edita
3. Acceder con un clic a su landing pública y al simulador

---

## Alcance

### 1. Supabase Storage — bucket `logos`

- Bucket público (las imágenes se sirven sin auth en la landing pública)
- Políticas RLS:
  - `SELECT`: público (anon + authenticated)
  - `INSERT` / `UPDATE` / `DELETE`: solo `authenticated`, restringido al path `{business_id}/*`
- Migración: `004_storage.sql`

### 2. Componente `LogoUploader`

**Ubicación:** `components/admin/LogoUploader.tsx`

- Muestra logo actual o avatar placeholder con inicial del negocio
- Botón "Cambiar logo" abre file input (solo imágenes, max 2MB)
- Flujo: selección → validación → upload a `logos/{business_id}/logo.{ext}` → actualiza `logo_url` en DB via server action `updateBusinessLogo`
- Estado: idle / uploading (spinner) / error (mensaje inline)
- No requiere guardar el formulario principal — es acción inmediata

### 3. Ruta `/admin/preview`

**Archivo:** `app/admin/preview/page.tsx`

- Protegida: requiere sesión admin activa
- Lee `businessId` del admin autenticado (via `getAdminBusinessId()`)
- Acepta query params opcionales para override en tiempo real:
  - `name`, `tagline`, `primaryColor`, `logoUrl`, `city`
- Si param presente → usa el valor del param; si no → usa el valor de DB
- Renderiza `BusinessHero` + `ProcedureCards` idénticos a la landing pública
- Sin navegación admin (layout limpio para iframe)
- Cabecera mínima: "Vista previa" + badge "Solo tú puedes ver esto"

### 4. Página Configuración — layout dividido

**Archivo:** `app/admin/(protected)/dashboard/configuracion/page.tsx` + `ConfigForm.tsx`

Layout en pantallas `lg+`:
```
┌─────────────────────┬──────────────────────┐
│ Formulario (40%)    │ Preview live (60%)    │
│                     │                       │
│ [LogoUploader]      │ <iframe src=          │
│ Nombre              │   /admin/preview?...> │
│ Tagline             │                       │
│ WhatsApp            │ [Ver landing ↗]       │
│ Colores             │ [Probar simulador ↗]  │
│ Ciudad/País         │                       │
│ Dominio             │                       │
│                     │                       │
│ [Guardar]           │                       │
└─────────────────────┴──────────────────────┘
```

En móvil: columna única, preview colapsable (acordeón "Ver preview").

El iframe actualiza su `src` con debounce de 600ms al cambiar cualquier campo del form.

### 5. Botones de acceso rápido

Dentro del panel del preview (no en sidebar):
- **"Ver mi landing ↗"** → abre `https://{slug}.glowsim.co` o `custom_domain` en nueva pestaña
- **"Probar simulador ↗"** → abre la URL pública + `/simular` en nueva pestaña

---

## Nuevos archivos

| Archivo | Descripción |
|---|---|
| `supabase/migrations/004_storage.sql` | Bucket + políticas |
| `components/admin/LogoUploader.tsx` | Upload de logo |
| `app/admin/preview/page.tsx` | Página de preview para iframe |
| `app/actions/admin.ts` (update) | Agregar `updateBusinessLogo` |
| `components/admin/ConfigForm.tsx` (update) | Agregar LogoUploader + iframe preview |
| `app/admin/(protected)/dashboard/configuracion/page.tsx` (update) | Layout dividido |

---

## Consideraciones de seguridad

- `/admin/preview` debe verificar sesión — si no hay sesión, redirect a `/admin/login`
- El path de storage debe incluir `business_id` para evitar que un admin pise archivos de otro
- No exponer `service_role` key en el cliente; el upload usa la anon key con RLS

---

## Fuera del alcance (esta iteración)

- Múltiples imágenes / galería
- Crop/resize de logo antes de subir
- Preview en móvil vs desktop (toggle)
