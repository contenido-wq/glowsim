'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'
import type { Procedure, ProcedureZone } from '@/types'
import { toggleProcedure, deleteProcedure, addProcedure } from '@/app/actions/admin'
import { toast } from 'sonner'

interface ProcedureTableProps {
  procedures: Procedure[]
  availableZones: ProcedureZone[]
}

export function ProcedureTable({ procedures, availableZones }: ProcedureTableProps) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleProcedure(id, !current) })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este procedimiento?')) return
    startTransition(async () => {
      await deleteProcedure(id)
      toast('Procedimiento eliminado')
    })
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addProcedure(formData)
        setShowForm(false)
        toast('Procedimiento agregado')
      } catch {
        toast.error('Error al agregar')
      }
    })
  }

  const inputClass = 'bg-white/5 text-white border-white/15 placeholder:text-white/35'

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}>
        {procedures.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>No hay procedimientos. Agrega el primero.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Zona</th>
                <th className="px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Activo</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {procedures.map((proc) => (
                <tr key={proc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="last:border-0">
                  <td className="px-4 py-3 text-white">{proc.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.55)' }}>{proc.zone?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={proc.is_active} onCheckedChange={() => handleToggle(proc.id, proc.is_active)} disabled={isPending} />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button onClick={() => handleDelete(proc.id)} className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} disabled={isPending}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Button variant="outline" onClick={() => setShowForm(!showForm)} className="gap-2 bg-white/5 text-white border-white/15 hover:bg-white/10 hover:text-white">
        <Plus className="w-4 h-4" />
        Agregar procedimiento
      </Button>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl p-4 space-y-4" style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-name" className="text-white">Nombre</Label>
              <Input id="proc-name" name="name" required placeholder="Ej: Relleno de labios" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone_id" className="text-white">Zona</Label>
              <select name="zone_id" id="zone_id" className="w-full h-10 rounded-md px-3 text-sm bg-white/5 text-white border border-white/15">
                <option value="" className="bg-[#171721]">Sin zona específica</option>
                {availableZones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-[#171721]">{z.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-white">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Descripción breve" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-white/5 text-white border-white/15 hover:bg-white/10 hover:text-white">Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  )
}
