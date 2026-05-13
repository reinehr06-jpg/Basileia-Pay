'use client'

interface Props {
  label: string; min: number; max: number; step: number
  value: number; onChange: (v: number) => void; unit?: string
}

export function SliderInput({ label, min, max, step, value, onChange, unit = '' }: Props) {
  const pct = Math.round(((value - min) / (max - min)) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <label className="text-xs text-gray-300">{label}</label>
        <span className="text-xs text-violet-400 font-mono">{value}{unit}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1.5 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 1 }} />
        <div className="absolute w-4 h-4 rounded-full bg-white shadow-md border-2 border-violet-500 pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
    </div>
  )
}
