export class BasileiaError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BasileiaError';
  }
}

export class BasileiaApiError extends BasileiaError {
  constructor(
    message: string,
    code: string,
    public status: number,
    public raw: unknown
  ) {
    super(message, code);
    this.name = 'BasileiaApiError';
  }
}
