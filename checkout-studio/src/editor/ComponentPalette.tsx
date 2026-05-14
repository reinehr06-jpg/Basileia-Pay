import type { ElementComponent } from '../core/types';
import { COMPONENT_PALETTE } from '../core/initialScene';
import { genId } from '../core/sceneReducer';
import type { SceneAction } from '../core/sceneReducer';
import type { ElementNode } from '../core/types';

interface ComponentPaletteProps {
  targetParentId?: string;
  dispatch(action: SceneAction): void;
}

export function ComponentPalette({ targetParentId, dispatch }: ComponentPaletteProps) {
  const addElement = (component: ElementComponent) => {
    if (!targetParentId) return;
    const node: ElementNode = {
      id: genId('e'),
      kind: 'element',
      component,
      parentId: targetParentId,
      children: [],
      content: defaultContent(component),
      props: defaultProps(component),
    };
    dispatch({ type: 'ADD_NODE', parentId: targetParentId, node });
  };

  return (
    <div className="component-palette">
      <h4 className="palette-title">Componentes</h4>
      <div className="palette-grid">
        {COMPONENT_PALETTE.map((item) => (
          <button
            key={item.component}
            className="palette-item"
            onClick={() => addElement(item.component)}
            title={item.label}
          >
            <span className="palette-icon">{item.icon}</span>
            <span className="palette-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function defaultContent(c: ElementComponent): string {
  switch (c) {
    case 'heading': return 'Novo Título';
    case 'text': return 'Texto de exemplo';
    case 'button': return 'Clique aqui';
    case 'badge': return '✨ Novo';
    case 'sticker': return '-30% OFF';
    case 'timer': return '14:59';
    case 'summary': return 'R$ 99,90';
    case 'input': return 'Seu nome...';
    default: return '';
  }
}

function defaultProps(c: ElementComponent) {
  switch (c) {
    case 'heading':
      return { fontSize: { base: 24 }, fontWeight: { base: 800 }, textColor: { base: '#f1f5f9' } };
    case 'text':
      return { fontSize: { base: 14 }, textColor: { base: '#94a3b8' } };
    case 'button':
      return { padding: { base: 12 }, borderRadius: { base: 999 } };
    case 'badge':
      return {
        fontSize: { base: 11 }, fontWeight: { base: 700 },
        textColor: { base: '#a78bfa' }, bgColor: { base: 'rgba(167,139,250,0.12)' },
        padding: { base: 8 }, borderRadius: { base: 999 },
      };
    case 'sticker':
      return {};
    case 'pix-block':
      return { padding: { base: 20 }, bgColor: { base: '#022c22' }, borderRadius: { base: 16 } };
    case 'card-form':
      return { padding: { base: 20 }, bgColor: { base: 'rgba(15,23,42,0.8)' }, borderRadius: { base: 16 } };
    case 'timer':
      return { fontSize: { base: 18 }, fontWeight: { base: 800 }, textColor: { base: '#f97316' } };
    case 'summary':
      return { fontSize: { base: 28 }, fontWeight: { base: 900 }, textColor: { base: '#e5e7eb' } };
    default:
      return {};
  }
}
