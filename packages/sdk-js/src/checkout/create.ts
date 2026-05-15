import { BasileiaClient } from '../client';
import { generateIdempotencyKey } from '../utils/idempotency';
import { BasileiaError } from '../utils/errors';

export interface CreateCheckoutSessionInput {
  externalOrderId?: string;
  amount: number;
  currency?: string;
  customer: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }>;
  checkoutId?: string;
  gatewayId?: string;
  successUrl?: string;
  cancelUrl?: string;
  expiresIn?: number;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSession {
  id: string;
  checkoutUrl: string;
  sessionToken: string;
  status: 'created' | 'open' | 'processing' | 'paid' | 'failed' | 'expired';
  amount: number;
  currency: string;
  expiresAt: string;
  createdAt: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CheckoutResource {
  constructor(private client: BasileiaClient) {}

  async create(
    input: CreateCheckoutSessionInput,
    idempotencyKey?: string
  ): Promise<CheckoutSession> {
    return this.client.request<CheckoutSession>('POST', '/checkout-sessions', {
      body: input,
      idempotencyKey: idempotencyKey ?? generateIdempotencyKey(),
    });
  }

  async get(sessionId: string): Promise<CheckoutSession> {
    return this.client.request<CheckoutSession>('GET', `/checkout-sessions/${sessionId}`);
  }

  async poll(
    sessionToken: string,
    options: {
      interval?: number;
      timeout?: number;
      onStatus?: (status: string) => void;
    } = {}
  ): Promise<CheckoutSession> {
    const { interval = 3000, timeout = 600000, onStatus } = options;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const session = await this.client.request<CheckoutSession>(
        'GET', `/public/checkout/${sessionToken}/status`
      );

      onStatus?.(session.status);

      if (['paid', 'failed', 'expired', 'cancelled'].includes(session.status)) {
        return session;
      }

      await sleep(interval);
    }

    throw new BasileiaError('Polling timeout.', 'polling_timeout');
  }
}
