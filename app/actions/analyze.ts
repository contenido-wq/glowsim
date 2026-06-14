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

  const supabase = await createClient()

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
