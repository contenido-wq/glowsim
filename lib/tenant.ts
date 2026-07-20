type TenantIdentifier =
  | { type: 'slug'; value: string }
  | { type: 'custom_domain'; value: string }
  | { type: 'none' }

export function extractTenantIdentifier(
  host: string,
  appDomain: string
): TenantIdentifier {
  const cleanHost = host.split(':')[0]

  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return { type: 'none' }
  }

  if (cleanHost === appDomain) {
    return { type: 'none' }
  }

  const suffix = `.${appDomain}`
  if (cleanHost.endsWith(suffix)) {
    const slug = cleanHost.slice(0, -suffix.length)
    return { type: 'slug', value: slug }
  }

  return { type: 'custom_domain', value: cleanHost }
}

export function getPublicUrl(business: { slug: string; custom_domain?: string | null }): string {
  if (business.custom_domain) return `https://${business.custom_domain}`

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'glowsim.app'
  if (appDomain === 'localhost') {
    return `http://${business.slug}.localhost:3000`
  }
  return `https://${business.slug}.${appDomain}`
}
