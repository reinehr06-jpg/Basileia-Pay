import type { Scene, Node, ElementNode } from '../core/types';
import type { SceneAction } from '../core/sceneReducer';

interface LayersPanelProps {
  scene: Scene;
  selectedId?: string;
  onSelect(id: string): void;
  dispatch(action: SceneAction): void;
}

export function LayersPanel({ scene, selectedId, onSelect }: LayersPanelProps) {
  const root = scene.nodes[scene.rootId];
  if (!root) return null;

  return (
    <aside className="layers-panel">
      <div className="layers-header">
        <span className="layers-title">Camadas</span>
      </div>
      <div className="layers-tree">
        <LayerItem node={root} scene={scene} selectedId={selectedId} onSelect={onSelect} depth={0} />
      </div>
    </aside>
  );
}

function LayerItem({
  node,
  scene,
  selectedId,
  onSelect,
  depth,
}: {
  node: Node;
  scene: Scene;
  selectedId?: string;
  onSelect(id: string): void;
  depth: number;
}) {
  const isSelected = node.id === selectedId;
  const isElement = node.kind === 'element';

  const kindIcon: Record<string, string> = {
    page: '📄',
    section: '▦',
    stack: '☰',
    element: '◇',
  };

  const componentLabel = isElement ? (node as ElementNode).component : '';
  const label = node.label || (isElement ? componentLabel : node.kind);

  return (
    <>
      <div
        className={`layer-item ${isSelected ? 'layer-selected' : ''}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => onSelect(node.id)}
      >
        <span className="layer-icon">{kindIcon[node.kind] ?? '◇'}</span>
        <span className="layer-label">{label}</span>
        {node.locked && <span className="layer-lock">🔒</span>}
      </div>
      {node.children.map((childId) => {
        const child = scene.nodes[childId];
        if (!child) return null;
        return (
          <LayerItem
            key={childId}
            node={child}
            scene={scene}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={depth + 1}
          />
        );
      })}
    </>
  );
}
