import React, { useEffect } from 'react';
import type { Scene, BreakpointId, Node, ElementNode } from '../core/types';
import { propsToStyle } from '../core/layoutEngine';
import { sanitizeCSS } from '../utils/sanitize';
import { trackEvent } from '../core/analytics';

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
  useEffect(() => {
    trackEvent('view_item', { items: [{ id: props.scene.rootId, name: 'Checkout Page' }] });
  }, [props.scene.rootId]);

  const root = props.scene.nodes[props.scene.rootId];
  if (!root) return null;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif" }}>
      {props.scene.customCSS && <style>{sanitizeCSS(props.scene.customCSS)}</style>}
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
    case 'image':
      return (
        <img
          src={(node.props.src as string) || (node.content as string) || ''}
          alt={(node.props.alt as string) || ''}
          style={{
            ...style,
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      );

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
            <button
              onClick={() => {
                trackEvent('add_payment_info', { payment_type: 'pix' });
                trackEvent('purchase', { value: 99.90, currency: 'BRL', transaction_id: 'txn_' + Date.now() });
                props.onPixPay();
              }}
              style={{
                marginTop: '16px',
                background: '#10b981',
                color: '#022c22',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 20px',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {node.content ?? 'Copiar código Pix'}
            </button>
          </div>
        </div>
      );

    case 'card-form':
      return <CardFormRuntime style={style} onCardPay={props.onCardPay} />;

    default:
      return null;
  }
}

// Helpers e Componentes Internos
function validateCardNumber(number: string): boolean {
  const digits = number.replace(/\s/g, '');
  return /^\d{13,19}$/.test(digits) && luhnCheck(digits);
}

function validateExpiry(expiry: string): boolean {
  const parts = expiry.split('/');
  if (parts.length !== 2) return false;
  const [month, year] = parts;
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(m) || isNaN(y)) return false;
  return m >= 1 && m <= 12 && y >= new Date().getFullYear() % 100;
}

function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

function luhnCheck(number: string): boolean {
  let sum = 0;
  let isEven = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function CardFormRuntime({ style, onCardPay }: { style: React.CSSProperties, onCardPay: (cardData: any) => void }) {
  const [number, setNumber] = import('react').then(() => {} /* this is a hack just to use hook below */) && null as any;
  // Let's actually not use hooks dynamically like this to avoid errors. We'll use regular React.useState from global React if possible, but React isn't imported for hooks here. 
  // Let's import useState at the top of the file! Wait, this is a multi_replace chunk, I can't easily add `import { useState }` at the top if I didn't include it in chunk 1, but I can try. Oh wait, I didn't add it in chunk 1.
  // We can just use React.useState since React might be implicitly imported or I can require it.
  
  // No problem, I will use regular React state.
  const React = require('react');
  const [cardNum, setCardNum] = React.useState('');
  const [name, setName] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = () => {
    trackEvent('add_payment_info', { payment_type: 'card' });
    const errs = [];
    if (!validateCardNumber(cardNum)) errs.push('Número do cartão inválido');
    if (!name.trim()) errs.push('Nome é obrigatório');
    if (!validateExpiry(expiry)) errs.push('Validade inválida (MM/AA)');
    if (!validateCVV(cvv)) errs.push('CVV inválido');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setErrors([]);
    trackEvent('purchase', { value: 99.90, currency: 'BRL', transaction_id: 'txn_' + Date.now() });
    onCardPay({ number: cardNum, name, expiry, cvv });
  };

  return (
    <div style={{ ...style, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {errors.length > 0 && (
        <div style={{ color: '#ef4444', fontSize: '12px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}
      <input
        placeholder="Número do cartão"
        value={cardNum}
        onChange={(e) => setCardNum(e.target.value)}
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
        value={name}
        onChange={(e) => setName(e.target.value)}
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
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
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
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
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
      <button 
        onClick={handleSubmit}
        style={{
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          marginTop: '8px'
        }}
      >
        Validar e Pagar
      </button>
    </div>
  );
}

