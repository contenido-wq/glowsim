import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/gemini', () => ({
  analyzeWithGemini: vi.fn().mockResolvedValue({
    zones: [
      {
        svg_id: 'labios',
        zone_name: 'Labios',
        procedures: ['Relleno de labios'],
        description: 'Se observa asimetría leve.',
        confidence: 'high',
      },
    ],
    summary: 'En general, el rostro muestra buen estado.',
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'businesses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'biz-123', business_types: { face_map_type: 'face' } },
            error: null,
          }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'p1', name: 'Relleno de labios', zone: { svg_id: 'labios' } }],
          error: null,
        }),
      }
    }),
  })),
}))

describe('analyzeImage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna AnalysisResult con zonas', async () => {
    const { analyzeImage } = await import('@/app/actions/analyze')
    const result = await analyzeImage('/9j/fakejpeg', 'biz-123')
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].svg_id).toBe('labios')
    expect(result.summary).toBeTruthy()
  })

  it('lanza error si base64 está vacío', async () => {
    const { analyzeImage } = await import('@/app/actions/analyze')
    await expect(analyzeImage('', 'biz-123')).rejects.toThrow('La imagen es requerida')
  })

  it('lanza error si businessId está vacío', async () => {
    const { analyzeImage } = await import('@/app/actions/analyze')
    await expect(analyzeImage('/9j/fake', '')).rejects.toThrow('El negocio es requerido')
  })
})
