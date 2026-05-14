'use client'

interface Props {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; placeholder?: string; hint?: string
}

export function TextInput({ label, value, onChange, multiline, placeholder, hint }: Props) {
  const base = "w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500 placeholder:text-gray-600 transition"
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-300">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
      {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
    </div>
  )
}
