'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from '@/lib/studio/schema/types';
import { Shield, GripVertical } from 'lucide-react';

interface SortableBlockItemProps {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function SortableBlockItem({ block, index, isSelected, onSelect }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors w-full group relative
        ${isSelected ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'hover:bg-surface-raised text-ink'}
        ${isDragging ? 'shadow-lg opacity-80 ring-2 ring-[var(--brand-primary)] bg-white' : ''}
      `}
    >
      {/* Drag Handle (Grip) */}
      <button 
        className="p-1 text-ink-subtle hover:text-ink cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      {/* Botão de Seleção Principal */}
      <div 
        onClick={onSelect}
        className="flex items-center flex-1 cursor-pointer overflow-hidden gap-2"
      >
        <span className="text-xs font-bold w-4 opacity-50 select-none shrink-0">{index + 1}.</span>
        <span className="text-sm font-semibold truncate flex-1 select-none">{block.name}</span>
        {block.locked && (
          <span title="Bloco nativo (não pode ser excluído)">
            <Shield size={12} className="opacity-50 shrink-0" />
          </span>
        )}
      </div>
    </div>
  );
}
