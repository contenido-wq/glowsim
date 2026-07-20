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
  banner_url?: string | null
  primary_color: string
  secondary_color: string
  tagline?: string | null
  whatsapp_number: string
  whatsapp_message?: string | null
  instagram_url?: string | null
  tiktok_url?: string | null
  facebook_url?: string | null
  website_url?: string | null
  maps_url?: string | null
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
