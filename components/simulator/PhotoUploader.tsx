'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, Loader2 } from 'lucide-react'

interface PhotoUploaderProps {
  onPhotoSelected: (base64: string) => void
  isLoading: boolean
}

async function resizeToBase64(file: File, maxPx = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export function PhotoUploader({ onPhotoSelected, isLoading }: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    const base64 = await resizeToBase64(file)
    setPreview(base64)
    onPhotoSelected(base64)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      {!preview ? (
        <>
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900">
            <Camera className="w-16 h-16 text-zinc-600" />
          </div>
          <p className="text-xs text-zinc-500 text-center">
            Tu foto no se guarda en ningún servidor
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => cameraRef.current?.click()} className="w-full gap-2">
              <Camera className="w-4 h-4" />
              Tomar selfie
            </Button>
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full gap-2">
              <Upload className="w-4 h-4" />
              Subir foto
            </Button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </>
      ) : (
        <div className="relative w-full max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Tu foto" className="w-full rounded-xl object-cover" />
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <p className="text-sm text-white font-medium">Analizando con IA...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
