import { useState } from 'react';
import type { Scene, Node, NodeProps, ElementNode, BreakpointId, ResponsiveValue } from '../core/types';
import type { SceneAction } from '../core/sceneReducer';

interface PropsPanelProps {
  scene: Scene;
  selectedId?: string;
  breakpoint: BreakpointId;
  dispatch(action: SceneAction): void;
}

export function PropsPanel({ scene, selectedId, breakpoint, dispatch }: PropsPanelProps) {
  if (!selectedId) {
    return (
      <aside className="props-panel">
        <div className="props-empty">
          <span className="props-empty-icon">◇</span>
          <p>Selecione um elemento no canvas</p>
        </div>
      </aside>
    );
  }

  const node = scene.nodes[selectedId];
  if (!node) return null;

  return (
    <aside className="props-panel">
      <div className="props-header">
        <span className="props-kind">{node.kind}</span>
        {node.kind === 'element' && (
          <span className="props-component">{(node as ElementNode).component}</span>
        )}
      </div>

      {node.kind === 'element' && <ContentEditor node={node as ElementNode} dispatch={dispatch} />}

      <LayoutSection node={node} breakpoint={breakpoint} dispatch={dispatch} />
      <StyleSection node={node} breakpoint={breakpoint} dispatch={dispatch} />

      <div className="props-actions">
        <button
          className="props-action-btn props-duplicate"
          onClick={() => dispatch({ type: 'DUPLICATE_NODE', nodeId: node.id })}
        >
          Duplicar
        </button>
        <button
          className="props-action-btn props-delete"
          onClick={() => dispatch({ type: 'DELETE_NODE', nodeId: node.id })}
        >
          Excluir
        </button>
      </div>
    </aside>
  );
}

function ContentEditor({ node, dispatch }: { node: ElementNode; dispatch(a: SceneAction): void }) {
  return (
    <div className="props-section">
      <h4 className="props-section-title">Conteúdo</h4>
      <input
        className="props-input"
        value={node.content ?? ''}
        onChange={(e) =>
          dispatch({ type: 'UPDATE_NODE_CONTENT', nodeId: node.id, content: e.target.value })
        }
        placeholder="Texto..."
      />
    </div>
  );
}

function LayoutSection({
  node,
  breakpoint,
  dispatch,
}: {
  node: Node;
  breakpoint: BreakpointId;
  dispatch(a: SceneAction): void;
}) {
  const update = (key: keyof NodeProps, value: string | number) => {
    const rv: ResponsiveValue<typeof value> = {
      ...((node.props[key] as ResponsiveValue<typeof value>) ?? { base: value }),
    };
    if (breakpoint === 'desktop') rv.base = value;
    else if (breakpoint === 'tablet') rv.tablet = value;
    else rv.mobile = value;
    dispatch({
      type: 'UPDATE_NODE_PROPS',
      nodeId: node.id,
      props: { [key]: rv } as Partial<NodeProps>,
    });
  };

  const getPropValue = (key: keyof NodeProps): string => {
    const rv = node.props[key] as ResponsiveValue<unknown> | undefined;
    if (!rv) return '';
    if (breakpoint === 'mobile') return String(rv.mobile ?? rv.tablet ?? rv.base ?? '');
    if (breakpoint === 'tablet') return String(rv.tablet ?? rv.base ?? '');
    return String(rv.base ?? '');
  };

  return (
    <div className="props-section">
      <h4 className="props-section-title">Layout <span className="props-bp-tag">{breakpoint}</span></h4>
      <div className="props-grid">
        <PropField label="Width" value={getPropValue('width')} onChange={(v) => update('width', v)} />
        <PropField label="Height" value={getPropValue('height')} onChange={(v) => update('height', v)} />
        <PropField label="Padding" value={getPropValue('padding')} onChange={(v) => update('padding', Number(v) || 0)} />
        <PropField label="Gap" value={getPropValue('gap')} onChange={(v) => update('gap', Number(v) || 0)} />
      </div>
      <div className="props-grid">
        <PropSelect
          label="Display"
          value={getPropValue('display')}
          options={['block', 'flex', 'none']}
          onChange={(v) => update('display', v)}
        />
        <PropSelect
          label="Direction"
          value={getPropValue('flexDirection')}
          options={['row', 'column']}
          onChange={(v) => update('flexDirection', v)}
        />
      </div>
      <div className="props-grid">
        <PropSelect
          label="Justify"
          value={getPropValue('justifyContent')}
          options={['flex-start', 'center', 'space-between', 'flex-end']}
          onChange={(v) => update('justifyContent', v)}
        />
        <PropSelect
          label="Align"
          value={getPropValue('alignItems')}
          options={['flex-start', 'center', 'stretch', 'flex-end']}
          onChange={(v) => update('alignItems', v)}
        />
      </div>
    </div>
  );
}

