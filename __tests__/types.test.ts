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
