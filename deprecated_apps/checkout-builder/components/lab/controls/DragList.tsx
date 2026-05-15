'use client'
import { useState } from 'react'

interface Item { id: string; label: string }
interface Props { items: Item[]; onChange: (ids: string[]) => void }

export function DragList({ items, onChange }: Props) {
  const [list, setList] = useState(items)
  const [dragging, setDragging] = useState<number | null>(null)

  const handleDragStart = (i: number) => setDragging(i)
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragging === null || dragging === i) return
    const next = [...list]
    const [moved] = next.splice(dragging, 1)
    next.splice(i, 0, moved)
    setList(next)
    setDragging(i)
    onChange(next.map(x => x.id))
  }

  return (
    <div className="space-y-1.5">
      {list.map((item, i) => (
        <div key={item.id} draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={e => handleDragOver(e, i)}
          onDragEnd={() => setDragging(null)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-xl cursor-grab active:cursor-grabbing border border-gray-700 select-none">
          <span className="text-gray-600 text-xs">⠿</span>
          <span className="text-xs text-gray-300">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
