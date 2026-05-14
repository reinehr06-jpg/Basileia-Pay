import type { Scene, Node, NodeProps } from './types';

export type SceneAction =
  | { type: 'ADD_NODE'; parentId: string; node: Node; index?: number }
  | { type: 'MOVE_NODE'; nodeId: string; newParentId: string; index?: number }
  | { type: 'UPDATE_NODE_PROPS'; nodeId: string; props: Partial<NodeProps> }
  | { type: 'UPDATE_NODE_CONTENT'; nodeId: string; content: string }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'DUPLICATE_NODE'; nodeId: string }
  | { type: 'LOAD_SCENE'; scene: Scene };

let _counter = 0;
export function genId(prefix = 'n'): string {
  return `${prefix}_${Date.now().toString(36)}_${(++_counter).toString(36)}`;
}

export function sceneReducer(scene: Scene, action: SceneAction): Scene {
  switch (action.type) {
    case 'LOAD_SCENE':
      return action.scene;

    case 'ADD_NODE': {
      const nodes = { ...scene.nodes, [action.node.id]: action.node };
      const parent = nodes[action.parentId];
      if (!parent) return scene;
      const children = [...parent.children];
      const index = action.index ?? children.length;
      children.splice(index, 0, action.node.id);
      nodes[parent.id] = { ...parent, children };
      return { ...scene, nodes };
    }

    case 'MOVE_NODE': {
      const nodes = { ...scene.nodes };
      const node = nodes[action.nodeId];
      if (!node) return scene;

      if (node.parentId && nodes[node.parentId]) {
        const oldParent = nodes[node.parentId];
        nodes[node.parentId] = {
          ...oldParent,
          children: oldParent.children.filter((id) => id !== node.id),
        };
      }

      const newParent = nodes[action.newParentId];
      if (!newParent) return scene;
      const children = [...newParent.children];
      const index = action.index ?? children.length;
      children.splice(index, 0, node.id);
      nodes[newParent.id] = { ...newParent, children };
      nodes[node.id] = { ...node, parentId: newParent.id };

      return { ...scene, nodes };
    }

    case 'UPDATE_NODE_PROPS': {
      const node = scene.nodes[action.nodeId];
      if (!node) return scene;
      return {
        ...scene,
        nodes: {
          ...scene.nodes,
          [node.id]: {
            ...node,
            props: deepMergeProps(node.props, action.props),
          },
        },
      };
    }

    case 'UPDATE_NODE_CONTENT': {
      const node = scene.nodes[action.nodeId];
      if (!node || node.kind !== 'element') return scene;
      return {
        ...scene,
        nodes: {
          ...scene.nodes,
          [node.id]: { ...node, content: action.content },
        },
      };
    }

    case 'DELETE_NODE': {
      const nodes = { ...scene.nodes };
      const node = nodes[action.nodeId];
      if (!node) return scene;

      const stack = [node.id];
      while (stack.length) {
        const id = stack.pop()!;
        const n = nodes[id];
        if (!n) continue;
        stack.push(...n.children);
        delete nodes[id];
      }

      if (node.parentId && nodes[node.parentId]) {
        const p = nodes[node.parentId];
        nodes[node.parentId] = {
          ...p,
          children: p.children.filter((id) => id !== node.id),
        };
      }
      return { ...scene, nodes };
    }

    case 'DUPLICATE_NODE': {
      const orig = scene.nodes[action.nodeId];
      if (!orig || !orig.parentId) return scene;
      const clone = deepCloneNode(orig, scene.nodes);
      const nodes = { ...scene.nodes };

      const addAll = (n: Node) => {
        nodes[n.id] = n;
        for (const cid of n.children) {
          const child = nodes[cid] ?? clone.map[cid];
          if (child) addAll(child);
        }
      };
      addAll(clone.root);

      const parent = nodes[orig.parentId];
      if (parent) {
        const idx = parent.children.indexOf(orig.id);
        const children = [...parent.children];
        children.splice(idx + 1, 0, clone.root.id);
        nodes[parent.id] = { ...parent, children };
      }

      return { ...scene, nodes };
    }

    default:
      return scene;
  }
}

function deepMergeProps(base: NodeProps, patch: Partial<NodeProps>): NodeProps {
  const merged: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const value = (patch as Record<string, unknown>)[key];
    if (value && typeof value === 'object' && 'base' in (value as object)) {
      merged[key] = {
        ...((base as Record<string, unknown>)[key] as object),
        ...(value as object),
      };
    } else {
      merged[key] = value;
    }
  }
  return merged as NodeProps;
}

function deepCloneNode(
  node: Node,
  allNodes: Record<string, Node>
): { root: Node; map: Record<string, Node> } {
  const map: Record<string, Node> = {};
  const clone = (n: Node, parentId?: string): Node => {
    const newId = genId(n.kind[0]);
    const newChildren: string[] = [];
    for (const cid of n.children) {
      const child = allNodes[cid];
      if (child) {
        const cloned = clone(child, newId);
        newChildren.push(cloned.id);
      }
    }
    const cloned: Node = {
      ...n,
      id: newId,
      parentId,
      children: newChildren,
    } as Node;
    map[newId] = cloned;
    return cloned;
  };

  const root = clone(node, node.parentId);
  return { root, map };
}
