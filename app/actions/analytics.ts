'use server'

import { createClient } from '@/lib/supabase/server'
import type { SessionsLogInsert } from '@/types'

export async function logEvent(event: SessionsLogInsert): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('sessions_log').insert(event)
  } catch {
    // Analytics no debe bloquear la UX del usuario
  }
}
