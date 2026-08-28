'use client';

import { useState } from 'react';
import { useStudioStore } from '@/lib/studio/editor/store';
import { addBlock, selectBlock, reorderBlocks } from '@/lib/studio/editor/commands';
import { SortableBlockItem } from './SortableBlockItem';
import { 
  Type, Shield, CreditCard, Ticket, 
  ShoppingCart, MousePointerClick, ShieldCheck, 
  LayoutList 
} from 'lucide-react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const AVAILABLE_BLOCKS = [
  { type: 'hero', name: 'Hero Principal', icon: Type, defaultContent: { title: 'Novo Título', subtitle: 'Descrição', badge: 'Novo' } },
  { type: 'secure_header', name: 'Header Seguro', icon: Shield, defaultContent: { text: 'Ambiente Seguro' } },
  { type: 'customer_fields', name: 'Formulário', icon: LayoutList, defaultContent: { fields: [] } },
  { type: 'payment_methods', name: 'Pagamento', icon: CreditCard, defaultContent: { title: 'Pagamento' } },
  { type: 'order_summary', name: 'Resumo', icon: ShoppingCart, defaultContent: { title: 'Resumo do Pedido' } },
  { type: 'coupon', name: 'Cupom', icon: Ticket, defaultContent: { placeholder: 'Cupom' } },
  { type: 'cta', name: 'Botão CTA', icon: MousePointerClick, defaultContent: { text: 'Comprar Agora' } },
  { type: 'guarantee', name: 'Selo Garantia', icon: ShieldCheck, defaultContent: { title: '7 Dias de Garantia' } },
];

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'structure'>('blocks');
  const schema = useStudioStore((state) => state.schema);
  const selectedBlockId = useStudioStore((state) => state.selectedBlockId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Exige mover 5px antes de considerar drag (evita conflito com click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = schema.blocks.findIndex((block) => block.id === active.id);
      const newIndex = schema.blocks.findIndex((block) => block.id === over.id);
      
      reorderBlocks(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-[280px] h-full bg-white border-r border-border flex flex-col shrink-0">
      
      {/* Tabs */}
      <div className="flex items-center border-b border-border shrink-0">
        <button 
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-3 text-sm transition-colors border-b-2 
            ${activeTab === 'blocks' ? 'font-bold text-ink border-[var(--brand-primary)]' : 'font-semibold text-ink-subtle border-transparent hover:text-ink'}`}
        >
          Blocos
        </button>
        <button 
          onClick={() => setActiveTab('structure')}
          className={`flex-1 py-3 text-sm transition-colors border-b-2 
            ${activeTab === 'structure' ? 'font-bold text-ink border-[var(--brand-primary)]' : 'font-semibold text-ink-subtle border-transparent hover:text-ink'}`}
        >
          Estrutura
        </button>
      </div>

      {/* Tab Content: Blocos */}
      {activeTab === 'blocks' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <p className="text-xs text-ink-subtle mb-2">Clique para adicionar ao final do checkout.</p>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_BLOCKS.map((block) => (
              <button
                key={block.type}
                onClick={() => addBlock(block.type, block.name, block.defaultContent)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-surface-raised border border-border rounded-lg hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all group"
              >
                <block.icon size={20} className="text-ink-subtle group-hover:text-[var(--brand-primary)] transition-colors" />
                <span className="text-[10px] font-bold text-ink text-center leading-tight">
                  {block.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Estrutura */}
      {activeTab === 'structure' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          {schema.blocks.length === 0 && (
            <p className="text-xs text-ink-subtle text-center py-4">Nenhum bloco no checkout.</p>
          )}
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={schema.blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {schema.blocks.map((block, index) => (
                <SortableBlockItem 
                  key={block.id} 
                  block={block} 
                  index={index}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => selectBlock(block.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
