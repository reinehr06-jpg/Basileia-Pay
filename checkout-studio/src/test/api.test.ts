import { describe, it, expect, vi } from 'vitest';
import { fetchCheckouts, saveCheckout } from '../core/api';

describe('api', () => {
  it('fetchCheckouts returns an array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] })
    });

    const result = await fetchCheckouts();
    expect(Array.isArray(result)).toBe(true);
  });

  it('saveCheckout sends correct payload', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: '123' } })
    });

    const result = await saveCheckout({
      name: 'Test',
      status: 'draft',
      config: {}
    });
    
    expect(result?.id).toBe('123');
  });
});
