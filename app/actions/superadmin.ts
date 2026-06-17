'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

async function assertSuperAdmin() {
  const supabase = await createClient()
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
  const adminName = formData.get('admin_name') as string
  const businessTypeId = formData.get('business_type_id') as string
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string).toLowerCase().replace(/\s+/g, '-')
  const whatsappNumber = formData.get('whatsapp_number') as string
  const accessMethod = (formData.get('access_method') as string) || 'email'
  const adminPassword = formData.get('admin_password') as string | null

  const serviceClient = createServiceClient()

  const { data: business, error: bizError } = await serviceClient
    .from('businesses')
    .insert({ business_type_id: businessTypeId, name, slug, whatsapp_number: whatsappNumber })
    .select('id')
    .single()

  if (bizError || !business) throw new Error(bizError?.message ?? 'Error al crear negocio')

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

  await serviceClient.from('business_users').insert({
    user_id: authUserId,
    business_id: business.id,
    role: 'admin',
  })

  revalidatePath('/superadmin/dashboard/negocios')
  return business.id
}
