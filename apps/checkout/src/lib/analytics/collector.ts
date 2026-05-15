'use client';

interface AnalyticsFrame {
  type: string;
  elementId: string | null;
  scrollY: number | null;
  timeMs: number;
  method: string | null;
  errorCode: string | null;
}

export class CheckoutAnalytics {
  private sessionToken: string;
  private startTime: number;
  private buffer: AnalyticsFrame[] = [];
  private flushTimer: any = null;
  private method: string = 'pix';

  constructor(sessionToken: string) {
    this.sessionToken = sessionToken;
    this.startTime = Date.now();
  }

  track(type: string, meta: Partial<AnalyticsFrame> = {}): void {
    this.buffer.push({
      type,
      elementId: meta.elementId ?? null,
      scrollY: meta.scrollY ?? null,
      timeMs: Date.now() - this.startTime,
      method: meta.method ?? this.method,
      errorCode: meta.errorCode ?? null,
    });

    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), 2000);
  }

  setMethod(method: string): void {
    this.method = method;
    this.track('method_change', { elementId: method });
  }

  trackFocus(fieldId: string): void { this.track('focus', { elementId: fieldId }); }
  trackBlur(fieldId: string): void { this.track('blur', { elementId: fieldId }); }

  trackScroll(): void {
    this.track('scroll', { scrollY: window.scrollY });
  }

  trackError(errorCode: string): void {
    this.track('error', { errorCode });
  }

  trackAbandon(stage: string): void {
    this.flush();
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(
            `/api/v1/public/checkout-sessions/${this.sessionToken}/abandon`,
            JSON.stringify({ stage, timeMs: Date.now() - this.startTime, method: this.method })
        );
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const frames = [...this.buffer];
    this.buffer = [];

    fetch(`/api/v1/public/checkout-sessions/${this.sessionToken}/frames`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames }),
      keepalive: true,
    }).catch(() => {});
  }
}
