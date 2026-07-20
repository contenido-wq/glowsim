'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartPoint {
  date: string
  visitas: number
  simulaciones: number
}

export function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#171721', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-medium mb-4 text-white">Últimos 30 días</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} width={25} />
          <Tooltip contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#FFFFFF' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} />
          <Line type="monotone" dataKey="visitas" stroke="#5AA9E6" strokeWidth={2} dot={false} name="Visitas" />
          <Line type="monotone" dataKey="simulaciones" stroke="#7EC8DC" strokeWidth={2} dot={false} name="Simulaciones" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
