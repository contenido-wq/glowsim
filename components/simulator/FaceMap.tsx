'use client'

import { useEffect, useRef, useState } from 'react'
import type { AnalysisZone, FaceMapType } from '@/types'
import { loadFaceMapSVG } from '@/lib/facemap'

interface FaceMapProps {
  faceMapType: FaceMapType
  zones: AnalysisZone[]
  activeZoneId: string | null
  onZoneClick: (svgId: string) => void
  primaryColor: string
  userPhotoBase64: string
}

export function FaceMap({
  faceMapType,
  zones,
  activeZoneId,
  onZoneClick,
  primaryColor,
  userPhotoBase64,
}: FaceMapProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState('')
  const analyzedIds = new Set(zones.map((z) => z.svg_id))

  useEffect(() => {
    loadFaceMapSVG(faceMapType).then(setSvgContent)
  }, [faceMapType])

  useEffect(() => {
    const container = overlayRef.current
    if (!container || !svgContent) return
    const elements = container.querySelectorAll<SVGElement>('.facemap-zone')
    elements.forEach((el) => {
      if (analyzedIds.has(el.id)) {
        el.style.fill = primaryColor
        el.style.opacity = el.id === activeZoneId ? '0.65' : '0.35'
        el.style.cursor = 'pointer'
        el.style.transition = 'opacity 0.2s'
      } else {
        el.style.fill = '#6b7280'
        el.style.opacity = '0.08'
        el.style.cursor = 'default'
      }
    })
  }, [svgContent, zones, activeZoneId, primaryColor, analyzedIds])

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as SVGElement
    if (target.classList.contains('facemap-zone') && analyzedIds.has(target.id)) {
      onZoneClick(target.id)
    }
  }

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={userPhotoBase64} alt="Tu foto" className="w-full rounded-xl object-cover" />
      {svgContent && (
        <div
          ref={overlayRef}
          onClick={handleClick}
          className="absolute inset-0 rounded-xl overflow-hidden"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
      <p className="mt-2 text-xs text-center text-zinc-500">
        Toca una zona iluminada para ver las recomendaciones
      </p>
    </div>
  )
}
