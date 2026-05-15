import { BasileiaError } from '../utils/errors';

export type EmbedMode = 'modal' | 'drawer' | 'inline' | 'fullscreen';

export interface EmbedOptions {
  mode?: EmbedMode;
  theme?: 'light' | 'dark' | 'auto';
  containerId?: string;
  onReady?: () => void;
  onSuccess?: (payment: any) => void;
  onAbandoned?: () => void;
  onError?: (error: BasileiaError) => void;
  onClose?: () => void;
}

export class BasileiaEmbed {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;

  constructor(
    private sessionToken: string,
    private options: EmbedOptions = {}
  ) {}

  open(): void {
    const mode = this.options.mode ?? 'modal';

    if (mode === 'inline') {
      this.renderInline();
    } else {
      this.renderOverlay(mode);
    }

    this.attachMessageListener();
  }

  close(): void {
    this.overlay?.remove();
    this.container?.remove();
    this.iframe = null;
    this.options.onClose?.();
  }

  private renderOverlay(mode: EmbedMode): void {
    this.overlay = document.createElement('div');
    this.overlay.className = `basileia-embed-overlay basileia-embed--${mode}`;
    this.overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,.6);
      display: flex; align-items: center; justify-content: center;
    `;

    this.container = document.createElement('div');
    this.container.className = 'basileia-embed-container';

    this.iframe = this.createIframe();
    this.container.appendChild(this.iframe);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  private renderInline(): void {
    const target = this.options.containerId
      ? document.getElementById(this.options.containerId)
      : null;

    if (!target) throw new BasileiaError('containerId não encontrado.', 'invalid_config');

    this.iframe = this.createIframe();
    this.iframe.style.width = '100%';
    this.iframe.style.border = 'none';
    target.appendChild(this.iframe);
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    const theme = this.options.theme ?? 'auto';
    const baseUrl = 'https://pay.basileia.global';

    iframe.src = `${baseUrl}/pay/${this.sessionToken}?embed=1&theme=${theme}`;
    iframe.style.cssText = 'width:100%;height:680px;border:none;border-radius:16px;';
    iframe.allow = 'payment';
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');

    return iframe;
  }

  private attachMessageListener(): void {
    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://pay.basileia.global') return;

      const { type, payload } = event.data ?? {};

      switch (type) {
        case 'basileia:ready': this.options.onReady?.(); break;
        case 'basileia:success': this.options.onSuccess?.(payload); break;
        case 'basileia:abandoned': this.options.onAbandoned?.(); break;
        case 'basileia:error': this.options.onError?.(payload); break;
        case 'basileia:close': this.close(); break;
      }
    };

    window.addEventListener('message', handler);
  }
}
