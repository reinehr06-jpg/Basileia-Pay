import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PropsPanel } from '../editor/PropsPanel';
import { createDefaultScene } from '../core/initialScene';
import React from 'react';

describe('PropsPanel', () => {
  it('renders empty state when no node is selected', () => {
    const scene = createDefaultScene();
    const dispatch = vi.fn();
    
    render(
      <PropsPanel 
        scene={scene} 
        breakpoint="desktop" 
        dispatch={dispatch} 
      />
    );
    
    expect(screen.getByText(/Selecione um elemento/i)).toBeInTheDocument();
  });

  it('renders properties when a node is selected', () => {
    const scene = createDefaultScene();
    const dispatch = vi.fn();
    
    render(
      <PropsPanel 
        scene={scene} 
        selectedId={scene.rootId}
        breakpoint="desktop" 
        dispatch={dispatch} 
      />
    );
    
    expect(screen.getByText('page')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });
});
