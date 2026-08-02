/**
 * Core Analytics Module
 * Abstrai o envio de eventos para diferentes provedores (PostHog, Google Analytics).
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

export function trackEvent(eventName: string, payload: Record<string, any> = {}) {
  // Console logging for debugging in dev mode
  if (import.meta.env.DEV) {
    console.debug(`[Analytics] ${eventName}`, payload);
  }

  // Google Analytics 4 (gtag)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, payload);
  }

  // PostHog
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, payload);
  }
}
