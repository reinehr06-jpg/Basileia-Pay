'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Palette, Upload } from 'lucide-react';

export default function BrandingSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live styling state
  const [colors, setColors] = useState({
    primary: '#7B16D9',
    secondary: '#1E293B',
    accent: '#10B981'
  });

  const [font, setFont] = useState('Inter');
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if(e.target.files?.length) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (type === 'claro' || type === 'escuro') {
        setUploadedLogo(url);
      }
      triggerToast(`${type === 'favicon' ? 'Favicon' : 'Logo'} carregado com sucesso!`);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Identidade visual atualizada com sucesso.');
  };

  return (
    <div className="w-full text-left space-y-6 pt-2 pb-12 select-none">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">Identidade visual</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-650 border border-pink-100 flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Identidade Visual
            </h1>
            <p className="text-slate-450 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Personalize logotipos, cores primárias e estilos visuais dos seus checkouts.
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="flex h-9 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/15 transition-all uppercase tracking-tight"
        >
          <Save className="w-3.5 h-3.5 shrink-0" />
          Salvar alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Col 1 & 2: Branding Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logo uploads */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Logotipo da Marca
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 transition group relative overflow-hidden">
                <input type="file" accept="image/png, image/svg+xml" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleLogoUpload(e, 'claro')} />
                <div className="relative z-0">
                  {uploadedLogo ? (
                    <img src={uploadedLogo} className="w-10 h-10 object-contain mx-auto mb-2" alt="Logo Claro" />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-brand transition-colors" />
                  )}
                  <span className="text-[10px] font-black text-slate-800 block">Logo Claro</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Fundo claro (PNG/SVG)</span>
                </div>
              </label>
              <label className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 transition group relative overflow-hidden">
                <input type="file" accept="image/png, image/svg+xml" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleLogoUpload(e, 'escuro')} />
                <div className="relative z-0">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-brand transition-colors" />
                  <span className="text-[10px] font-black text-slate-800 block">Logo Escuro</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Fundo escuro (PNG/SVG)</span>
                </div>
              </label>
              <label className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 transition group relative overflow-hidden">
                <input type="file" accept="image/x-icon, image/png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleLogoUpload(e, 'favicon')} />
                <div className="relative z-0">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-brand transition-colors" />
                  <span className="text-[10px] font-black text-slate-800 block">Favicon</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">32x32px (ICO/PNG)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Color palette */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Paleta de Cores
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={colors.primary} 
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#E8DDFD] p-0 overflow-hidden" 
                  />
                  <input 
                    type="text" 
                    value={colors.primary} 
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="flex-1 h-10 px-3 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={colors.secondary} 
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#E8DDFD] p-0 overflow-hidden" 
                  />
                  <input 
                    type="text" 
                    value={colors.secondary} 
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="flex-1 h-10 px-3 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cor de Destaque</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={colors.accent} 
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#E8DDFD] p-0 overflow-hidden" 
                  />
                  <input 
                    type="text" 
                    value={colors.accent} 
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    className="flex-1 h-10 px-3 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Tipografia da Plataforma
            </h3>

            <div className="space-y-1.5 max-w-xs">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fonte Principal</label>
              <select 
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand cursor-pointer"
              >
                <option value="Inter">Inter (Padrão)</option>
                <option value="Outfit">Outfit (Moderna)</option>
                <option value="Roboto">Roboto (Clássica)</option>
                <option value="Poppins">Poppins (Elegante)</option>
                <option value="Montserrat">Montserrat (Minimalista)</option>
                <option value="Open Sans">Open Sans (Legível)</option>
                <option value="Nunito">Nunito (Amigável)</option>
                <option value="Playfair Display">Playfair Display (Sofisticada)</option>
                <option value="Lato">Lato (Harmoniosa)</option>
                <option value="Oswald">Oswald (Impactante)</option>
                <option value="Raleway">Raleway (Distinta)</option>
                <option value="Ubuntu">Ubuntu (Tecnológica)</option>
                <option value="Merriweather">Merriweather (Tradicional)</option>
                <option value="Quicksand">Quicksand (Arredondada)</option>
                <option value="Fira Sans">Fira Sans (Acessível)</option>
                <option value="Space Grotesk">Space Grotesk (Futurista)</option>
                <option value="DM Sans">DM Sans (Geométrica)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Col 3: Live Preview Simulator */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Visualização em Tempo Real (Checkout)
            </h3>

            {/* Simulado de Checkout */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#FAF8FF] px-4 py-2 text-[10px] font-black text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>SIMULADOR DE CHECKOUT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="p-4 space-y-4 text-center bg-white">
                {uploadedLogo ? (
                  <img src={uploadedLogo} alt="Logo Preview" className="h-6 mx-auto mb-2 object-contain" />
                ) : (
                  <div className="w-24 h-6 bg-slate-100 rounded mx-auto mb-2 flex items-center justify-center text-[9px] font-black text-slate-400">
                    SUA LOGO AQUI
                  </div>
                )}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-50 rounded max-w-[80%] mx-auto" />
                  <div className="h-3 bg-slate-50 rounded max-w-[60%] mx-auto" />
                </div>
                {/* Botão do checkout com a cor primária live */}
                <button 
                  type="button"
                  style={{ backgroundColor: colors.primary }}
                  className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-sm transition-all"
                >
                  Pagar com Pix
                </button>
                <div className="text-[9px] font-bold text-slate-400">
                  Basileia Pay Compra Segura
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
