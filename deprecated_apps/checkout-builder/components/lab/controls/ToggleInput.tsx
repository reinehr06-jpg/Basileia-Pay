'use client'

interface Props {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string
}

export function ToggleInput({ label, value, onChange, description }: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <span className="text-xs text-gray-300 block">{label}</span>
        {description && <span className="text-[10px] text-gray-500 block mt-0.5">{description}</span>}
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 ${value ? 'bg-violet-600' : 'bg-gray-700'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
