import { useRef, useState, type PointerEventHandler } from 'react';
import type { Scene, Node, BreakpointId, ElementNode } from '../core/types';
import { propsToStyle } from '../core/layoutEngine';

interface CanvasProps {
  scene: Scene;
  breakpoint: BreakpointId;
  selectedId?: string;
  onSelect(id: string): void;
  onMove(nodeId: string, newParentId: string, index?: number): void;
}

export function Canvas({ scene, breakpoint, selectedId, onSelect, onMove }: CanvasProps) {
  const root = scene.nodes[scene.rootId];
  if (!root) return null;

  return (
    <div className="canvas-viewport">
      <div className="canvas-artboard" style={{ width: breakpoint === 'mobile' ? 390 : breakpoint === 'tablet' ? 768 : '100%' }}>
        <NodeView
          node={root}
          scene={scene}
          breakpoint={breakpoint}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
          depth={0}
        />
      </div>
    </div>
  );
}

interface NodeViewProps {
  node: Node;
  scene: Scene;
  breakpoint: BreakpointId;
  selectedId?: string;
  onSelect(id: string): void;
  onMove(nodeId: string, newParentId: string, index?: number): void;
  depth: number;
}

function NodeView({ node, scene, breakpoint, selectedId, onSelect, onMove, depth }: NodeViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isSelected = node.id === selectedId;
  const isPage = node.kind === 'page';
  const isElement = node.kind === 'element';

  const style = propsToStyle(node.props, breakpoint);

  // Handle gradient backgrounds
  const bg = style.backgroundColor;
  if (bg && typeof bg === 'string' && bg.includes('gradient')) {
    style.background = bg;
    delete style.backgroundColor;
  }

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    onSelect(node.id);
    if (isElement && !node.locked) {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const borderStyle = isPage
    ? 'none'
    : isSelected
      ? '2px solid #6366f1'
      : depth > 0
        ? '1px dashed rgba(99,102,241,0.15)'
        : 'none';

  const hoverClass = isPage ? '' : 'canvas-node-hover';

  return (
    <div
      ref={ref}
      className={`canvas-node ${hoverClass} ${isDragging ? 'canvas-node-dragging' : ''}`}
      data-node-id={node.id}
      data-kind={node.kind}
      style={{
        ...style,
        border: borderStyle,
        position: 'relative',
        boxSizing: 'border-box',
        cursor: isElement ? 'grab' : 'default',
        transition: 'border-color 0.15s ease',
        minHeight: node.children.length === 0 && !isElement ? 48 : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Kind label */}
      {isSelected && !isPage && (
        <div className="canvas-node-label">
          {node.label || node.kind}
          {isElement && `: ${(node as ElementNode).component}`}
        </div>
      )}

      {/* Render inner content */}
      {renderInner(node)}

      {/* Recurse children */}
      {node.children.map((childId) => {
        const child = scene.nodes[childId];
        if (!child) return null;
        return (
          <NodeView
            key={childId}
            node={child}
            scene={scene}
            breakpoint={breakpoint}
            selectedId={selectedId}
            onSelect={onSelect}
            onMove={onMove}
            depth={depth + 1}
          />
        );
      })}
    </div>
  );
}

function renderInner(node: Node) {
  if (node.kind !== 'element') return null;
  const el = node as ElementNode;

  switch (el.component) {
    case 'heading':
      return <h2 style={{ margin: 0, letterSpacing: -0.5 }}>{el.content ?? 'Título'}</h2>;

    case 'text':
      return <p style={{ margin: 0, lineHeight: 1.6 }}>{el.content ?? 'Texto'}</p>;

    case 'button':
      return (
        <button className="ck-button">{el.content ?? 'Comprar agora'}</button>
      );

    case 'badge':
      return (
        <span className="ck-badge">{el.content ?? 'Badge'}</span>
      );

    case 'sticker':
      return (
        <div className="ck-sticker">{el.content ?? '-50% OFF'}</div>
      );

    case 'timer':
      return (
        <div className="ck-timer">
          <span className="ck-timer-icon">⏱</span>
          <span>Oferta expira em {el.content ?? '09:59'}</span>
        </div>
      );

    case 'summary':
      return (
        <div className="ck-summary">
          <span className="ck-summary-label">{(el.meta as Record<string, string>)?.label ?? 'Total'}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            {(el.meta as Record<string, string>)?.originalPrice && (
              <span className="ck-summary-original">{(el.meta as Record<string, string>).originalPrice}</span>
            )}
            <span className="ck-summary-price">{el.content ?? 'R$ 0,00'}</span>
          </div>
        </div>
      );

    case 'pix-block':
      return (
        <div className="ck-pix-block">
          <div className="ck-pix-qr">
            <div className="ck-pix-qr-placeholder">QR Code</div>
          </div>
          <p style={{ color: '#a7f3d0', fontSize: 13, margin: '8px 0' }}>
            Escaneie com o app do seu banco
          </p>
          <button className="ck-pix-btn">Copiar código Pix</button>
        </div>
      );

    case 'card-form':
      return (
        <div className="ck-card-form">
          <div className="ck-field"><input placeholder="Número do cartão" readOnly /></div>
          <div className="ck-field"><input placeholder="Nome impresso" readOnly /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ck-field" style={{ flex: 1 }}><input placeholder="MM/AA" readOnly /></div>
            <div className="ck-field" style={{ flex: 1 }}><input placeholder="CVV" readOnly /></div>
          </div>
          <button className="ck-button" style={{ marginTop: 12 }}>Pagar com cartão</button>
        </div>
      );

    case 'divider':
      return <hr className="ck-divider" />;

    case 'input':
      return (
        <div className="ck-field">
          <input placeholder={el.content ?? 'Campo...'} readOnly />
        </div>
      );

    case 'image':
      return (
        <div className="ck-image-placeholder">
          <span>🖼 Imagem</span>
        </div>
      );

    default:
      return <span style={{ color: '#475569', fontSize: 12 }}>[{el.component}]</span>;
  }
}
