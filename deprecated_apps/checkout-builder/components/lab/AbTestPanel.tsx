'use client'

import { useState, useEffect } from 'react'

interface AbTest {
  id: number
  config_a_id: number
  config_b_id: number
  config_a_name: string
  config_b_name: string
  split_percent: number   // 0-100: % que vai para config A
  is_active: boolean
  visits_a: number
  visits_b: number
  conversions_a: number
  conversions_b: number
}

interface Theme { id: number; name: string }

export function AbTestPanel() {
  const [test, setTest] = useState<AbTest | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [form, setForm] = useState({ config_a_id: '', config_b_id: '', split_percent: 50 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/checkout-configs', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/dashboard/ab-test', { credentials: 'include' }).then(r => r.json()).catch(() => null),
    ]).then(([themes, abTest]) => {
      setThemes(themes)
      if (abTest?.id) {
        setTest(abTest)
        setForm({ config_a_id: String(abTest.config_a_id), config_b_id: String(abTest.config_b_id), split_percent: abTest.split_percent })
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/ab-test', {
        method: test ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setTest(data)
    } finally { setSaving(false) }
  }

  const handleToggle = async () => {
    if (!test) return
    const res = await fetch(`/api/dashboard/ab-test/${test.id}/toggle`, {
      method: 'POST', credentials: 'include',
    })
    const data = await res.json()
    setTest(data)
  }

  const convRateA = test && test.visits_a > 0 ? ((test.conversions_a / test.visits_a) * 100).toFixed(1) : '—'
  const convRateB = test && test.visits_b > 0 ? ((test.conversions_b / test.visits_b) * 100).toFixed(1) : '—'
  const winner = test && test.visits_a > 50 && test.visits_b > 50
    ? (parseFloat(convRateA) > parseFloat(convRateB) ? 'A' : parseFloat(convRateB) > parseFloat(convRateA) ? 'B' : null)
    : null

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-gray-500 animate-pulse text-sm">Carregando...</span></div>

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">⚡ A/B Test</h1>
        <p className="text-sm text-gray-500 mt-1">Teste dois checkouts ao mesmo tempo e veja qual converte mais</p>
      </div>

      {/* Configuração */}
      <div className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800">
        <h2 className="text-sm font-semibold text-white">Configuração do Teste</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Checkout A</label>
            <select value={form.config_a_id} onChange={e => setForm(f => ({ ...f, config_a_id: e.target.value }))}
              className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-violet-500">
              <option value="">Selecionar...</option>
              {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Checkout B</label>
            <select value={form.config_b_id} onChange={e => setForm(f => ({ ...f, config_b_id: e.target.value }))}
              className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-violet-500">
              <option value="">Selecionar...</option>
              {themes.filter(t => String(t.id) !== form.config_a_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Split visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>A — {form.split_percent}%</span>
            <span>B — {100 - form.split_percent}%</span>
          </div>
          <div className="relative h-8 bg-gray-800 rounded-xl overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-violet-600 flex items-center justify-center transition-all"
              style={{ width: `${form.split_percent}%` }}>
              {form.split_percent > 20 && <span className="text-[10px] text-white font-bold">A</span>}
            </div>
            <div className="absolute inset-y-0 right-0 bg-indigo-500 flex items-center justify-center transition-all"
              style={{ width: `${100 - form.split_percent}%` }}>
              {100 - form.split_percent > 20 && <span className="text-[10px] text-white font-bold">B</span>}
            </div>
          </div>
          <input type="range" min={10} max={90} step={5} value={form.split_percent}
            onChange={e => setForm(f => ({ ...f, split_percent: Number(e.target.value) }))}
            className="w-full opacity-0 absolute cursor-pointer" style={{ marginTop: -32, height: 32, position: 'relative', zIndex: 1 }} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={handleSave} disabled={saving || !form.config_a_id || !form.config_b_id}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-40">
            {saving ? 'Salvando...' : 'Salvar configuração'}
          </button>
          {test && (
            <button type="button" onClick={handleToggle}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition border ${test.is_active ? 'border-red-700 text-red-400 hover:bg-red-900/20' : 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/20'}`}>
              {test.is_active ? '⏸ Pausar teste' : '▶ Ativar teste'}
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {test && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">📊 Resultados</h2>
            {winner && (
              <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-semibold">
                🏆 Checkout {winner} vencendo
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'A', name: test.config_a_name, visits: test.visits_a, conv: test.conversions_a, rate: convRateA, color: 'violet' },
              { label: 'B', name: test.config_b_name, visits: test.visits_b, conv: test.conversions_b, rate: convRateB, color: 'indigo' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 border ${winner === s.label ? 'border-emerald-700 bg-emerald-900/10' : 'border-gray-700 bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-lg bg-${s.color}-600 flex items-center justify-center text-white text-xs font-bold`}>{s.label}</span>
                  <span className="text-sm text-white font-medium truncate">{s.name}</span>
                  {winner === s.label && <span className="text-emerald-400 text-sm">🏆</span>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Visitas</span>
                    <span className="text-gray-300 font-mono">{s.visits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Conversões</span>
                    <span className="text-gray-300 font-mono">{s.conv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Taxa de conv.</span>
                    <span className={`font-mono font-bold ${winner === s.label ? 'text-emerald-400' : 'text-gray-300'}`}>{s.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
