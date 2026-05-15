'use client'

interface Props {
  label: string; value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

export function SelectInput({ label, value, options, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-gray-300 flex-1 truncate">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="appearance-none bg-gray-800 text-gray-200 text-xs rounded-lg pl-2 pr-6 py-1.5 border border-gray-700 focus:outline-none focus:border-violet-500 cursor-pointer">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
      </div>
    </div>
  )
}
