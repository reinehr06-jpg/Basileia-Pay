'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Moon, Sun, Monitor } from 'lucide-react';

export default function ThemeSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('basileia-theme') || localStorage.getItem('basileia_theme') || 'system';
      setTheme(savedTheme);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('basileia-theme', theme);
      
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      // Dispatch custom event to notify components on the same window
      window.dispatchEvent(new Event('storage'));
      
      triggerToast('Preferências de tema salvas com sucesso.');
    }
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
        <span className="text-slate-700 font-bold">Tema</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Tema do Painel
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Escolha a aparência da interface operacional da plataforma Basileia Pay.
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

      <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4 max-w-2xl text-left">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
          Preferência de Aparência
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Tema Claro', desc: 'Interface com fundo claro padrão.', icon: Sun },
            { id: 'dark', label: 'Tema Escuro', desc: 'Design noturno para menor fadiga.', icon: Moon },
            { id: 'system', label: 'Automático', desc: 'Segue o tema do seu sistema operacional.', icon: Monitor }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setTheme(item.id);
                triggerToast(`Aparência selecionada: ${item.label}. Clique em Salvar para aplicar.`);
              }}
              className={`p-4 border rounded-xl cursor-pointer transition text-center space-y-2 flex flex-col items-center justify-center ${theme === item.id ? 'border-brand bg-brand-soft/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
            >
              <item.icon className="w-6 h-6 text-slate-700" />
              <div>
                <span className="text-xs font-black text-slate-900 block">{item.label}</span>
                <span className="text-[9px] font-semibold text-slate-455 block mt-0.5 leading-normal">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
