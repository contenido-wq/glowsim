'use client'

import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { toggleBusinessActive } from '@/app/actions/superadmin'

interface Business {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
  business_types: { name: string } | null
}

export function BusinessTable({ businesses }: { businesses: Business[] }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleBusinessActive(id, !current) })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {businesses.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-10">No hay negocios registrados.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Negocio</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">URL</th>
              <th className="px-4 py-3 text-zinc-400 font-medium">Activo</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => (
              <tr key={biz.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{biz.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{biz.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{biz.business_types?.name ?? '—'}</Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <a href={`https://${biz.slug}.glowsim.app`} target="_blank" rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs">
                    {biz.slug}.glowsim.app <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={biz.is_active} onCheckedChange={() => handleToggle(biz.id, biz.is_active)} disabled={isPending} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
