import { BasileiaError, BasileiaApiError } from './utils/errors';

export interface BasileiaConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl?: string;
  timeout?: number;
}

export class BasileiaClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly environment: string;
  private readonly timeout: number;

  constructor(config: BasileiaConfig) {
    if (!config.apiKey) throw new BasileiaError('API key obrigatória.', 'invalid_config');

    this.apiKey = config.apiKey;
    this.environment = config.environment;
    this.timeout = config.timeout ?? 15000;
    this.baseUrl = config.baseUrl
      ?? (config.environment === 'production'
          ? 'https://api.basileia.global/v1'
          : 'https://sandbox.basileia.global/v1');
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    options: { body?: unknown; idempotencyKey?: string } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Basileia-SDK': 'js/1.0.0',
      'X-Request-Id': crypto.randomUUID(),
      'X-Basileia-Env': this.environment,
    };

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new BasileiaApiError(data.message ?? 'Erro na API', data.error, res.status, data);
      }

      return data as T;
    } catch (err) {
      if (err instanceof BasileiaApiError) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new BasileiaError('Timeout na requisição.', 'timeout');
      }
      throw new BasileiaError('Erro de conexão.', 'network_error');
    } finally {
      clearTimeout(timer);
    }
  }
}
