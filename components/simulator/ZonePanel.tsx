'use client'

import type { AnalysisZone } from '@/types'
import { Badge } from '@/components/ui/badge'

interface ZonePanelProps {
  activeZone: AnalysisZone | null
  allZones: AnalysisZone[]
  summary: string
  onZoneSelect: (svgId: string) => void
}

export function ZonePanel({ activeZone, allZones, summary, onZoneSelect }: ZonePanelProps) {
  return (
    <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-6 space-y-4">
      <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

      <div className="flex flex-wrap gap-2">
        {allZones.map((zone) => (
          <button
            key={zone.svg_id}
            onClick={() => onZoneSelect(zone.svg_id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeZone?.svg_id === zone.svg_id
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {zone.zone_name}
          </button>
        ))}
      </div>

      {activeZone ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">{activeZone.zone_name}</h3>
          <div className="flex flex-wrap gap-2">
            {activeZone.procedures.map((proc) => (
              <Badge key={proc} variant="secondary" className="text-xs">{proc}</Badge>
            ))}
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{activeZone.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Confianza:</span>
            <Badge
              variant="outline"
              className={`text-xs ${
                activeZone.confidence === 'high'
                  ? 'border-green-500 text-green-400'
                  : activeZone.confidence === 'medium'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-red-500 text-red-400'
              }`}
            >
              {activeZone.confidence === 'high' ? 'Alta' : activeZone.confidence === 'medium' ? 'Media' : 'Baja'}
            </Badge>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
      )}
    </div>
  )
}
