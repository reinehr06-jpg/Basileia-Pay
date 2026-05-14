import type { CSSProperties } from 'react';
import type { BreakpointId, NodeProps, ResponsiveValue } from './types';

export function resolveResponsive<T>(
  value: ResponsiveValue<T> | undefined,
  bp: BreakpointId
): T | undefined {
  if (!value) return undefined;
  if (bp === 'mobile') return value.mobile ?? value.tablet ?? value.base;
  if (bp === 'tablet') return value.tablet ?? value.base;
  return value.base;
}

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 3px rgba(15,23,42,0.12)',
  md: '0 4px 12px rgba(15,23,42,0.16)',
  lg: '0 10px 30px rgba(15,23,42,0.22)',
  glow: '0 0 24px rgba(99,102,241,0.35)',
};

export function propsToStyle(
  props: NodeProps,
  breakpoint: BreakpointId
): CSSProperties {
  const css: CSSProperties = {};

  const r = <T,>(v: ResponsiveValue<T> | undefined) =>
    resolveResponsive(v, breakpoint);

  const w = r(props.width);
  if (w !== undefined) css.width = w;
  const h = r(props.height);
  if (h !== undefined) css.height = h;
  const d = r(props.display);
  if (d !== undefined) css.display = d;
  const fd = r(props.flexDirection);
  if (fd !== undefined) css.flexDirection = fd;
  const jc = r(props.justifyContent);
  if (jc !== undefined) css.justifyContent = jc;
  const ai = r(props.alignItems);
  if (ai !== undefined) css.alignItems = ai;

  const gap = r(props.gap);
  if (gap !== undefined) css.gap = gap;
  const pad = r(props.padding);
  if (pad !== undefined) css.padding = pad;
  const mar = r(props.margin);
  if (mar !== undefined) css.margin = mar;

  const bg = r(props.bgColor);
  if (bg !== undefined) css.backgroundColor = bg;
  const tc = r(props.textColor);
  if (tc !== undefined) css.color = tc;
  const fs = r(props.fontSize);
  if (fs !== undefined) css.fontSize = fs;
  const fw = r(props.fontWeight);
  if (fw !== undefined) css.fontWeight = fw;
  const br = r(props.borderRadius);
  if (br !== undefined) css.borderRadius = br;
  const op = r(props.opacity);
  if (op !== undefined) css.opacity = op;

  const sh = r(props.shadow);
  if (sh) css.boxShadow = SHADOW_MAP[sh] ?? 'none';

  return css;
}

export const BREAKPOINT_WIDTHS: Record<BreakpointId, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 390,
};
