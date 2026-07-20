import type { Procedure } from '@/types'

interface ProcedureCardsProps {
  procedures: Procedure[]
  primaryColor: string
}

export function ProcedureCards({ procedures, primaryColor }: ProcedureCardsProps) {
  if (!procedures.length) return null

  return (
    <section id="servicios" className="px-6 py-8">
      <h2 className="text-base font-semibold text-white mb-4">Nuestros servicios</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {procedures.map((proc) => (
          <div
            key={proc.id}
            className="flex-shrink-0 snap-start w-44 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2"
          >
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: `${primaryColor}33` }}
            />
            <h3 className="text-sm font-medium text-white">{proc.name}</h3>
            {proc.description && (
              <p className="text-xs text-zinc-400 line-clamp-2">{proc.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
