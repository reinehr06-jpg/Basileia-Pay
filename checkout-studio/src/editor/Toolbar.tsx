import type { BreakpointId } from '../core/types';

interface ToolbarProps {
  mode: string;
  onModeChange(mode: string): void;
  breakpoint: BreakpointId;
  onBreakpointChange(bp: BreakpointId): void;
  onExportJSON(): void;
  onUndo?(): void;
  onRedo?(): void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Toolbar({ mode, onModeChange, breakpoint, onBreakpointChange, onExportJSON, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  return (
    <div className="studio-toolbar">
      <div className="toolbar-left">
        <div className="toolbar-logo">
          <div className="logo-icon">B</div>
          <span className="logo-text">Basileia Studio</span>
        </div>
      </div>

      <div className="toolbar-center">
        <div className="mode-switcher">
          {['builder', 'split', 'preview'].map(m => (
            <button key={m} className={mode === m ? 'active' : ''} onClick={() => onModeChange(m)} aria-label={`Modo ${m}`} tabIndex={0}>
              {m === 'builder' ? 'Editor' : m === 'split' ? 'Split' : 'Preview'}
            </button>
          ))}
        </div>

        <div className="breakpoint-switcher">
          {([['desktop', 'D'], ['tablet', 'T'], ['mobile', 'M']] as [BreakpointId, string][]).map(([id, label]) => (
            <button key={id} className={breakpoint === id ? 'active' : ''} onClick={() => onBreakpointChange(id)} aria-label={`Visualização ${id}`} tabIndex={0}>
              {label}
            </button>
          ))}
        </div>

        <div className="undo-redo">
          <button onClick={onUndo} disabled={!canUndo} title="Undo" aria-label="Desfazer" tabIndex={0}>Undo</button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo" aria-label="Refazer" tabIndex={0}>Redo</button>
        </div>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-btn" onClick={onExportJSON} aria-label="Exportar JSON" tabIndex={0}>Export JSON</button>
      </div>
    </div>
  );
}
