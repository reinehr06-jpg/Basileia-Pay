import type { Scene, BreakpointId, Node, ElementNode } from '../core/types';
import { propsToStyle } from '../core/layoutEngine';

interface CheckoutRuntimeProps {
  scene: Scene;
  breakpoint: BreakpointId;
  state: {
    step: 'details' | 'payment' | 'success';
    method: 'pix' | 'card' | 'boleto';
  };
  onPixPay(): void;
  onCardPay(cardData: Record<string, unknown>): void;
}

export function CheckoutRuntime(props: CheckoutRuntimeProps) {
  const root = props.scene.nodes[props.scene.rootId];
  if (!root) return null;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif" }}>
      <RuntimeNode node={root} {...props} />
    </div>
  );
}

function RuntimeNode(
  props: {
    node: Node;
    scene: Scene;
    breakpoint: BreakpointId;
  } & CheckoutRuntimeProps
) {
  const { node, scene, breakpoint } = props;
  const style = propsToStyle(node.props, breakpoint);

  // Handle gradient background for runtime
  const bg = style.backgroundColor;
  if (bg && typeof bg === 'string' && bg.includes('gradient')) {
    style.background = bg;
    delete style.backgroundColor;
  }

  if (node.kind === 'element') {
    return renderRuntimeElement(node as ElementNode, style, props);
  }

  return (
    <div style={{ ...style, position: 'relative', boxSizing: 'border-box' }}>
      {node.children.map((id) => {
        const child = scene.nodes[id];
        if (!child) return null;
        return (
          <RuntimeNode
            key={id}
            {...props}
            node={child}
          />
        );
      })}
    </div>
  );
}

function renderRuntimeElement(
  node: ElementNode,
  style: React.CSSProperties,
  props: CheckoutRuntimeProps & { scene: Scene; breakpoint: BreakpointId }
) {
  switch (node.component) {
    case 'heading':
      return (
        <h2 style={{ ...style, margin: 0, letterSpacing: '-0.5px' }}>
          {node.content ?? 'Título'}
        </h2>
      );

    case 'text':
      return (
        <p style={{ ...style, margin: 0, lineHeight: 1.6 }}>
          {node.content ?? 'Texto'}
        </p>
      );

    case 'button':
      return (
        <button
          style={{
            ...style,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onClick={() => {
            if (props.state.method === 'card') props.onCardPay({});
            else props.onPixPay();
          }}
        >
          {node.content ?? 'Pagar'}
        </button>
      );

    case 'badge':
      return <span style={{ ...style, display: 'inline-block' }}>{node.content}</span>;

    case 'sticker':
      return (
        <div
          style={{
            ...style,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '999px',
            background: '#f97316',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 800,
            transform: 'rotate(-4deg)',
            boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
          }}
        >
          {node.content ?? '-50% OFF'}
        </div>
      );

    case 'timer':
      return (
        <div style={{ ...style, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>⏱</span>
          <span>{node.content ?? '00:00'}</span>
        </div>
      );

    case 'summary':
      return (
        <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
            {(node.meta as Record<string, string>)?.label ?? 'Total'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            {(node.meta as Record<string, string>)?.originalPrice && (
              <span style={{ fontSize: '16px', color: '#64748b', textDecoration: 'line-through' }}>
                {(node.meta as Record<string, string>).originalPrice}
              </span>
            )}
            <span style={{ lineHeight: 1 }}>{node.content ?? 'R$ 0,00'}</span>
          </div>
        </div>
      );

    case 'pix-block':
      return (
        <div style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '12px' }}>
            <div
              style={{
                width: '160px',
                height: '160px',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              QR Code Pix
            </div>
          </div>
          <button
            style={{
              background: '#10b981',
              color: '#022c22',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 20px',
              fontWeight: 700,
              width: '100%',
              cursor: 'pointer',
              marginTop: '16px',
            }}
            onClick={props.onPixPay}
          >
            Copiar código Pix
          </button>
        </div>
      );

    case 'card-form':
      return (
        <div style={{ ...style, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            placeholder="Número do cartão"
            style={{
              width: '100%',
              background: 'rgba(2,6,23,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              color: '#f8fafc',
              fontSize: '14px',
            }}
          />
          <input
            placeholder="Nome impresso"
            style={{
              width: '100%',
              background: 'rgba(2,6,23,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              color: '#f8fafc',
              fontSize: '14px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              placeholder="MM/AA"
              style={{
                flex: 1,
                background: 'rgba(2,6,23,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                color: '#f8fafc',
                fontSize: '14px',
              }}
            />
            <input
              placeholder="CVV"
              style={{
                flex: 1,
                background: 'rgba(2,6,23,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                color: '#f8fafc',
                fontSize: '14px',
              }}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
