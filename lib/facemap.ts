const cache: Record<string, string> = {}

export async function loadFaceMapSVG(type: string): Promise<string> {
  if (cache[type]) return cache[type]
  const res = await fetch(`/facemaps/${type}.svg`)
  const text = await res.text()
  cache[type] = text
  return text
}
