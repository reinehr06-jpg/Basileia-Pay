// Basileia Undo/Redo Hook
import { useReducer, useCallback } from 'react';
import type { Scene } from './types';
import { sceneReducer, type SceneAction, genId } from './sceneReducer';

import { CONFIG } from '../config';

interface HistoryState {
  past: Scene[];
  present: Scene;
  future: Scene[];
}

type HistoryAction = { type: 'DO'; action: SceneAction } | { type: 'UNDO' } | { type: 'REDO' } | { type: 'SET_SCENE'; scene: Scene };

function createInitialHistory(initialScene: Scene): HistoryState {
  return { past: [], present: initialScene, future: [] };
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'SET_SCENE':
      return { ...state, present: action.scene, past: [], future: [] };
    case 'DO': {
      const newPresent = sceneReducer(state.present, action.action);
      if (newPresent === state.present) return state;
      return { past: [...state.past.slice(-(CONFIG.UNDO_LIMIT - 1)), state.present], present: newPresent, future: [] };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return { past: [...state.past, state.present], present: next, future: state.future.slice(1) };
    }
    default:
      return state;
  }
}

export function useUndoRedo(initialScene: Scene) {
  const [history, dispatch] = useReducer(historyReducer, initialScene, createInitialHistory);

  const doAction = useCallback((action: SceneAction) => {
    dispatch({ type: 'DO', action });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const setScene = useCallback((scene: Scene) => dispatch({ type: 'SET_SCENE', scene }), []);

  return {
    scene: history.present,
    dispatch: doAction,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    setScene,
    historyLength: history.past.length,
  };
}
