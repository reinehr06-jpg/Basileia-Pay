'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { CheckoutConfig, DEFAULT_CONFIG } from '@/types/checkout-config'

interface EditorState {
  config: CheckoutConfig
  isDirty: boolean
  isSaving: boolean
  activePanel: string
  configId: number | null
  configName: string
}

const INITIAL_STATE: EditorState = {
  config: { ...DEFAULT_CONFIG },
  isDirty: false,
  isSaving: false,
  activePanel: 'brand',
  configId: null,
  configName: 'Novo Checkout',
}

type Action =
  | { type: 'SET_FIELD'; key: keyof CheckoutConfig; value: unknown }
  | { type: 'SET_NESTED'; path: string; value: unknown }
  | { type: 'LOAD_CONFIG'; id: number; name: string; config: CheckoutConfig }
  | { type: 'RESET' }
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'SET_PANEL'; panel: string }
  | { type: 'SET_SAVED'; id: number }
  | { type: 'SET_NAME'; name: string }

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const result = { ...obj }
  let cur = result
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] as Record<string, unknown>) }
    cur = cur[keys[i]] as Record<string, unknown>
  }
  cur[keys[keys.length - 1]] = value
  return result
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, config: { ...state.config, [action.key]: action.value }, isDirty: true }
    case 'SET_NESTED':
      return {
        ...state,
        config: setNestedValue(
          state.config as unknown as Record<string, unknown>,
          action.path,
          action.value
        ) as unknown as CheckoutConfig,
        isDirty: true,
      }
    case 'LOAD_CONFIG':
      return { ...state, configId: action.id, configName: action.name, config: { ...DEFAULT_CONFIG, ...action.config }, isDirty: false }
    case 'RESET':
      return { ...INITIAL_STATE, config: { ...DEFAULT_CONFIG } }
    case 'SET_SAVING':
      return { ...state, isSaving: action.value }
    case 'SET_PANEL':
      return { ...state, activePanel: action.panel }
    case 'SET_SAVED':
      return { ...state, isDirty: false, configId: action.id }
    case 'SET_NAME':
      return { ...state, configName: action.name, isDirty: true }
    default:
      return state
  }
}

interface EditorContextValue {
  state: EditorState
  setField: (key: keyof CheckoutConfig, value: unknown) => void
  setNested: (path: string, value: unknown) => void
  loadConfig: (id: number, name: string, config: CheckoutConfig) => void
  reset: () => void
  setSaving: (v: boolean) => void
  setPanel: (panel: string) => void
  setSaved: (id: number) => void
  setName: (name: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const setField   = useCallback((key: keyof CheckoutConfig, value: unknown) => dispatch({ type: 'SET_FIELD', key, value }), [])
  const setNested  = useCallback((path: string, value: unknown) => dispatch({ type: 'SET_NESTED', path, value }), [])
  const loadConfig = useCallback((id: number, name: string, config: CheckoutConfig) => dispatch({ type: 'LOAD_CONFIG', id, name, config }), [])
  const reset      = useCallback(() => dispatch({ type: 'RESET' }), [])
  const setSaving  = useCallback((value: boolean) => dispatch({ type: 'SET_SAVING', value }), [])
  const setPanel   = useCallback((panel: string) => dispatch({ type: 'SET_PANEL', panel }), [])
  const setSaved   = useCallback((id: number) => dispatch({ type: 'SET_SAVED', id }), [])
  const setName    = useCallback((name: string) => dispatch({ type: 'SET_NAME', name }), [])

  return (
    <EditorContext.Provider value={{ state, setField, setNested, loadConfig, reset, setSaving, setPanel, setSaved, setName }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside <EditorProvider>')
  return ctx
}
