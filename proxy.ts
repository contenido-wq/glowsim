import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'
import { extractTenantIdentifier } from '@/lib/tenant'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)
  const pathname = req.nextUrl.pathname

  // Refresh Supabase session on every request
  await supabase.auth.getSession()

  // Internal Next.js assets — skip all logic
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return res
  }

  // Admin routes: protect with auth, no tenant resolution
  if (pathname.startsWith('/admin')) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return res
  }

  // Super admin routes: protect with auth + verify email
  if (pathname.startsWith('/superadmin')) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session && pathname !== '/superadmin/login') {
      return NextResponse.redirect(new URL('/superadmin/login', req.url))
    }
    if (!process.env.SUPERADMIN_EMAIL || session?.user.email !== process.env.SUPERADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return res
  }

  // Public routes: resolve tenant from host
  const host = req.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'glowsim.app'
  const identifier = extractTenantIdentifier(host, appDomain)

  if (identifier.type === 'none') return res

  let businessId: string | null = null

  if (identifier.type === 'slug') {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', identifier.value)
      .eq('is_active', true)
      .single()
    businessId = data?.id ?? null
  } else {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('custom_domain', identifier.value)
      .eq('is_active', true)
      .single()
    businessId = data?.id ?? null
  }

  if (businessId) {
    res.headers.set('X-Business-ID', businessId)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
