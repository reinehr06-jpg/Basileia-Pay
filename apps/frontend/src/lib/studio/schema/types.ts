export type Device = 'desktop' | 'tablet' | 'mobile';

export interface BrandTokens {
  logo: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  font_family: string;
  font_scale: string;
  button_radius: number;
  card_radius: number;
  input_radius: number;
  shadow_style: string;
}

export interface CheckoutSettings {
  layout: 'two_columns' | 'single_column' | 'compact';
  currency: string;
  language: string;
  show_secure_header: boolean;
  enable_coupon: boolean;
  enable_whatsapp_support: boolean;
  success_redirect_url: string | null;
  failure_redirect_url: string | null;
  pixel_facebook: string | null;
  pixel_gtm: string | null;
  custom_domain: string | null;
}

export interface PaymentConfig {
  methods: string[];
  pix: {
    enabled: boolean;
    discount_percent: number;
    expiration_minutes: number;
    custom_message: string | null;
  };
  credit_card: {
    enabled: boolean;
    max_installments: number;
    interest_rate_percent: number;
    antifraud: boolean;
    capture: 'automatic' | 'manual';
  };
  boleto: {
    enabled: boolean;
    due_days: number;
    instructions: string | null;
    fine_percent: number;
    interest_daily_percent: number;
  };
  gateway_id: string | null;
}

export interface ResponsiveStyle {
  visible: boolean;
  order: number;
  style: Record<string, any>;
}

export interface Block {
  id: string;
  type: string;
  name: string;
  order: number;
  locked: boolean;
  visible: boolean;
  required: boolean;
  content: Record<string, any>;
  style?: Record<string, any>;
  responsive?: {
    desktop: ResponsiveStyle;
    tablet: ResponsiveStyle;
    mobile: ResponsiveStyle;
  };
  analytics?: {
    track_view: boolean;
    track_click: boolean;
    custom_event_name: string | null;
  };
  conditions?: any[];
}

export interface Condition {
  id: string;
  if: {
    field: string;
    operator: string;
    value: any;
  };
  then: {
    action: string;
    block_id: string;
  };
}

export interface Tracking {
  facebook_pixel: string | null;
  google_tag_manager: string | null;
  custom_scripts: string[];
}

export interface CheckoutSchema {
  schema_version: string;
  checkout_id: string;
  version_id: string;
  name: string;
  status: 'draft' | 'published' | 'archived' | 'paused';
  brand_tokens: BrandTokens;
  settings: CheckoutSettings;
  payment_config: PaymentConfig;
  blocks: Block[];
  conditions: Condition[];
  tracking: Tracking;
}

// Editor State related types
export type EditorMode = 'simple' | 'advanced';

export interface EditorHistoryItem {
  id: string;
  command: string;
  label: string;
  before: Partial<CheckoutSchema>;
  after: Partial<CheckoutSchema>;
  userId: string;
  createdAt: string;
}

export interface ValidationError {
  path: string[];
  message: string;
}

export interface AISuggestion {
  id: string;
  type: 'update_copy' | 'add_block' | 'reorder_blocks' | 'update_style' | 'toggle_visibility';
  block_id?: string;
  field?: string;
  device?: Device;
  current_value?: unknown;
  suggested_value?: unknown;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  auto_applicable: boolean;
}

export interface EditorState {
  checkoutId: string;
  versionId: string;
  schema: CheckoutSchema;
  
  selectedBlockId: string | null;
  selectedDevice: Device;
  selectedTab: 'content' | 'style' | 'advanced';
  
  zoom: number;
  mode: EditorMode;
  devicePreset: string;
  
  unsavedChanges: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSavedAt: string | null;
  
  dragState: { isDragging: boolean; blockId: string | null };
  clipboard: Block | null;
  
  historyIndex: number;
  historyStack: EditorHistoryItem[];
  
  validationErrors: ValidationError[];
  conversionScore: number | null;
  conversionSuggestions: AISuggestion[];
}
