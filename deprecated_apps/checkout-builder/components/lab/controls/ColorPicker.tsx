'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  return 0.2126*r + 0.7152*g + 0.0722*b
}

const SWATCHES = [
  '#7c3aed','#6366f1','#2563eb','#0891b2','#059669',
  '#d97706','#dc2626','#db2777','#374151','#1e293b',
  '#ffffff','#f8fafc','#e2e8f0','#94a3b8','#000000',
]

export function ColorPicker({ label, value, onChange }: Props) {
  const [hexInput, setHexInput] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setHexInput(value) }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleHex = useCallback((raw: string) => {
    setHexInput(raw)
    if (isValidHex(raw)) onChange(raw)
  }, [onChange])

  const textColor = isValidHex(value) && luminance(value) > 0.4 ? '#000' : '#fff'

  return (
    <div className="relative flex items-center justify-between gap-3" ref={ref}>
      <label className="text-xs text-gray-300 flex-1 truncate">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{ background: isValidHex(value) ? value : '#7c3aed' }}
          className="w-7 h-7 rounded-md border border-gray-600 hover:scale-110 transition"
        />
        <input
          type="text"
          value={hexInput}
          maxLength={7}
          onChange={(e) => handleHex(e.target.value)}
          className="w-[76px] bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 border border-gray-700 focus:outline-none focus:border-violet-500 font-mono"
        />
      </div>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 w-52">
          <div className="flex items-center gap-2 mb-3">
            <input type="color" value={isValidHex(value) ? value : '#7c3aed'}
              onChange={(e) => { onChange(e.target.value); setHexInput(e.target.value) }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
            <span className="text-xs text-gray-400">Escolher cor</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {SWATCHES.map(s => (
              <button key={s} type="button"
                onClick={() => { onChange(s); setHexInput(s); setOpen(false) }}
                style={{ background: s }}
                className={`w-8 h-8 rounded-lg border hover:scale-110 transition ${value===s ? 'border-violet-400 scale-110' : 'border-gray-600'}`}
              />
            ))}
          </div>
          <div style={{ background: value, color: textColor }}
            className="mt-3 rounded-lg py-1.5 text-center text-xs font-mono">
            {value}
          </div>
        </div>
      )}
    </div>
  )
}
