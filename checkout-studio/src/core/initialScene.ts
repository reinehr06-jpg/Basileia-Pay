import type { Scene, ElementComponent } from './types';
import { genId } from './sceneReducer';

/**
 * A checkout page template with hero, payment section, and trust section.
 */
export function createDefaultScene(): Scene {
  const pageId = 'page_root';
  const heroId = genId('s');
  const paymentId = genId('s');
  const trustId = genId('s');

  const badgeId = genId('e');
  const headingId = genId('e');
  const subtextId = genId('e');
  const timerId = genId('e');
  const stickerId = genId('e');
  const pixBlockId = genId('e');
  const cardFormId = genId('e');
  const summaryId = genId('e');
  const trustBadge1 = genId('e');
  const trustBadge2 = genId('e');
  const trustBadge3 = genId('e');
  const footerText = genId('e');

  return {
    rootId: pageId,
    nodes: {
      [pageId]: {
        id: pageId,
        kind: 'page',
        name: 'Checkout Premium',
        children: [heroId, paymentId, trustId],
        props: {
          width: { base: '100%' },
          display: { base: 'flex' },
          flexDirection: { base: 'column' },
          alignItems: { base: 'center' },
          bgColor: { base: '#020617' },
          padding: { base: 0 },
        },
      },
      [heroId]: {
        id: heroId,
        kind: 'section',
        role: 'hero',
        parentId: pageId,
        children: [badgeId, headingId, subtextId, timerId, stickerId],
        props: {
          width: { base: '100%' },
          display: { base: 'flex' },
          flexDirection: { base: 'column' },
          alignItems: { base: 'center' },
          padding: { base: 48, mobile: 24 },
          gap: { base: 16 },
          bgColor: { base: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)' },
        },
        label: 'Hero',
      },
      [badgeId]: {
        id: badgeId,
        kind: 'element',
        component: 'badge',
        parentId: heroId,
        children: [],
        content: '✨ OFERTA EXCLUSIVA',
        props: {
          fontSize: { base: 11 },
          fontWeight: { base: 800 },
          textColor: { base: '#a78bfa' },
          bgColor: { base: 'rgba(167,139,250,0.12)' },
          padding: { base: 8 },
          borderRadius: { base: 999 },
        },
      },
      [headingId]: {
        id: headingId,
        kind: 'element',
        component: 'heading',
        parentId: heroId,
        children: [],
        content: 'Basileia Church — Plano Anual',
        props: {
          fontSize: { base: 32, mobile: 22 },
          fontWeight: { base: 900 },
          textColor: { base: '#f1f5f9' },
        },
      },
      [subtextId]: {
        id: subtextId,
        kind: 'element',
        component: 'text',
        parentId: heroId,
        children: [],
        content: 'Acesso completo à plataforma com suporte prioritário 24/7',
        props: {
          fontSize: { base: 15, mobile: 13 },
          textColor: { base: '#94a3b8' },
        },
      },
      [timerId]: {
        id: timerId,
        kind: 'element',
        component: 'timer',
        parentId: heroId,
        children: [],
        content: '09:59',
        props: {
          fontSize: { base: 18 },
          fontWeight: { base: 800 },
          textColor: { base: '#f97316' },
        },
      },
      [stickerId]: {
        id: stickerId,
        kind: 'element',
        component: 'sticker',
        parentId: heroId,
        children: [],
        content: '-50% OFF',
        props: {},
      },
      [paymentId]: {
        id: paymentId,
        kind: 'section',
        role: 'payment',
        parentId: pageId,
        children: [summaryId, pixBlockId, cardFormId],
        props: {
          width: { base: '480px', mobile: '100%' },
          display: { base: 'flex' },
          flexDirection: { base: 'column' },
          gap: { base: 20 },
          padding: { base: 32, mobile: 20 },
          bgColor: { base: 'rgba(15,23,42,0.6)' },
          borderRadius: { base: 20 },
          shadow: { base: 'lg' },
        },
        label: 'Pagamento',
      },
      [summaryId]: {
        id: summaryId,
        kind: 'element',
        component: 'summary',
        parentId: paymentId,
        children: [],
        content: 'R$ 197,00',
        props: {
          fontSize: { base: 28 },
          fontWeight: { base: 900 },
          textColor: { base: '#e5e7eb' },
        },
        meta: { originalPrice: 'R$ 394,00', label: 'Total a pagar' },
      },
      [pixBlockId]: {
        id: pixBlockId,
        kind: 'element',
        component: 'pix-block',
        parentId: paymentId,
        children: [],
        props: {
          padding: { base: 20 },
          bgColor: { base: '#022c22' },
          borderRadius: { base: 16 },
        },
      },
      [cardFormId]: {
        id: cardFormId,
        kind: 'element',
        component: 'card-form',
        parentId: paymentId,
        children: [],
        props: {
          padding: { base: 20 },
          bgColor: { base: 'rgba(15,23,42,0.8)' },
          borderRadius: { base: 16 },
        },
      },
      [trustId]: {
        id: trustId,
        kind: 'section',
        role: 'trust',
        parentId: pageId,
        children: [trustBadge1, trustBadge2, trustBadge3, footerText],
        props: {
          width: { base: '480px', mobile: '100%' },
          display: { base: 'flex' },
          flexDirection: { base: 'row', mobile: 'column' },
          justifyContent: { base: 'center' },
          alignItems: { base: 'center' },
          gap: { base: 20 },
          padding: { base: 32, mobile: 20 },
        },
        label: 'Trust',
      },
      [trustBadge1]: {
        id: trustBadge1,
        kind: 'element',
        component: 'badge',
        parentId: trustId,
        children: [],
        content: '🔒 SSL Seguro',
        props: {
          fontSize: { base: 11 },
          fontWeight: { base: 700 },
          textColor: { base: '#64748b' },
          bgColor: { base: 'rgba(100,116,139,0.08)' },
          padding: { base: 8 },
          borderRadius: { base: 8 },
        },
      },
      [trustBadge2]: {
        id: trustBadge2,
        kind: 'element',
        component: 'badge',
        parentId: trustId,
        children: [],
        content: '✅ Garantia 7 dias',
        props: {
          fontSize: { base: 11 },
          fontWeight: { base: 700 },
          textColor: { base: '#64748b' },
          bgColor: { base: 'rgba(100,116,139,0.08)' },
          padding: { base: 8 },
          borderRadius: { base: 8 },
        },
      },
      [trustBadge3]: {
        id: trustBadge3,
        kind: 'element',
        component: 'badge',
        parentId: trustId,
        children: [],
        content: '⚡ Acesso imediato',
        props: {
          fontSize: { base: 11 },
          fontWeight: { base: 700 },
          textColor: { base: '#64748b' },
          bgColor: { base: 'rgba(100,116,139,0.08)' },
          padding: { base: 8 },
          borderRadius: { base: 8 },
        },
      },
      [footerText]: {
        id: footerText,
        kind: 'element',
        component: 'text',
        parentId: trustId,
        children: [],
        content: 'Powered by Basileia Checkout Studio',
        props: {
          fontSize: { base: 10 },
          textColor: { base: '#334155' },
          padding: { base: 12 },
        },
      },
    },
  };
}

export const COMPONENT_PALETTE: {
  component: ElementComponent;
  label: string;
  icon: string;
}[] = [
  { component: 'heading', label: 'Título', icon: 'H' },
  { component: 'text', label: 'Texto', icon: 'T' },
  { component: 'button', label: 'Botão', icon: '▶' },
  { component: 'image', label: 'Imagem', icon: '🖼' },
  { component: 'divider', label: 'Divisor', icon: '—' },
  { component: 'badge', label: 'Badge', icon: '◈' },
  { component: 'sticker', label: 'Sticker', icon: '🏷' },
  { component: 'timer', label: 'Timer', icon: '⏱' },
  { component: 'pix-block', label: 'Pix', icon: '◻' },
  { component: 'card-form', label: 'Cartão', icon: '💳' },
  { component: 'summary', label: 'Resumo', icon: '∑' },
  { component: 'input', label: 'Input', icon: '⌨' },
];
