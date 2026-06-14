import { describe, it, expect } from 'vitest'
import { extractTenantIdentifier } from '@/lib/tenant'

describe('extractTenantIdentifier', () => {
  const APP_DOMAIN = 'glowsim.app'

  it('extrae slug de subdominio glowsim.app', () => {
    const result = extractTenantIdentifier('jessica.glowsim.app', APP_DOMAIN)
    expect(result).toEqual({ type: 'slug', value: 'jessica' })
  })

  it('retorna custom_domain para dominios desconocidos', () => {
    const result = extractTenantIdentifier('simulador.jessicaclinica.com', APP_DOMAIN)
    expect(result).toEqual({ type: 'custom_domain', value: 'simulador.jessicaclinica.com' })
  })

  it('retorna none para el dominio raíz exacto', () => {
    const result = extractTenantIdentifier('glowsim.app', APP_DOMAIN)
    expect(result).toEqual({ type: 'none' })
  })

  it('retorna none para localhost', () => {
    const result = extractTenantIdentifier('localhost:3000', APP_DOMAIN)
    expect(result).toEqual({ type: 'none' })
  })

  it('extrae slug de subdominio sin puerto', () => {
    const result = extractTenantIdentifier('demo.glowsim.app', APP_DOMAIN)
    expect(result).toEqual({ type: 'slug', value: 'demo' })
  })
})
