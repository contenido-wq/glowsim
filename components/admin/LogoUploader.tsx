'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateBusinessLogo, removeBusinessLogo } from '@/app/actions/admin'

interface LogoUploaderProps {
  businessId: string
  businessName: string
  currentLogoUrl: string | null
  onLogoChange?: (url: string | null) => void
}

type UploadState = 'idle' | 'uploading' | 'error'

export function LogoUploader({ businessId, businessName, currentLogoUrl, onLogoChange }: LogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Solo se permiten imágenes')
      setUploadState('error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('El logo debe pesar menos de 2MB')
      setUploadState('error')
      return
    }

    setUploadState('uploading')
    setErrorMsg('')

    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${businessId}/logo.${ext}`
      const supabase = createClient()

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path)

      // Bust cache by appending timestamp
      const urlWithCache = `${publicUrl}?t=${Date.now()}`

      startTransition(async () => {
        await updateBusinessLogo(urlWithCache)
        setLogoUrl(urlWithCache)
        setUploadState('idle')
        onLogoChange?.(urlWithCache)
      })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al subir el logo')
      setUploadState('error')
    }

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  async function handleRemove() {
    startTransition(async () => {
      await removeBusinessLogo()
      setLogoUrl(null)
      onLogoChange?.(null)
    })
  }

  const isLoading = uploadState === 'uploading' || isPending

  return (
    <div className="flex items-center gap-4">
      {/* Circle zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 transition-all focus:outline-none focus-visible:ring-2"
        style={{
          border: uploadState === 'error'
            ? '2px solid #ef4444'
            : uploadState === 'uploading'
            ? '2px solid #1A6FA8'
            : logoUrl
            ? '2px solid #D4E4EE'
            : '2px dashed #D4E4EE',
          animation: uploadState === 'uploading' ? 'logo-pulse 1.2s ease-in-out infinite' : 'none',
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: '#6B8194' }}
          >
            {businessName[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        {/* Hover overlay */}
        {!isLoading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Cambiar</span>
          </div>
        )}

        {/* Uploading spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#1A6FA8' }}
            />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="text-sm font-medium disabled:opacity-50"
          style={{ color: '#1A6FA8' }}
        >
          {logoUrl ? 'Cambiar logo' : 'Subir logo'}
        </button>
        {logoUrl && !isLoading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs"
            style={{ color: '#9AAAB8' }}
          >
            Eliminar
          </button>
        )}
        <p className="text-xs" style={{ color: '#9AAAB8' }}>PNG, JPG · Máx 2MB</p>
        {uploadState === 'error' && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { border-color: #D4E4EE; }
          50% { border-color: #1A6FA8; }
        }
      `}</style>
    </div>
  )
}
