import type { BreakpointId } from '../core/types';

type StudioMode = 'builder' | 'preview' | 'split';

interface ToolbarProps {
  mode: StudioMode;
  onModeChange(m: StudioMode): void;
  breakpoint: BreakpointId;
  onBreakpointChange(bp: BreakpointId): void;
  onExportJSON(): void;
}

const modes: { id: StudioMode; icon: string; label: string }[] = [
  { id: 'builder', icon: '✏️', label: 'Editor' },
  { id: 'split', icon: '◧', label: 'Split' },
  { id: 'preview', icon: '▶', label: 'Preview' },
];

const breakpoints: { id: BreakpointId; icon: string; label: string; width: string }[] = [
  { id: 'desktop', icon: '🖥', label: 'Desktop', width: '1200' },
  { id: 'tablet', icon: '📱', label: 'Tablet', width: '768' },
  { id: 'mobile', icon: '📲', label: 'Mobile', width: '390' },
];

export function Toolbar({ mode, onModeChange, breakpoint, onBreakpointChange, onExportJSON }: ToolbarProps) {
  return (
    <header className="studio-toolbar">
      <div className="toolbar-left">
        <div className="toolbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Basileia Studio</span>
        </div>
      </div>

      <div className="toolbar-center">
        <div className="toolbar-segment">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`segment-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => onModeChange(m.id)}
              title={m.label}
            >
              <span className="segment-icon">{m.icon}</span>
              <span className="segment-label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-segment">
          {breakpoints.map((bp) => (
            <button
              key={bp.id}
              className={`segment-btn ${breakpoint === bp.id ? 'active' : ''}`}
              onClick={() => onBreakpointChange(bp.id)}
              title={`${bp.label} (${bp.width}px)`}
            >
              <span className="segment-icon">{bp.icon}</span>
              <span className="segment-label">{bp.width}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-action-btn" onClick={onExportJSON} title="Export JSON">
          ⬇ JSON
        </button>
        <button className="toolbar-publish-btn" title="Publicar checkout">
          Publicar
        </button>
      </div>
    </header>
  );
}
