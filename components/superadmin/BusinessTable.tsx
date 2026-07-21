'use client'

import { useTransition } from 'react'
import { ExternalLink } from 'lucide-react'
import { toggleBusinessActive } from '@/app/actions/superadmin'
import { getPublicUrl } from '@/lib/tenant'

interface Business {
  id: string
  name: string
  slug: string
  custom_domain?: string | null
  is_active: boolean
  created_at: string
  business_types: { name: string } | null
}

export function BusinessTable({ businesses }: { businesses: Business[] }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleBusinessActive(id, !current) })
  }

  if (businesses.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          No hay negocios registrados aún.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Negocio', 'Tipo', 'URL', 'Estado'].map((h) => (
              <th
                key={h}
                className="text-left px-5 py-4 font-medium"
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {businesses.map((biz) => (
            <tr
              key={biz.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              className="last:border-0 transition-colors hover:bg-white/[0.03]"
            >
              <td className="px-5 py-4">
                <div className="font-semibold text-white">{biz.name}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {biz.slug}
                </div>
              </td>
              <td className="px-5 py-4 hidden md:table-cell">
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {biz.business_types?.name ?? '—'}
                </span>
              </td>
              <td className="px-5 py-4 hidden lg:table-cell">
                <a
                  href={getPublicUrl(biz)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs transition-colors hover:text-[#d9c2a0]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {getPublicUrl(biz).replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td className="px-5 py-4">
                <button
                  onClick={() => handleToggle(biz.id, biz.is_active)}
                  disabled={isPending}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                  style={
                    biz.is_active
                      ? {
                          background: 'rgba(34,197,94,0.12)',
                          color: '#22C55E',
                          border: '1px solid rgba(34,197,94,0.25)',
                        }
                      : {
                          background: 'rgba(248,113,113,0.10)',
                          color: '#F87171',
                          border: '1px solid rgba(248,113,113,0.2)',
                        }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: biz.is_active ? '#22C55E' : '#F87171',
                      boxShadow: biz.is_active ? '0 0 6px #22C55E' : '0 0 6px #F87171',
                    }}
                  />
                  {biz.is_active ? 'Activo' : 'Pausado'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
