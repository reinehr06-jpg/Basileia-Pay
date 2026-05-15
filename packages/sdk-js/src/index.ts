import { BasileiaClient } from './client';
import { CheckoutResource } from './checkout/create';

export interface BasileiaConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl?: string;
  timeout?: number;
}

export class BasileiaSDK extends BasileiaClient {
  get checkouts() { return new CheckoutResource(this); }
  // get subscriptions() { return new SubscriptionResource(this); }
  // get webhooks() { return new WebhookResource(this); }
}

export { BasileiaClient } from './client';
export { BasileiaEmbed } from './checkout/embed';
export { verifyWebhookSignature } from './webhooks/verify';
export { generateIdempotencyKey } from './utils/idempotency';
export { formatCurrency } from './utils/currency';
export { BasileiaError, BasileiaApiError } from './utils/errors';
