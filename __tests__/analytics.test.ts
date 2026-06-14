import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}))

describe('logEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserta evento en sessions_log', async () => {
    const { logEvent } = await import('@/app/actions/analytics')
    await logEvent({
      business_id: 'biz-123',
      session_id: 'session-abc',
      event_type: 'visit',
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        business_id: 'biz-123',
        session_id: 'session-abc',
        event_type: 'visit',
      })
    )
  })

  it('no lanza error aunque falle el insert (analytics no bloquea UX)', async () => {
    mockInsert.mockResolvedValueOnce({ error: new Error('DB error') })
    const { logEvent } = await import('@/app/actions/analytics')
    await expect(
      logEvent({ business_id: 'biz', session_id: 'sid', event_type: 'visit' })
    ).resolves.toBeUndefined()
  })
})
