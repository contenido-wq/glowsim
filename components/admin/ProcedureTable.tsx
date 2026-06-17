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

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}>
        {procedures.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: '#9AAAB8' }}>No hay procedimientos. Agrega el primero.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #EBF2F5' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#9AAAB8' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: '#9AAAB8' }}>Zona</th>
                <th className="px-4 py-3 font-medium" style={{ color: '#9AAAB8' }}>Activo</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {procedures.map((proc) => (
                <tr key={proc.id} style={{ borderBottom: '1px solid #EBF2F5' }} className="last:border-0">
                  <td className="px-4 py-3" style={{ color: '#0D1E2C' }}>{proc.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: '#6B8194' }}>{proc.zone?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={proc.is_active} onCheckedChange={() => handleToggle(proc.id, proc.is_active)} disabled={isPending} />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button onClick={() => handleDelete(proc.id)} className="transition-colors" style={{ color: '#9AAAB8' }} disabled={isPending}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Button variant="outline" onClick={() => setShowForm(!showForm)} className="gap-2">
        <Plus className="w-4 h-4" />
        Agregar procedimiento
      </Button>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-name">Nombre</Label>
              <Input id="proc-name" name="name" required placeholder="Ej: Relleno de labios" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone_id">Zona</Label>
              <select name="zone_id" id="zone_id" className="w-full h-10 rounded-md px-3 text-sm" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE', color: '#0D1E2C' }}>
                <option value="">Sin zona específica</option>
                {availableZones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Descripción breve" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  )
}
