export function computeTargetDimensions(
  width: number,
  height: number,
  maxWidth: number
): { width: number; height: number } {
  if (width <= maxWidth) return { width, height }
  const ratio = maxWidth / width
  return { width: maxWidth, height: Math.round(height * ratio) }
}

export async function compressImageFile(
  file: File,
  { maxWidth = 1600, quality = 0.8 }: { maxWidth?: number; quality?: number } = {}
): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = computeTargetDimensions(bitmap.width, bitmap.height, maxWidth)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )
  if (!blob) return file

  const name = file.name.replace(/\.[^.]+$/, '.jpg')
  return new File([blob], name, { type: 'image/jpeg' })
}
