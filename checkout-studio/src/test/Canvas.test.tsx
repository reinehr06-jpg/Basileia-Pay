import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '../editor/Canvas';
import { createDefaultScene } from '../core/initialScene';
import React from 'react';

describe('Canvas', () => {
  it('renders without crashing', () => {
    const scene = createDefaultScene();
    const onSelect = vi.fn();
    const onMove = vi.fn();
    
    const { container } = render(
      <Canvas 
        scene={scene} 
        breakpoint="desktop" 
        onSelect={onSelect}
        onMove={onMove}
      />
    );
    
    expect(container.querySelector('.canvas-viewport')).toBeInTheDocument();
    expect(container.querySelector('.canvas-artboard')).toBeInTheDocument();
  });
});
