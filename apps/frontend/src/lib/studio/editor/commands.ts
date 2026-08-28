import { setStudioState, getStudioState } from './store';
import { Block, Device, EditorHistoryItem, CheckoutSchema, EditorState } from '../schema/types';

/**
 * Registra o estado atual no history stack antes de aplicar uma mutação,
 * permitindo undo/redo.
 */
function pushHistory(label: string, beforeSchema: CheckoutSchema, afterSchema: CheckoutSchema) {
  setStudioState((state) => {
    // Se o historyIndex não estiver no final (ex: desfez e depois fez uma nova ação)
    // nós cortamos o array (removemos o futuro descartado)
    if (state.historyIndex < state.historyStack.length - 1) {
      state.historyStack = state.historyStack.slice(0, state.historyIndex + 1);
    }

    const historyItem: EditorHistoryItem = {
      id: crypto.randomUUID(),
      command: label,
      label,
      before: beforeSchema,
      after: afterSchema,
      userId: 'user', // idealmente pega do auth
      createdAt: new Date().toISOString(),
    };

    state.historyStack.push(historyItem);
    state.historyIndex = state.historyStack.length - 1;
    state.unsavedChanges = true;
  });
}

// ---------------------------------------------------------
// Commands
// ---------------------------------------------------------

export const updateCheckoutName = (name: string) => {
  const currentState = getStudioState();
  const before = JSON.parse(JSON.stringify(currentState.schema));
  
  setStudioState((state) => {
    state.schema.name = name;
  });

  const after = JSON.parse(JSON.stringify(getStudioState().schema));
  pushHistory('Renomeou o checkout', before, after);
};

export const updateBlockContent = (blockId: string, content: Record<string, any>) => {
  const currentState = getStudioState();
  const before = JSON.parse(JSON.stringify(currentState.schema));

  setStudioState((state) => {
    const block = state.schema.blocks.find(b => b.id === blockId);
    if (block) {
      block.content = { ...block.content, ...content };
    }
  });

  const after = JSON.parse(JSON.stringify(getStudioState().schema));
  pushHistory('Atualizou conteúdo do bloco', before, after);
};

export const selectDevice = (device: Device) => {
  setStudioState((state) => {
    state.selectedDevice = device;
    if (device === 'mobile') state.devicePreset = 'iphone-15';
    if (device === 'tablet') state.devicePreset = 'ipad';
    if (device === 'desktop') state.devicePreset = 'desktop-full';
  });
};

export const selectDevicePreset = (preset: string) => {
  setStudioState((state) => {
    state.devicePreset = preset;
  });
};

export const selectBlock = (blockId: string | null) => {
  setStudioState((state) => {
    state.selectedBlockId = blockId;
    if (blockId && state.selectedTab === 'advanced' && state.mode === 'simple') {
      state.selectedTab = 'content';
    }
  });
};

export const setEditorMode = (mode: 'simple' | 'advanced') => {
  setStudioState((state) => {
    state.mode = mode;
    if (mode === 'simple' && state.selectedTab === 'advanced') {
      state.selectedTab = 'content';
    }
  });
};

export const setZoom = (zoom: number) => {
  setStudioState((state) => {
    state.zoom = Math.max(50, Math.min(zoom, 150));
  });
};

export const undo = () => {
  const state = getStudioState();
  if (state.historyIndex >= 0) {
    const item = state.historyStack[state.historyIndex];
    setStudioState((s) => {
      s.schema = { ...s.schema, ...item.before } as CheckoutSchema;
      s.historyIndex -= 1;
      s.unsavedChanges = true;
    });
  }
};

export const redo = () => {
  const state = getStudioState();
  if (state.historyIndex < state.historyStack.length - 1) {
    const item = state.historyStack[state.historyIndex + 1];
    setStudioState((s) => {
      s.schema = { ...s.schema, ...item.after } as CheckoutSchema;
      s.historyIndex += 1;
      s.unsavedChanges = true;
    });
  }
};

export const loadSchemaFromServer = (schema: CheckoutSchema, checkoutId: string, versionId: string) => {
  setStudioState((state) => {
    state.schema = schema;
    state.checkoutId = checkoutId;
    state.versionId = versionId;
    state.unsavedChanges = false;
    state.historyStack = [];
    state.historyIndex = -1;
  });
};

export const addBlock = (type: string, name: string, content: Record<string, any> = {}) => {
  const currentState = getStudioState();
  const before = JSON.parse(JSON.stringify(currentState.schema));

  setStudioState((state) => {
    const newBlock: Block = {
      id: `${type}_${Date.now()}`,
      type,
      name,
      order: state.schema.blocks.length,
      locked: false,
      visible: true,
      required: false,
      content,
    };
    state.schema.blocks.push(newBlock);
    state.selectedBlockId = newBlock.id;
  });

  const after = JSON.parse(JSON.stringify(getStudioState().schema));
  pushHistory('Adicionou bloco', before, after);
};

export const removeBlock = (blockId: string) => {
  const currentState = getStudioState();
  const before = JSON.parse(JSON.stringify(currentState.schema));

  setStudioState((state) => {
    state.schema.blocks = state.schema.blocks.filter((b) => b.id !== blockId);
    if (state.selectedBlockId === blockId) {
      state.selectedBlockId = null;
    }
  });

  const after = JSON.parse(JSON.stringify(getStudioState().schema));
  pushHistory('Removeu bloco', before, after);
};

export const updateBrandTokens = (tokens: Partial<CheckoutSchema['brand_tokens']>) => {
  const currentState = getStudioState();
  const before = JSON.parse(JSON.stringify(currentState.schema));

  setStudioState((state) => {
    state.schema.brand_tokens = { ...state.schema.brand_tokens, ...tokens };
  });

  const after = JSON.parse(JSON.stringify(getStudioState().schema));
  pushHistory('Atualizou design global', before, after);
};

export const setSaveStatus = (status: EditorState['saveStatus']) => {
  setStudioState((state) => {
    state.saveStatus = status;
    if (status === 'saved') {
      state.unsavedChanges = false;
      state.lastSavedAt = new Date().toISOString();
    }
  });
};

export const reorderBlocks = (oldIndex: number, newIndex: number) => {
  const currentState = getStudioState();
  const before = JSON.parse(JSON.stringify(currentState.schema));

  setStudioState((state) => {
    // ArrayMove simples: move o item de oldIndex para newIndex
    const blocks = state.schema.blocks;
    if (newIndex >= 0 && newIndex < blocks.length && oldIndex >= 0 && oldIndex < blocks.length) {
      const item = blocks.splice(oldIndex, 1)[0];
      blocks.splice(newIndex, 0, item);
      
      // Opcional: Recalcular a prop 'order' internamente, embora a ordem do array seja a fonte da verdade
      blocks.forEach((b, idx) => { b.order = idx; });
    }
  });

  const after = JSON.parse(JSON.stringify(getStudioState().schema));
  pushHistory('Reordenou blocos', before, after);
};


