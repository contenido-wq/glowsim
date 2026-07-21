'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function getAdminBusinessId(): Promise<string> {
  // TEMP: auth check disabled for local access, re-enable before deploying
  const supabase = createServiceClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single()
  if (!business) throw new Error('No hay negocios activos')
  return business.id
}

const UPLOAD_TARGETS = {
  logo: { bucket: 'logos', column: 'logo_url' },
  banner: { bucket: 'banners', column: 'banner_url' },
  'simulator-banner': { bucket: 'banners', column: 'simulator_banner_url' },
} as const

export type UploadTarget = keyof typeof UPLOAD_TARGETS

export async function uploadBusinessImage(target: UploadTarget, file: File): Promise<string> {
  const { bucket, column } = UPLOAD_TARGETS[target]
  const supabase = createServiceClient()
  const businessId = await getAdminBusinessId()

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${businessId}/${target}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ [column]: publicUrl })
    .eq('id', businessId)
  if (updateError) throw new Error(updateError.message)

  revalidatePath('/admin/dashboard/configuracion')
  return publicUrl
}

export async function updateBusinessConfig(formData: FormData) {
  const supabase = createServiceClient()
  const businessId = await getAdminBusinessId()

  const { error } = await supabase.from('businesses').update({
    name: formData.get('name') as string,
    tagline: (formData.get('tagline') as string) || null,
    whatsapp_number: formData.get('whatsapp_number') as string,
    whatsapp_message: (formData.get('whatsapp_message') as string) || null,
    instagram_url: (formData.get('instagram_url') as string) || null,
    tiktok_url: (formData.get('tiktok_url') as string) || null,
    facebook_url: (formData.get('facebook_url') as string) || null,
    website_url: (formData.get('website_url') as string) || null,
    maps_url: (formData.get('maps_url') as string) || null,
    simulator_headline_1: (formData.get('simulator_headline_1') as string) || null,
    simulator_headline_2: (formData.get('simulator_headline_2') as string) || null,
    simulator_results_title: (formData.get('simulator_results_title') as string) || null,
    simulator_results_description: (formData.get('simulator_results_description') as string) || null,
    simulator_badge_1: (formData.get('simulator_badge_1') as string) || null,
    simulator_badge_2: (formData.get('simulator_badge_2') as string) || null,
    simulator_badge_3: (formData.get('simulator_badge_3') as string) || null,
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
  const supabase = createServiceClient()
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
  const supabase = createServiceClient()
  const businessId = await getAdminBusinessId()
  await supabase
    .from('procedures')
    .update({ is_active: isActive })
    .eq('id', procedureId)
    .eq('business_id', businessId)
  revalidatePath('/admin/dashboard/procedimientos')
}

export async function deleteProcedure(procedureId: string) {
  const supabase = createServiceClient()
  const businessId = await getAdminBusinessId()
  await supabase
    .from('procedures')
    .delete()
    .eq('id', procedureId)
    .eq('business_id', businessId)
  revalidatePath('/admin/dashboard/procedimientos')
}

export async function removeBusinessLogo(logoPath?: string) {
  const supabase = createServiceClient()
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

export async function removeBusinessBanner(bannerPath?: string) {
  const supabase = createServiceClient()
  const businessId = await getAdminBusinessId()

  if (bannerPath) {
    const url = new URL(bannerPath)
    const pathInBucket = url.pathname.replace(/^\/storage\/v1\/object\/public\/banners\//, '')
    if (pathInBucket) {
      await supabase.storage.from('banners').remove([pathInBucket])
    }
  }

  const { error } = await supabase
    .from('businesses')
    .update({ banner_url: null })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/configuracion')
}

export async function removeSimulatorBanner(bannerPath?: string) {
  const supabase = createServiceClient()
  const businessId = await getAdminBusinessId()

  if (bannerPath) {
    const url = new URL(bannerPath)
    const pathInBucket = url.pathname.replace(/^\/storage\/v1\/object\/public\/banners\//, '')
    if (pathInBucket) {
      await supabase.storage.from('banners').remove([pathInBucket])
    }
  }

  const { error } = await supabase
    .from('businesses')
    .update({ simulator_banner_url: null })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/dashboard/configuracion')
}
