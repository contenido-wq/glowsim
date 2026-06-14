'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartPoint {
  date: string
  visitas: number
  simulaciones: number
}

export function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-4">Últimos 30 días</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} width={25} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
          <Line type="monotone" dataKey="visitas" stroke="#60a5fa" strokeWidth={2} dot={false} name="Visitas" />
          <Line type="monotone" dataKey="simulaciones" stroke="#a78bfa" strokeWidth={2} dot={false} name="Simulaciones" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
