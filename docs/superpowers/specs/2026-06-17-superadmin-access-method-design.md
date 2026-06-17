# Superadmin — Selección de Método de Acceso al Crear Negocio

**Fecha:** 2026-06-17
**Estado:** Aprobado

---

## Contexto

Al crear un negocio desde el superadmin, el flujo actual usa `inviteUserByEmail` de Supabase Auth, que envía un email con un link para que el admin cree su contraseña. El problema: el email no siempre llega (filtros de spam, configuración SMTP del proyecto Supabase). Esto deja al admin sin forma de acceder.

## Objetivo

Permitir al superadmin elegir entre dos métodos al crear un negocio:
1. **Email** — flujo actual: envía invitación con link para crear contraseña
2. **Contraseña directa** — crea el usuario con email + contraseña confirmado de inmediato, sin email

---

## Alcance

### 1. UI — `CreateBusinessForm.tsx`

Agrega un grupo de radio buttons con label "Método de acceso" justo antes del campo "Email del admin":

```
● Enviar invitación por email
○ Crear con contraseña directa
```

- Estado manejado con `useState<'email' | 'password'>`, default `'email'`
- Con `'email'` seleccionado: muestra solo campo email (comportamiento actual), hint "Recibirá un correo para crear su contraseña"
- Con `'password'` seleccionado: muestra campo email + campo contraseña (mín. 8 caracteres, con botón ojo para mostrar/ocultar), hint "El admin podrá ingresar de inmediato"
- El campo `access_method` se incluye como `<input type="hidden">` en el form para que llegue al server action
- Validación HTML5: `required` + `minLength={8}` en el campo contraseña cuando es visible

### 2. Server action — `app/actions/superadmin.ts` → `createBusiness`

Lee `access_method` del `formData`:

**Si `access_method === 'email'`:**
```ts
await serviceClient.auth.admin.inviteUserByEmail(adminEmail, {
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
  data: { full_name: adminName },
})
```
(comportamiento actual — sin cambios)

**Si `access_method === 'password'`:**
```ts
await serviceClient.auth.admin.createUser({
  email: adminEmail,
  password: adminPassword,
  email_confirm: true,
  user_metadata: { full_name: adminName },
})
```
`email_confirm: true` marca el email como verificado de inmediato — el admin puede loguearse sin pasar por ningún correo.

En ambos casos: crear negocio en `businesses` → vincular en `business_users` (flujo existente sin cambios).

---

## Archivos Modificados

| Archivo | Cambio |
|---|---|
| `components/superadmin/CreateBusinessForm.tsx` | Agregar radio buttons + campo contraseña condicional |
| `app/actions/superadmin.ts` → `createBusiness` | Leer `access_method` y `admin_password`, bifurcar lógica |

---

## Constraints

- No nuevos paquetes npm
- El campo contraseña nunca se loggea ni se almacena — solo se pasa al admin API de Supabase
- Mantener el flujo de email exactamente igual para no romper casos que sí funcionan
- UI en español neutro latinoamericano, light theme Ocean blue
