export function generateIdempotencyKey(): string {
  return `bsdk_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
