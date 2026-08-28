"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Layers, Activity, DollarSign, CheckCircle2, PlayCircle, HelpCircle, LayoutDashboard, CreditCard, Sun, Moon } from "lucide-react";
import { CompanySwitcher } from './CompanySwitcher';

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSystemsOpen, setIsSystemsOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('basileia-theme') || localStorage.getItem('basileia_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const systemsRef = useRef<HTMLDivElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem('basileia-theme') || localStorage.getItem('basileia_theme');
      if (saved === 'dark') {
        setDark(true);
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (saved === 'light') {
        setDark(false);
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        const matches = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDark(matches);
        if (matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    };
    
    handleThemeChange();
    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('basileia-theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (systemsRef.current && !systemsRef.current.contains(event.target as Node)) {
        setIsSystemsOpen(false);
      }
      if (connectionsRef.current && !connectionsRef.current.contains(event.target as Node)) {
        setIsConnectionsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[56px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-[32px] shrink-0 sticky top-0 z-50 dark:bg-[#100D23] dark:border-[#261E42]">
      {/* Busca global com atalho ⌘K */}
      <div className="relative flex items-center w-[340px] h-10 bg-[#F9FAFB] dark:bg-[#070514] border border-[#E5E7EB] dark:border-[#261E42] rounded-[10px] px-3 transition-all">
        <Search className="text-[#9CA3AF] w-4 h-4 mr-2 shrink-0" strokeWidth={2.4} />
        <input 
          type="text" 
          placeholder="Buscar transações, checkouts, clientes..." 
          className="bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-[#F5F2FF] placeholder-[#9CA3AF] w-full"
        />
        <span className="text-[#9CA3AF] text-[12px] font-medium shrink-0 ml-2">⌘K</span>
      </div>

      {/* RIGHT - Ações */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 text-[#6B7280] dark:text-[#8B82A8] hover:text-[#374151] dark:hover:text-[#F5F2FF] rounded-full transition-colors" 
          aria-label="Alternar tema"
        >
          {dark ? <Moon className="w-[20px] h-[20px]" strokeWidth={2.2} /> : <Sun className="w-[20px] h-[20px]" strokeWidth={2.2} />}
        </button>

        {/* Botão de Ajuda Contextual */}
        <div className="relative" ref={helpRef}>
          <button 
            onClick={() => { setIsHelpOpen(!isHelpOpen); setIsSystemsOpen(false); setIsConnectionsOpen(false); }}
            className={`transition-colors p-2 rounded-full ${isHelpOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-[#6B7280] dark:text-[#8B82A8] hover:text-[#374151] dark:hover:text-[#F5F2FF]'}`}
          >
            <HelpCircle className="w-[20px] h-[20px]" strokeWidth={2.2} />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white dark:bg-[#161230] border border-[#E5E7EB] dark:border-[#261E42] rounded-[14px] shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F1F1F4] dark:border-[#261E42] bg-indigo-50/50 dark:bg-[#100D23] flex items-center gap-2">
                <HelpCircle className="w-[16px] h-[16px] text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                <h3 className="text-[13px] font-[700] text-indigo-900 dark:text-indigo-300">Ajuda: Visão Geral</h3>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <p className="text-[12px] font-[500] text-[#4B5563] dark:text-[#8B82A8] leading-relaxed">
                  Bem-vindo ao Basileia Pay. Aqui você encontra tutoriais e dicas de como gerenciar pagamentos e assinaturas.
                </p>
                <a 
                  href="https://basileia.global"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#F9FAFB] dark:bg-[#100D23] hover:bg-gray-100 dark:hover:bg-[#261E42] border border-[#E5E7EB] dark:border-[#261E42] text-[#374151] dark:text-[#F5F2FF] text-[13px] font-[600] py-2 rounded-[10px] transition-colors mt-2"
                >
                  <PlayCircle className="w-[16px] h-[16px] text-indigo-600 dark:text-indigo-400" />
                  Central de Ajuda
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
