'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminBusinessId(): Promise<string> {
  const supabase = await createClient()
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
  const supabase = await createClient()
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
  const supabase = await createClient()
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
  const supabase = await createClient()
  const businessId = await getAdminBusinessId()
  await supabase
    .from('procedures')
    .update({ is_active: isActive })
    .eq('id', procedureId)
    .eq('business_id', businessId)
  revalidatePath('/admin/dashboard/procedimientos')
}

export async function deleteProcedure(procedureId: string) {
  const supabase = await createClient()
  const businessId = await getAdminBusinessId()
  await supabase
    .from('procedures')
    .delete()
    .eq('id', procedureId)
    .eq('business_id', businessId)
  revalidatePath('/admin/dashboard/procedimientos')
}

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

export async function removeBusinessLogo(logoPath?: string) {
  const supabase = await createClient()
  const businessId = await getAdminBusinessId()

  if (logoPath) {
    // Extract just the path portion (remove domain + /storage/v1/object/public/logos/)
    const url = new URL(logoPath)
    const pathInBucket = url.pathname.replace(/^\/storage\/v1\/object\/public\/logos\//, '')
    if (pathInBucket) {
      await supabase.storage.from('logos').remove([pathInBucket])
    }
  }

  const { error } = await supabase
    .from('businesses')
    .update({ logo_url: null })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/configuracion')
}
