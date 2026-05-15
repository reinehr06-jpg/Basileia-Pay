import { BasileiaError } from '../utils/errors';

export interface WebhookVerifyOptions {
  secret: string;
  payload: string;
  signature: string;
  timestamp: string;
  maxAgeSeconds?: number;
}

export function verifyWebhookSignature(options: WebhookVerifyOptions): boolean {
  const { secret, payload, signature, timestamp, maxAgeSeconds = 300 } = options;

  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  if (Math.abs(now - ts) > maxAgeSeconds) {
    throw new BasileiaError('Webhook timestamp fora da janela permitida.', 'webhook_replay');
  }

  const message = `${timestamp}.${payload}`;
  const expected = hmacSha256(secret, message);
  const received = signature.replace('v1=', '');

  return timingSafeEqual(expected, received);
}

function hmacSha256(secret: string, message: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

function timingSafeEqual(a: string, b: string): boolean {
  const crypto = require('crypto');
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
