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
    <div
      className="rounded-t-3xl p-6 space-y-4"
      style={{ background: '#171721', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="w-12 h-1 rounded-full mx-auto" style={{ background: 'rgba(255,255,255,0.15)' }} />

      <div className="flex flex-wrap gap-2">
        {allZones.map((zone) => (
          <button
            key={zone.svg_id}
            onClick={() => onZoneSelect(zone.svg_id)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={
              activeZone?.svg_id === zone.svg_id
                ? { background: '#c9a876', color: '#2a2116' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {zone.zone_name}
          </button>
        ))}
      </div>

      {activeZone ? (
        <div className="space-y-3">
          <h3 className="text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{activeZone.zone_name}</h3>
          <div className="flex flex-wrap gap-2">
            {activeZone.procedures.map((proc) => (
              <span
                key={proc}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(201,168,118,0.12)', color: '#d9c2a0', border: '1px solid rgba(201,168,118,0.3)' }}
              >
                {proc}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{activeZone.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Confianza:</span>
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
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{summary}</p>
      )}
    </div>
  )
}
