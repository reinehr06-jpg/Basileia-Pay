// ─── Basileia Checkout Studio — Scene Schema ────────────────────────────

export type BreakpointId = 'desktop' | 'tablet' | 'mobile';

export type NodeKind = 'page' | 'section' | 'stack' | 'element';

export type ElementComponent =
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'input'
  | 'divider'
  | 'sticker'
  | 'pix-block'
  | 'card-form'
  | 'timer'
  | 'summary'
  | 'badge'
  | 'icon';

export interface ResponsiveValue<T> {
  base: T;
  tablet?: T;
  mobile?: T;
}

export interface LayoutProps {
  width?: ResponsiveValue<string>;
  height?: ResponsiveValue<string>;
  display?: ResponsiveValue<'block' | 'flex' | 'none'>;
  flexDirection?: ResponsiveValue<'row' | 'column'>;
  justifyContent?: ResponsiveValue<'flex-start' | 'center' | 'space-between' | 'flex-end'>;
  alignItems?: ResponsiveValue<'flex-start' | 'center' | 'stretch' | 'flex-end'>;
  gap?: ResponsiveValue<number>;
  padding?: ResponsiveValue<number>;
  margin?: ResponsiveValue<number>;
}

export interface StyleProps {
  bgColor?: ResponsiveValue<string>;
  textColor?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<number>;
  fontWeight?: ResponsiveValue<number>;
  borderRadius?: ResponsiveValue<number>;
  shadow?: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'glow'>;
  opacity?: ResponsiveValue<number>;
}

export type NodeProps = LayoutProps & StyleProps;

export interface BaseNode {
  id: string;
  kind: NodeKind;
  parentId?: string;
  children: string[];
  props: NodeProps;
  locked?: boolean;
  label?: string;
}

export interface PageNode extends BaseNode {
  kind: 'page';
  name: string;
}

export interface SectionNode extends BaseNode {
  kind: 'section';
  role?: 'hero' | 'offer' | 'trust' | 'payment' | 'faq' | 'footer' | 'custom';
}

export interface StackNode extends BaseNode {
  kind: 'stack';
  axis: 'horizontal' | 'vertical';
}

export interface ElementNode extends BaseNode {
  kind: 'element';
  component: ElementComponent;
  content?: string;
  dataKey?: string;
  meta?: Record<string, unknown>;
}

export type Node = PageNode | SectionNode | StackNode | ElementNode;

export interface Scene {
  rootId: string;
  nodes: Record<string, Node>;
}
