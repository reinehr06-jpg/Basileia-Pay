import { describe, it, expect } from 'vitest';
import { sceneReducer, genId } from '../core/sceneReducer';
import { createDefaultScene } from '../core/initialScene';
import type { ElementNode } from '../core/types';

describe('sceneReducer', () => {
  it('ADD_NODE adds a node to the scene', () => {
    const scene = createDefaultScene();
    const nodeId = genId();
    const newNode: ElementNode = {
      id: nodeId,
      kind: 'element',
      component: 'text',
      props: {},
      children: [],
      content: 'Hello World',
    };

    const updated = sceneReducer(scene, {
      type: 'ADD_NODE',
      node: newNode,
      parentId: scene.rootId,
    });

    expect(updated.nodes[nodeId]).toBeDefined();
    expect(updated.nodes[scene.rootId]?.children).toContain(nodeId);
    expect(updated.nodes[nodeId]?.content).toBe('Hello World');
  });
});
