'use client'

interface Props {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number; unit?: string
}

export function NumberInput({ label, value, onChange, min, max, step = 1, unit }: Props) {
  const dec = () => { const n = value - step; if (min === undefined || n >= min) onChange(n) }
  const inc = () => { const n = value + step; if (max === undefined || n <= max) onChange(n) }
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-gray-300 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <button type="button" onClick={dec}
          className="w-6 h-6 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center transition">−</button>
        <div className="flex items-center gap-0.5 min-w-[52px] justify-center">
          <input type="number" value={value} min={min} max={max} step={step}
            onChange={e => { const v = Number(e.target.value); if ((min===undefined||v>=min)&&(max===undefined||v<=max)) onChange(v) }}
            className="w-10 bg-transparent text-center text-xs text-gray-200 font-mono border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
        <button type="button" onClick={inc}
          className="w-6 h-6 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center transition">+</button>
      </div>
    </div>
  )
}
