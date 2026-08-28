import { z } from 'zod';

export const brandTokensSchema = z.object({
  logo: z.string().nullable(),
  primary_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Cor inválida'),
  secondary_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Cor inválida'),
  background_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Cor inválida'),
  font_family: z.string(),
  font_scale: z.string(),
  button_radius: z.number().min(0).max(100),
  card_radius: z.number().min(0).max(100),
  input_radius: z.number().min(0).max(100),
  shadow_style: z.string(),
});

export const checkoutSettingsSchema = z.object({
  layout: z.enum(['two_columns', 'single_column', 'compact']),
  currency: z.string().length(3),
  language: z.string(),
  show_secure_header: z.boolean(),
  enable_coupon: z.boolean(),
  enable_whatsapp_support: z.boolean(),
  success_redirect_url: z.string().url().nullable().or(z.literal('')),
  failure_redirect_url: z.string().url().nullable().or(z.literal('')),
  pixel_facebook: z.string().nullable(),
  pixel_gtm: z.string().nullable(),
  custom_domain: z.string().nullable(),
});

export const paymentConfigSchema = z.object({
  methods: z.array(z.string()),
  pix: z.object({
    enabled: z.boolean(),
    discount_percent: z.number().min(0).max(100),
    expiration_minutes: z.number().min(1),
    custom_message: z.string().nullable(),
  }),
  credit_card: z.object({
    enabled: z.boolean(),
    max_installments: z.number().min(1).max(24),
    interest_rate_percent: z.number().min(0),
    antifraud: z.boolean(),
    capture: z.enum(['automatic', 'manual']),
  }),
  boleto: z.object({
    enabled: z.boolean(),
    due_days: z.number().min(1),
    instructions: z.string().nullable(),
    fine_percent: z.number().min(0),
    interest_daily_percent: z.number().min(0),
  }),
  gateway_id: z.string().nullable(),
});

const responsiveStyleSchema = z.object({
  visible: z.boolean(),
  order: z.number(),
  style: z.record(z.string(), z.any()),
});

export const blockSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  order: z.number(),
  locked: z.boolean(),
  visible: z.boolean(),
  required: z.boolean(),
  content: z.record(z.string(), z.any()),
  style: z.record(z.string(), z.any()).optional(),
  responsive: z.object({
    desktop: responsiveStyleSchema,
    tablet: responsiveStyleSchema,
    mobile: responsiveStyleSchema,
  }).optional(),
  analytics: z.object({
    track_view: z.boolean(),
    track_click: z.boolean(),
    custom_event_name: z.string().nullable(),
  }).optional(),
  conditions: z.array(z.any()).optional(),
});

export const conditionSchema = z.object({
  id: z.string(),
  if: z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
  }),
  then: z.object({
    action: z.string(),
    block_id: z.string(),
  }),
});

export const trackingSchema = z.object({
  facebook_pixel: z.string().nullable(),
  google_tag_manager: z.string().nullable(),
  custom_scripts: z.array(z.string()),
});

export const checkoutSchemaValidator = z.object({
  schema_version: z.string(),
  checkout_id: z.string(),
  version_id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório').max(80, 'Nome deve ter no máximo 80 caracteres'),
  status: z.enum(['draft', 'published', 'archived', 'paused']),
  brand_tokens: brandTokensSchema,
  settings: checkoutSettingsSchema,
  payment_config: paymentConfigSchema,
  blocks: z.array(blockSchema),
  conditions: z.array(conditionSchema),
  tracking: trackingSchema,
});
