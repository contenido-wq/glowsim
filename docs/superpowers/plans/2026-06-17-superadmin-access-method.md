# Superadmin Access Method Selection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the superadmin to choose between "Email invitation" or "Direct email + password" when creating a new business admin user.

**Architecture:** Two tasks in dependency order — UI first (adds the radio toggle + password field to the form), then server action (reads the new `access_method` field and bifurcates between `inviteUserByEmail` and `createUser`). Task 2 depends on Task 1 sending the new fields.

**Tech Stack:** Next.js 16 App Router, React 18 (`useState`), Supabase Auth Admin API (`@supabase/supabase-js` service client), TypeScript.

## Global Constraints

- UI language: español neutro latinoamericano
- Light theme: `#0D1E2C` text, `#6B8194` muted, `#D4E4EE` border, `#F0F5F8` page bg, `#FFFFFF` card bg, `#1B72D9` primary blue
- No new npm packages
- Never log or persist the password — it goes directly to the Supabase Admin API and nowhere else
- All server components must `await createClient()`
- `inputStyle` constant already defined in `CreateBusinessForm.tsx` — reuse it exactly

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/superadmin/CreateBusinessForm.tsx` | Modify | Add `accessMethod` state, radio buttons, conditional password field, update toast message |
| `app/actions/superadmin.ts` → `createBusiness` | Modify | Read `access_method` + `admin_password`, bifurcate between invite and createUser |

---

## Task 1: CreateBusinessForm — Radio Toggle + Password Field

**Files:**
- Modify: `components/superadmin/CreateBusinessForm.tsx`

**Interfaces:**
- Produces: `formData` now includes `access_method: 'email' | 'password'` and optionally `admin_password: string`

- [ ] **Step 1: Add `useState` import and `accessMethod` state**

In `components/superadmin/CreateBusinessForm.tsx`, add `useState` to the React import and add state inside the component:

```tsx
import { useState, useTransition } from 'react'
```

Inside `CreateBusinessForm`, after the existing `useTransition` and `useRouter` calls:

```tsx
const [accessMethod, setAccessMethod] = useState<'email' | 'password'>('email')
const [showPassword, setShowPassword] = useState(false)
```

- [ ] **Step 2: Update the toast message to be method-aware**

Replace the static toast string in `handleSubmit`:

```tsx
// Before:
toast('Negocio creado y admin invitado por email')

// After:
toast(accessMethod === 'email' ? 'Negocio creado — invitación enviada por email' : 'Negocio creado — el admin ya puede ingresar')
```

- [ ] **Step 3: Add the radio buttons section before the email field**

Insert the following JSX block immediately before the `<Field label="Email del admin" ...>` block:

```tsx
{/* Método de acceso */}
<div className="space-y-3">
  <span className="block text-[10px] uppercase tracking-widest font-medium" style={{ color: '#9AAAB8' }}>
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
        <span className="text-sm" style={{ color: '#0D1E2C' }}>{label}</span>
      </label>
    ))}
  </div>
</div>
```

- [ ] **Step 4: Update the email field hint to reflect the selected method**

Replace the static `hint` prop on the email field:

```tsx
// Before:
<Field label="Email del admin" hint="Recibirá un correo para crear su contraseña">

// After:
<Field
  label="Email del admin"
  hint={accessMethod === 'email' ? 'Recibirá un correo para crear su contraseña' : 'El admin usará este email para ingresar'}
>
```

- [ ] **Step 5: Add the conditional password field after the email field**

Insert this block immediately after the closing `</Field>` of the email field:

```tsx
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
        onFocus={e => (e.target.style.borderColor = '#1B72D9')}
        onBlur={e => (e.target.style.borderColor = '#D4E4EE')}
      />
      <button
        type="button"
        onClick={() => setShowPassword(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: '#9AAAB8', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
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
```

- [ ] **Step 6: Update the submit button label**

Replace the static submit label:

```tsx
// Before:
{isPending ? 'Creando negocio...' : 'Crear negocio y enviar invitación'}

// After:
{isPending ? 'Creando negocio...' : accessMethod === 'email' ? 'Crear negocio y enviar invitación' : 'Crear negocio'}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Manual test — visual check**

With dev server running (`http://localhost:3000/superadmin/dashboard/negocios/nuevo`):
1. The form shows "Método de acceso" with two radio options — "Email" selected by default
2. Selecting "Crear con contraseña directa" reveals the password field with eye toggle
3. Switching back to "Email" hides the password field
4. Submit button says "Crear negocio y enviar invitación" with email, "Crear negocio" with password

- [ ] **Step 9: Commit**

```bash
git add components/superadmin/CreateBusinessForm.tsx
git commit -m "feat: add access method selector to CreateBusinessForm (email vs password)"
```

---

## Task 2: createBusiness — Bifurcate Email vs Password Flow

**Files:**
- Modify: `app/actions/superadmin.ts`

**Interfaces:**
- Consumes: `formData.get('access_method')` → `'email' | 'password'`, `formData.get('admin_password')` → `string | null`
- Existing interface unchanged: still returns `business.id`, still throws on error, still calls `revalidatePath`

- [ ] **Step 1: Read the new fields from formData**

In `createBusiness`, after the existing `const whatsappNumber = ...` line, add:

```tsx
const accessMethod = (formData.get('access_method') as string) || 'email'
const adminPassword = formData.get('admin_password') as string | null
```

- [ ] **Step 2: Replace the invite block with bifurcated logic**

Replace the entire `inviteUserByEmail` block (from `const { data: inviteData...` through `throw new Error(inviteError?.message ...`) with:

```tsx
let authUserId: string

if (accessMethod === 'password') {
  if (!adminPassword || adminPassword.length < 8) {
    await serviceClient.from('businesses').delete().eq('id', business.id)
    throw new Error('La contraseña debe tener al menos 8 caracteres')
  }
  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  })
  if (createError || !created.user) {
    await serviceClient.from('businesses').delete().eq('id', business.id)
    throw new Error(createError?.message ?? 'Error al crear usuario')
  }
  authUserId = created.user.id
} else {
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(adminEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
    data: { full_name: adminName },
  })
  if (inviteError || !inviteData.user) {
    await serviceClient.from('businesses').delete().eq('id', business.id)
    throw new Error(inviteError?.message ?? 'Error al invitar admin')
  }
  authUserId = inviteData.user.id
}
```

- [ ] **Step 3: Update the business_users insert to use `authUserId`**

Replace `user_id: inviteData.user.id` with `user_id: authUserId`:

```tsx
await serviceClient.from('business_users').insert({
  user_id: authUserId,
  business_id: business.id,
  role: 'admin',
})
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual test — password flow**

With dev server running, go to `/superadmin/dashboard/negocios/nuevo`:
1. Fill all fields, select "Crear con contraseña directa", enter a password ≥ 8 chars
2. Submit — toast shows "Negocio creado — el admin ya puede ingresar"
3. Go to `/admin/login`, enter the email and password just set
4. Expected: redirect to `/admin/dashboard`

- [ ] **Step 6: Manual test — email flow unchanged**

1. Select "Enviar invitación por email", fill email only
2. Submit — toast shows "Negocio creado — invitación enviada por email"
3. Expected: no errors, business appears in the list

- [ ] **Step 7: Commit**

```bash
git add app/actions/superadmin.ts
git commit -m "feat: bifurcate createBusiness between email invite and direct password creation"
```
