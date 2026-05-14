export interface CheckoutMethods {
  pix: boolean
  card: boolean
  boleto: boolean
}

export interface CheckoutConfig {
  primary_color: string
  secondary_color: string
  background_color: string
  background_gradient: string | null
  text_color: string
  text_muted_color: string
  border_color: string
  success_color: string
  error_color: string
  logo_url: string | null
  logo_width: number
  logo_position: 'left' | 'center' | 'right'
  show_name: boolean
  show_email: boolean
  show_phone: boolean
  show_document: boolean
  show_address: boolean
  field_order: string[]
  methods: CheckoutMethods
  method_order: string[]
  pix_copy_enabled: boolean
  pix_key_type: 'cpf' | 'email' | 'phone' | 'random'
  pix_key: string
  pix_instructions: string
  card_installments: number
  card_discount: number
  card_min_installments: number
  boleto_due_days: number
  boleto_instructions: string
  container_width: number
  container_max_width: number
  padding: number
  border_radius: number
  shadow: boolean
  title: string
  description: string
  success_title: string
  success_message: string
  button_text: string
  custom_css: string
  show_timer: boolean
  timer_position: 'top' | 'bottom'
  show_receipt_link: boolean
  analytics_id: string
}

export const DEFAULT_CONFIG: CheckoutConfig = {
  primary_color: '#7c3aed',
  secondary_color: '#6366f1',
  background_color: '#ffffff',
  background_gradient: null,
  text_color: '#1e293b',
  text_muted_color: '#64748b',
  border_color: '#e2e8f0',
  success_color: '#10b981',
  error_color: '#ef4444',
  logo_url: null,
  logo_width: 120,
  logo_position: 'center',
  show_name: true,
  show_email: true,
  show_phone: true,
  show_document: true,
  show_address: false,
  field_order: ['name', 'email', 'phone', 'document'],
  methods: { pix: true, card: true, boleto: false },
  method_order: ['pix', 'card'],
  pix_copy_enabled: true,
  pix_key_type: 'cpf',
  pix_key: '',
  pix_instructions: '',
  card_installments: 12,
  card_discount: 0,
  card_min_installments: 1,
  boleto_due_days: 3,
  boleto_instructions: '',
  container_width: 480,
  container_max_width: 600,
  padding: 32,
  border_radius: 16,
  shadow: true,
  title: 'Finalize seu pagamento',
  description: '',
  success_title: 'Pagamento confirmado!',
  success_message: 'Obrigado pela sua confiança.',
  button_text: 'Pagar agora',
  custom_css: '',
  show_timer: true,
  timer_position: 'top',
  show_receipt_link: true,
  analytics_id: '',
}
