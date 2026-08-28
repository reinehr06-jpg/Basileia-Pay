'use client';

import { useStudioStore } from '@/lib/studio/editor/store';
import { CheckoutRenderer } from '@/components/checkout-renderer/CheckoutRenderer';

export function Canvas() {
  const schema = useStudioStore((state) => state.schema);
  const selectedDevice = useStudioStore((state) => state.selectedDevice);
  const zoom = useStudioStore((state) => state.zoom);

  // Determina a largura do canvas baseado no device selecionado
  const getDeviceWidth = () => {
    switch (selectedDevice) {
      case 'mobile':
        return '393px'; // Largura iPhone 15
      case 'tablet':
        return '768px'; // iPad
      case 'desktop':
        return '100%'; // Full width
      default:
        return '100%';
    }
  };

  return (
    <div className="flex-1 bg-surface-raised flex flex-col items-center overflow-auto relative">
      <div className="w-full flex justify-center p-8 min-h-full">
        {/* Transform Wrapper - Aplica o Zoom */}
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center',
            width: getDeviceWidth(),
            transition: 'width 0.3s ease-in-out'
          }}
        >
          {/* Device Container - Simula a tela do dispositivo */}
          <div 
            className={`bg-white shadow-2xl overflow-hidden relative flex flex-col min-h-[800px]
              ${selectedDevice !== 'desktop' ? 'rounded-[40px] border-[8px] border-slate-800' : ''}
            `}
          >
            {/* Camera notch simulation para mobile */}
            {selectedDevice === 'mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-3xl z-50"></div>
            )}
            
            {/* O Checkout Real injetado aqui */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 w-full h-full">
               {schema.schema_version ? (
                 <CheckoutRenderer schema={schema} mode="preview" />
               ) : (
                 <div className="flex items-center justify-center h-full text-ink-subtle">
                   Nenhum schema carregado.
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
