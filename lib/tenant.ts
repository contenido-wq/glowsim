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
