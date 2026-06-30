'use client';

import { useEffect, useRef, useState } from 'react';
import { getCookie } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function CheckoutEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow from same origin
      if (event.origin !== window.location.origin) return;

      const { type, payload } = event.data || {};
      
      if (type === 'STUDIO_READY') {
        const token = getCookie('auth_token');
        if (!token) {
          setError('Sessão expirada. Faça login novamente.');
          return;
        }

        // Send initialization data to the iframe
        iframeRef.current?.contentWindow?.postMessage({
          type: 'STUDIO_INIT',
          payload: {
            token,
            apiUrl: '/api/v1',
            checkoutId: isNew ? null : id,
          }
        }, '*');
      }

      if (type === 'STUDIO_SAVED') {
        // If it was a new checkout and we just saved it, update the URL without reloading
        if (isNew && payload?.id) {
          window.history.replaceState(null, '', `/checkouts/${payload.id}/editor`);
        }
      }

      if (type === 'STUDIO_ERROR') {
        console.error('Studio Error:', payload?.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, isNew]);

  if (error) {
    return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
  }

  return (
    <div className="-m-8 h-[calc(100vh-64px)]">
      <iframe 
        ref={iframeRef}
        src="/studio/" 
        className="w-full h-full border-0"
        title="Checkout Studio Editor"
      />
    </div>
  );
}
