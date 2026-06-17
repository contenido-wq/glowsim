'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartPoint {
  date: string
  visitas: number
  simulaciones: number
}

export function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #D4E4EE' }}>
      <h3 className="text-sm font-medium mb-4" style={{ color: '#0D1E2C' }}>Últimos 30 días</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBF2F5" />
          <XAxis dataKey="date" tick={{ fill: '#9AAAB8', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#9AAAB8', fontSize: 11 }} tickLine={false} axisLine={false} width={25} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D4E4EE', borderRadius: 8 }} labelStyle={{ color: '#0D1E2C' }} itemStyle={{ color: '#6B8194' }} />
          <Line type="monotone" dataKey="visitas" stroke="#1B72D9" strokeWidth={2} dot={false} name="Visitas" />
          <Line type="monotone" dataKey="simulaciones" stroke="#4A9BB0" strokeWidth={2} dot={false} name="Simulaciones" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
