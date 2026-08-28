import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CheckoutSchema, EditorState, Device } from '../schema/types';

export const useStudioStore = create<EditorState>()(
  immer((set, get) => ({
    // Identidade
    checkoutId: '',
    versionId: '',

    // Documento inicial vazio, será substituído no fetch
    schema: {
      schema_version: '1.0',
      checkout_id: '',
      version_id: '',
      name: 'Carregando...',
      status: 'draft',
      brand_tokens: {
        logo: null,
        primary_color: '#000000',
        secondary_color: '#000000',
        background_color: '#ffffff',
        font_family: 'Inter',
        font_scale: 'moderna',
        button_radius: 8,
        card_radius: 12,
        input_radius: 8,
        shadow_style: 'soft',
      },
      settings: {
        layout: 'single_column',
        currency: 'BRL',
        language: 'pt-BR',
        show_secure_header: true,
        enable_coupon: true,
        enable_whatsapp_support: false,
        success_redirect_url: null,
        failure_redirect_url: null,
        pixel_facebook: null,
        pixel_gtm: null,
        custom_domain: null,
      },
      payment_config: {
        methods: ['pix', 'credit_card'],
        pix: { enabled: true, discount_percent: 0, expiration_minutes: 30, custom_message: null },
        credit_card: { enabled: true, max_installments: 12, interest_rate_percent: 0, antifraud: true, capture: 'automatic' },
        boleto: { enabled: false, due_days: 3, instructions: null, fine_percent: 0, interest_daily_percent: 0 },
        gateway_id: null,
      },
      blocks: [],
      conditions: [],
      tracking: { facebook_pixel: null, google_tag_manager: null, custom_scripts: [] },
    },

    // Seleção
    selectedBlockId: null,
    selectedDevice: 'desktop',
    selectedTab: 'content',

    // Visualização
    zoom: 100,
    mode: 'simple',
    devicePreset: 'desktop-full',

    // Estado de save
    unsavedChanges: false,
    saveStatus: 'idle',
    lastSavedAt: null,

    // Drag
    dragState: { isDragging: false, blockId: null },

    // Clipboard
    clipboard: null,

    // Undo/Redo
    historyIndex: -1,
    historyStack: [],

    // Erros e Scores
    validationErrors: [],
    conversionScore: null,
    conversionSuggestions: [],
  }))
);

// Helper methods to interact with the store outside of React components if needed
export const getStudioState = () => useStudioStore.getState();
export const setStudioState = (updater: (state: EditorState) => void) => useStudioStore.setState(updater);