function StyleSection({
  node,
  breakpoint,
  dispatch,
}: {
  node: Node;
  breakpoint: BreakpointId;
  dispatch(a: SceneAction): void;
}) {
  const update = (key: keyof NodeProps, value: string | number) => {
    const rv: ResponsiveValue<typeof value> = {
      ...((node.props[key] as ResponsiveValue<typeof value>) ?? { base: value }),
    };
    if (breakpoint === 'desktop') rv.base = value;
    else if (breakpoint === 'tablet') rv.tablet = value;
    else rv.mobile = value;
    dispatch({
      type: 'UPDATE_NODE_PROPS',
      nodeId: node.id,
      props: { [key]: rv } as Partial<NodeProps>,
    });
  };

  const getPropValue = (key: keyof NodeProps): string => {
    const rv = node.props[key] as ResponsiveValue<unknown> | undefined;
    if (!rv) return '';
    if (breakpoint === 'mobile') return String(rv.mobile ?? rv.tablet ?? rv.base ?? '');
    if (breakpoint === 'tablet') return String(rv.tablet ?? rv.base ?? '');
    return String(rv.base ?? '');
  };

  return (
    <div className="props-section">
      <h4 className="props-section-title">Estilo</h4>
      <div className="props-grid">
        <PropColor label="BG" value={getPropValue('bgColor')} onChange={(v) => update('bgColor', v)} />
        <PropColor label="Texto" value={getPropValue('textColor')} onChange={(v) => update('textColor', v)} />
      </div>
      <div className="props-grid">
        <PropField label="Font Size" value={getPropValue('fontSize')} onChange={(v) => update('fontSize', Number(v) || 14)} />
        <PropField label="Radius" value={getPropValue('borderRadius')} onChange={(v) => update('borderRadius', Number(v) || 0)} />
      </div>
      <PropSelect
        label="Shadow"
        value={getPropValue('shadow')}
        options={['none', 'sm', 'md', 'lg', 'glow']}
        onChange={(v) => update('shadow', v)}
      />
    </div>
  );
}

// ── Tiny form primitives ──────────────────────────────────────────────────

function PropField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange(v: string): void;
}) {
  return (
    <label className="prop-field">
      <span className="prop-label">{label}</span>
      <input className="props-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function PropSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange(v: string): void;
}) {
  return (
    <label className="prop-field">
      <span className="prop-label">{label}</span>
      <select className="props-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function PropColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange(v: string): void;
}) {
  const [open, setOpen] = useState(false);
  const presets = [
    '#020617', '#0f172a', '#1e1b4b', '#4f46e5', '#6366f1',
    '#a78bfa', '#f97316', '#10b981', '#022c22', '#f1f5f9',
    '#e5e7eb', '#94a3b8', '#64748b', '#334155', '#ffffff',
  ];

  return (
    <label className="prop-field prop-color-field">
      <span className="prop-label">{label}</span>
      <div className="prop-color-row">
        <div
          className="prop-color-swatch"
          style={{ backgroundColor: value || '#000' }}
          onClick={() => setOpen(!open)}
        />
        <input
          className="props-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      {open && (
        <div className="prop-color-presets">
          {presets.map((c) => (
            <div
              key={c}
              className="prop-color-preset"
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </label>
  );
}
