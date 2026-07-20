'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateBusinessBanner, removeBusinessBanner } from '@/app/actions/admin'
import { compressImageFile } from '@/lib/imageCompression'

interface BannerUploaderProps {
  businessId: string
  currentBannerUrl: string | null
  onBannerChange?: (url: string | null) => void
  fileName?: string
  updateAction?: (url: string) => Promise<void>
  removeAction?: (path?: string) => Promise<void>
}

type UploadState = 'idle' | 'compressing' | 'uploading' | 'error'

export function BannerUploader({
  businessId,
  currentBannerUrl,
  onBannerChange,
  fileName = 'banner',
  updateAction = updateBusinessBanner,
  removeAction = removeBusinessBanner,
}: BannerUploaderProps) {
  const [bannerUrl, setBannerUrl] = useState(currentBannerUrl)
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
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('La imagen debe pesar menos de 15MB')
      setUploadState('error')
      return
    }

    setErrorMsg('')

    try {
      setUploadState('compressing')
      const compressed = await compressImageFile(file, { maxWidth: 1600, quality: 0.8 })

      setUploadState('uploading')
      const path = `${businessId}/${fileName}.jpg`
      const supabase = createClient()

      const { data, error } = await supabase.storage
        .from('banners')
        .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(data.path)

      const urlWithCache = `${publicUrl}?t=${Date.now()}`

      startTransition(async () => {
        await updateAction(publicUrl)
        setBannerUrl(urlWithCache)
        setUploadState('idle')
        onBannerChange?.(urlWithCache)
      })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al subir el banner')
      setUploadState('error')
    }

    e.target.value = ''
  }

  async function handleRemove() {
    startTransition(async () => {
      await removeAction(bannerUrl ?? undefined)
      setBannerUrl(null)
      onBannerChange?.(null)
    })
  }

  const isLoading = uploadState === 'compressing' || uploadState === 'uploading' || isPending

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="relative w-full aspect-[16/9] rounded-xl overflow-hidden transition-all focus:outline-none focus-visible:ring-2"
        style={{
          border: uploadState === 'error'
            ? '2px solid #ef4444'
            : bannerUrl
            ? '2px solid rgba(255,255,255,0.15)'
            : '2px dashed rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Subir banner
          </div>
        )}

        {!isLoading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Cambiar</span>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#4A9BB0' }}
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="text-sm font-medium disabled:opacity-50"
          style={{ color: '#7EC8DC' }}
        >
          {bannerUrl ? 'Cambiar banner' : 'Subir banner'}
        </button>
        {bannerUrl && !isLoading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Eliminar
          </button>
        )}
      </div>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        JPG, PNG · Se optimiza automáticamente al subir
      </p>
      {uploadState === 'error' && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}
