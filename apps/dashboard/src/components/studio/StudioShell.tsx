'use client';

import { useEffect, useRef } from 'react';
import { getAccessToken } from '@/lib/api';

interface StudioShellProps {
  checkoutId: string;
}

export function StudioShell({ checkoutId }: StudioShellProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Quando o studio estiver pronto, ele envia 'STUDIO_READY'
      if (event.data?.type === 'STUDIO_READY') {
        const token = getAccessToken();
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'STUDIO_INIT',
            payload: {
              token,
              apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
              checkoutId,
            },
          },
          '*'
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkoutId]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <iframe
        ref={iframeRef}
        src="/studio/"
        className="w-full h-full border-0"
        title="Checkout Studio"
      />
    </div>
  );
}
