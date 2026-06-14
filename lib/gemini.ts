import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { FaceMapType, AnalysisResult } from '@/types'

const ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    zones: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          svg_id: { type: SchemaType.STRING },
          zone_name: { type: SchemaType.STRING },
          procedures: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          description: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING, enum: ['high', 'medium', 'low'] },
        },
        required: ['svg_id', 'zone_name', 'procedures', 'description', 'confidence'],
      },
    },
    summary: { type: SchemaType.STRING },
  },
  required: ['zones', 'summary'],
}

const PROMPTS: Record<FaceMapType, (procedures: string) => string> = {
  face: (procedures) =>
    `Eres un experto en estética facial. Analiza esta fotografía de rostro y recomienda procedimientos para las zonas que lo necesiten.

Procedimientos disponibles: ${procedures}

Usa solo estos svg_id exactos: frente, ojos_izq, ojos_der, nariz, labios, mejilla_izq, mejilla_der, menton, cuello.
Solo incluye zonas que realmente veas y necesiten atención. Máximo 5 zonas.
Descripción de cada zona: 2-3 oraciones en español. Summary: 1 párrafo motivador.`,

  hair: (procedures) =>
    `Eres un barbero/estilista experto. Analiza esta fotografía y recomienda servicios para las zonas del cabello.

Servicios disponibles: ${procedures}

Usa solo estos svg_id exactos: parte_superior, lado_izq, lado_der, nuca, barba, patillas.
Máximo 4 zonas. Descripción en español, 2-3 oraciones. Summary motivador.`,

  hands: (procedures) =>
    `Eres una especialista en spa de uñas. Analiza esta fotografía de manos y recomienda tratamientos.

Tratamientos disponibles: ${procedures}

Usa solo estos svg_id exactos: unas, cuticulas, dorso.
Descripción en español, 2-3 oraciones. Summary motivador.`,

  brows: (procedures) =>
    `Eres una experta en micropigmentación. Analiza esta fotografía y recomienda tratamientos.

Tratamientos disponibles: ${procedures}

Usa solo estos svg_id exactos: ceja_izq, ceja_der, labio_superior, labio_inferior.
Descripción en español, 2-3 oraciones. Summary motivador.`,
}

export async function analyzeWithGemini(
  base64Image: string,
  faceMapType: FaceMapType,
  procedureNames: string[]
): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA as any,
    },
  })

  const mimeType = base64Image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
  const prompt = PROMPTS[faceMapType](procedureNames.join(', '))

  const result = await model.generateContent([
    { inlineData: { data: base64Image, mimeType } },
    prompt,
  ])

  return JSON.parse(result.response.text()) as AnalysisResult
}
