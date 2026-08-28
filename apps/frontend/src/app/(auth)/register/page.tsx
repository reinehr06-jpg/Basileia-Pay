'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  FileText, 
  ArrowRight, 
  User,
  Mail,
  Building,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { fetchWithTimeout, getCsrfToken } from '@/lib/api';

type RegisterMode = 'invite' | 'signup' | 'first_access';

export default function RegisterPage() {
  const [mode, setMode] = useState<RegisterMode>('invite');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('BR');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pre-fill mock data based on selected mode
  useEffect(() => {
    if (mode === 'invite') {
      setName('Vinícius Reinehr');
      setEmail('vinicius@empresa.com.br');
      setCompany('Basileia Premium Corp');
      triggerToast("Convite corporativo carregado com sucesso!");
    } else if (mode === 'first_access') {
      setName('Vinícius Reinehr');
      setEmail('vinicius@empresa.com.br');
      setCompany('');
      triggerToast("Configuração de primeiro acesso iniciada.");
    } else {
      setName('');
      setEmail('');
      setCompany('');
    }
  }, [mode]);

  // Password requirements check
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const isPasswordSecure = hasMinLen && hasUpper && hasNumber && hasSpecial;
  const isDocumentValid = country === 'BR' ? document.length > 0 : true;
  const isPhoneValid = country === 'BR' ? phone.length > 0 : true;
  const isFormValid = name && email && (mode !== 'signup' || company) && isPasswordSecure && password === confirmPassword && termsAccepted && isDocumentValid && isPhoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      triggerToast("Por favor, preencha todos os campos e cumpra os requisitos de senha.");
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Initialize CSRF-protected session
      await fetchWithTimeout(`${API_URL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });

      const csrfToken = getCsrfToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
          company_name: company,
          country,
          document: document || undefined,
          phone: phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message || data.error?.message || 'Erro ao criar conta. Verifique os dados.';
        setApiError(message);
        triggerToast(message);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (data.needs_2fa_setup) {
        triggerToast('Conta criada! Configure o 2FA para continuar.');
        setTimeout(() => { window.location.href = '/2fa/setup'; }, 800);
        return;
      }

      setSuccess(true);
      triggerToast('Conta criada com sucesso!');
    } catch (err) {
      setApiError('Erro de conexão com o servidor. Verifique se a API está rodando.');
      triggerToast('Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FAF8FF] via-[#F4EFFF] to-[#FCFAFF] flex items-center justify-center p-4 xl:p-10 select-none overflow-x-hidden font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <span className="w-2 h-2 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{toastMessage}</span>
        </div>
      )}

      {/* Grid container */}
      <div className="w-full max-w-[1240px] grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14 items-center">
        
        {/* Left column: Branding */}
        <div className="hidden lg:flex flex-col text-left space-y-7 animate-in fade-in slide-in-from-left-6 duration-700">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand via-violet-650 to-brand-dark flex items-center justify-center text-white font-extrabold shadow-lg shadow-brand/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[25px] font-black tracking-tight text-[#1E1538]">Basileia</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-[28px] xl:text-[34px] font-black tracking-tight text-[#1E1538] leading-tight">
              Criação de conta e<br />primeiro acesso controlado.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
            {[
              { icon: Sparkles, title: 'Onboarding guiado', desc: 'Passo a passo simples e intuitivo' },
              { icon: Shield, title: 'Compliance ativo', desc: 'Ativação opcional/obrigatória de 2FA' },
              { icon: Lock, title: 'Acesso seguro', desc: 'Links de convite expiráveis e de uso único' }
            ].map((pilar) => {
              const IconComp = pilar.icon;
              return (
                <div key={pilar.title} className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-100/75 text-brand flex items-center justify-center border border-violet-200/20 shadow-sm">
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 tracking-tight">{pilar.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 leading-normal">{pilar.desc}</p>
                </div>
              );
            })}
          </div>

          {/* High Fidelity Beautiful Corporate Visual Centerpiece representing Basileia Checkout */}
          <div className="relative w-full h-[220px] rounded-[24px] overflow-hidden border border-brand/5 shadow-sm bg-white/40 backdrop-blur-md flex items-center justify-center">
            
            {/* Glowing neon purple circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand/10 rounded-full blur-3xl" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-fuchsia-500/5 rounded-full blur-2xl" />

            {/* Isometric Checkout visual artwork */}
            <svg className="w-[340px] h-[190px] z-10 overflow-visible" viewBox="0 0 340 190" fill="none" xmlns="http://www.w3.org/2000/svg">
              <style>{`
                @keyframes floatCheckout {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-4px); }
                  100% { transform: translateY(0px); }
                }
                @keyframes floatCreditCard {
                  0% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-8px) rotate(1.5deg); }
                  100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes floatPixQR {
                  0% { transform: translateY(0px) scale(1); }
                  50% { transform: translateY(-5px) scale(1.03); }
                  100% { transform: translateY(0px) scale(1); }
                }
                @keyframes pulseGlow {
                  0% { opacity: 0.8; }
                  50% { opacity: 1; }
                  100% { opacity: 0.8; }
                }
                .anim-checkout {
                  animation: floatCheckout 5s ease-in-out infinite;
                  transform-origin: center;
                }
                .anim-card-glow {
                  animation: floatCreditCard 4s ease-in-out infinite;
                  transform-origin: center;
                }
                .anim-pix-qr {
                  animation: floatPixQR 4.5s ease-in-out infinite;
                  transform-origin: center;
                }
                .glow-secure {
                  animation: pulseGlow 2s ease-in-out infinite;
                }
              `}</style>

              {/* 1. THE MAIN CHECKOUT WINDOW (Simulating a Premium Payment Form) */}
              <g className="anim-checkout">
                {/* Outer shadow card */}
                <rect x="15" y="15" width="200" height="155" rx="14" fill="#FFFFFF" stroke="#E8DDFD" strokeWidth="1.5" filter="drop-shadow(0 10px 20px rgba(139, 92, 246, 0.05))" />
                
                {/* Top browser/window header with exit/minimize buttons */}
                <path d="M15 29 C15 20.7 21.7 15 30 15 L200 15 C208.3 15 215 20.7 215 29 L215 35 L15 35 Z" fill="#F8FAFC" stroke="#E8DDFD" strokeWidth="1" />
                <circle cx="27" cy="25" r="3" fill="#EF4444" />
                <circle cx="37" cy="25" r="3" fill="#FBBF24" />
                <circle cx="47" cy="25" r="3" fill="#10B981" />
                <text x="60" y="28" fill="#64748B" fontSize="8" fontWeight="bold" fontFamily="sans-serif">checkout.basileia.pay</text>
                
                {/* Form header & summary */}
                <text x="30" y="52" fill="#1E1538" fontSize="10" fontWeight="900" fontFamily="sans-serif">Resumo do Pedido</text>
                <text x="145" y="52" fill="#8B5CF6" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="end">R$ 149,90</text>
                
                {/* Tab selectors for payment methods */}
                <rect x="30" y="60" width="75" height="18" rx="4" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="1" />
                <text x="67" y="72" fill="#8B5CF6" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">💳 Cartão</text>
                
                <rect x="110" y="60" width="75" height="18" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="147" y="72" fill="#64748B" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">⚡ Pix</text>

                {/* Card input field placeholder (Realistic Credit Card Input Form) */}
                <rect x="30" y="85" width="155" height="18" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <text x="38" y="97" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">4000 1234 5678 9010</text>
                {/* Mini card indicator */}
                <rect x="168" y="89" width="12" height="10" rx="1.5" fill="#1E293B" />
                <circle cx="172" cy="94" r="2.5" fill="#EF4444" />
                <circle cx="176" cy="94" r="2.5" fill="#F59E0B" opacity="0.8" />

                {/* Expiry and CVV fields */}
                <rect x="30" y="108" width="75" height="18" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <text x="38" y="120" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">12 / 29</text>

                <rect x="110" y="108" width="75" height="18" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <text x="118" y="120" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">•••</text>

                {/* Big Green/Violet Secure CTA Button */}
                <rect x="30" y="132" width="155" height="22" rx="6" fill="#8B5CF6" />
                <text x="107" y="146" fill="#FFFFFF" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">PAGAR AGORA</text>
                
                {/* PCI Compliance indicator */}
                <text x="30" y="162" fill="#94A3B8" fontSize="7" fontWeight="bold" fontFamily="sans-serif">🔒 SSL Secured • PCI-DSS Compliant</text>
              </g>

              {/* 2. THE FLOATING PREMIUM CREDIT CARD */}
              <g className="anim-card-glow" transform="translate(170, 30)">
                {/* Shiny Card backing */}
                <rect x="0" y="0" width="145" height="90" rx="10" fill="url(#premium-card-gradient)" stroke="#FFFFFF" strokeWidth="1.5" filter="drop-shadow(0 8px 16px rgba(109, 40, 217, 0.15))" />
                
                {/* Gold security chip */}
                <rect x="12" y="14" width="18" height="14" rx="3" fill="url(#chip-gradient)" stroke="#F59E0B" strokeWidth="0.5" />
                <line x1="12" y1="21" x2="30" y2="21" stroke="#F59E0B" strokeWidth="0.5" />
                <line x1="21" y1="14" x2="21" y2="28" stroke="#F59E0B" strokeWidth="0.5" />

                {/* Cardholder name and mockup numbers */}
                <text x="12" y="48" fill="#F3E8FF" fontSize="9" fontFamily="monospace" letterSpacing="1">•••• •••• •••• 4242</text>
                <text x="12" y="66" fill="#D8B4FE" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">PRO MEMBER</text>
                <text x="12" y="74" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">VINICIUS REINEHR</text>

                {/* Holographic brand emblem */}
                <g className="glow-secure">
                  <circle cx="120" cy="70" r="8" fill="#EF4444" opacity="0.9" />
                  <circle cx="128" cy="70" r="8" fill="#F59E0B" opacity="0.75" />
                </g>
              </g>

              {/* 3. FLOATING PIX QR CODE BADGE (Glassmorphic) */}
              <g className="anim-pix-qr" transform="translate(240, 115)">
                {/* Transparent glassmorphic background */}
                <rect x="0" y="0" width="80" height="65" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.03))" />
                
                {/* Pix Header indicator */}
                <rect x="0" y="0" width="80" height="15" rx="12" fill="#E0F2FE" />
                <rect x="0" y="8" width="80" height="7" fill="#E0F2FE" />
                <text x="40" y="11" fill="#0369A1" fontSize="7" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">⚡ PIX CONFIRMADO</text>

                {/* Detailed Mockup QR Code matrix grid */}
                <g transform="translate(10, 22)" fill="#1E293B">
                  {/* Top-left corner finder */}
                  <rect x="0" y="0" width="10" height="10" fill="#0284C7" />
                  <rect x="2" y="2" width="6" height="6" fill="#FFFFFF" />
                  <rect x="3" y="3" width="4" height="4" fill="#0284C7" />

                  {/* Top-right corner finder */}
                  <rect x="50" y="0" width="10" height="10" fill="#0284C7" />
                  <rect x="52" y="2" width="6" height="6" fill="#FFFFFF" />
                  <rect x="53" y="3" width="4" height="4" fill="#0284C7" />

                  {/* Bottom-left corner finder */}
                  <rect x="0" y="26" width="10" height="10" fill="#0284C7" />
                  <rect x="2" y="28" width="6" height="6" fill="#FFFFFF" />
                  <rect x="3" y="29" width="4" height="4" fill="#0284C7" />

                  {/* Random pixels to look like a real QR code */}
                  <rect x="15" y="0" width="3" height="3" />
                  <rect x="22" y="3" width="4" height="3" />
                  <rect x="30" y="1" width="3" height="4" />
                  <rect x="38" y="0" width="5" height="3" />
                  
                  <rect x="15" y="12" width="6" height="3" />
                  <rect x="25" y="15" width="3" height="5" />
                  <rect x="35" y="10" width="12" height="3" />
                  
                  <rect x="15" y="26" width="5" height="3" />
                  <rect x="25" y="30" width="10" height="3" />
                  <rect x="42" y="26" width="6" height="8" fill="#10B981" />
                  
                  {/* Success check inside QR card */}
                  <path d="M44 30 L46 32 L49 28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              </g>

              {/* DEF GRADIENTS */}
              <defs>
                <linearGradient id="premium-card-gradient" x1="0" y1="0" x2="145" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C3AED" />
                  <stop offset="0.5" stopColor="#6D28D9" />
                  <stop offset="1" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="chip-gradient" x1="12" y1="14" x2="30" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FCD34D" />
                  <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>

        {/* Right column: Form Card */}
        <div className="flex flex-col space-y-4 items-center justify-center animate-in fade-in slide-in-from-right-6 duration-700">
          
          <div className="bg-white border border-[#E8DDFD]/90 rounded-[28px] p-7 xl:p-10 shadow-2xl shadow-purple-950/5 w-full max-w-[480px] text-left space-y-5 relative overflow-hidden">
            
            {/* Mode selection tabs */}
            <div className="flex bg-slate-50 border border-slate-200/60 rounded-xl p-1 w-full gap-1">
              {(['invite', 'signup', 'first_access'] as RegisterMode[]).map((m) => {
                const labels: Record<RegisterMode, string> = {
                  invite: '💼 Convite',
                  signup: '🚀 Cadastro',
                  first_access: '⚡ 1º Acesso'
                };
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (!success) setMode(m);
                    }}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      mode === m
                        ? 'bg-white text-brand shadow-sm border border-slate-200/30'
                        : 'text-slate-450 hover:text-slate-650'
                    }`}
                  >
                    {labels[m]}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <h3 className="text-[21px] font-black tracking-tight text-[#1E1538]">
                {mode === 'invite' && 'Completar Convite'}
                {mode === 'signup' && 'Criar sua conta'}
                {mode === 'first_access' && 'Primeiro Acesso'}
              </h3>
              <p className="text-slate-450 font-bold text-xs leading-relaxed">
                {mode === 'invite' && 'Você foi convidado para acessar a Basileia Pay. Complete seus dados corporativos.'}
                {mode === 'signup' && 'Cadastre sua empresa e inicie sua jornada na melhor infraestrutura de checkout do mercado.'}
                {mode === 'first_access' && 'Seus dados já existem na plataforma. Defina sua senha segura e ative seu painel.'}
              </p>
            </div>

            {success ? (
              <div className="bg-emerald-50/75 border border-emerald-100 text-emerald-850 rounded-2xl p-5 text-xs font-semibold leading-relaxed space-y-3">
                <div className="font-black text-emerald-800 text-[13px] flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-ping" />
                  Conta criada com sucesso!
                </div>
                <p>
                  Sua conta na Basileia Pay está ativa e seu primeiro acesso foi auditado com sucesso.
                </p>
                <p>
                  Estamos te redirecionando para configurar seu painel administrativo em alguns segundos...
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/onboarding"
                    className="w-full h-10.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    Acessar painel agora
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Nome Completo */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome completo</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      disabled={mode === 'invite' || mode === 'first_access'}
                      placeholder="Ex: Vinícius Reinehr"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10.5 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-450"
                    />
                    <User className="w-4 h-4 text-slate-350 absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">E-mail corporativo</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={mode === 'invite' || mode === 'first_access'}
                      placeholder="seu@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10.5 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-450"
                    />
                    <Mail className="w-4 h-4 text-slate-350 absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                  </div>
                </div>

                {/* Empresa (Omitida no Primeiro Acesso) */}
                {mode !== 'first_access' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome da Empresa</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        disabled={mode === 'invite'}
                        placeholder="Ex: Basileia Inc"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full h-10.5 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-450"
                      />
                      <Building className="w-4 h-4 text-slate-350 absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                    </div>
                  </div>
                )}

                {/* País */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">País</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10.5 px-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all bg-slate-50/50 focus:bg-white"
                  >
                    <option value="BR">Brasil</option>
                    <option value="US">Estados Unidos</option>
                    <option value="PT">Portugal</option>
                    <option value="ES">Espanha</option>
                    <option value="GB">Reino Unido</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                {/* Documento (CNPJ/CPF ou EIN/SSN) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {country === 'BR' ? 'CPF / CNPJ' : 'Document (EIN / SSN)'}
                    {country === 'BR' && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={country === 'BR'}
                      placeholder={country === 'BR' ? '00.000.000/0000-00' : 'XX-XXXXXXX'}
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="w-full h-10.5 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white"
                    />
                    <FileText className="w-4 h-4 text-slate-350 absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Telefone
                    {country === 'BR' && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required={country === 'BR'}
                      placeholder={country === 'BR' ? '(11) 99999-9999' : '+1 (555) 123-4567'}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10.5 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white"
                    />
                    <FileText className="w-4 h-4 text-slate-350 absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                  </div>
                </div>

                {/* Error message from API */}
                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-red-700">{apiError}</p>
                  </div>
                )}

                {/* Senha */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10.5 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirmar Senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repita a senha corporativa"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10.5 px-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-xs font-bold text-slate-800 transition-all placeholder:text-slate-350 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* Requirements check list */}
                <div className="bg-[#FAF8FF] border border-[#E8DDFD]/65 rounded-xl p-3 space-y-2 text-[10.5px]">
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider pb-0.5 border-b border-[#E8DDFD]/35">
                    Força de senha exigida
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-bold">
                    <div className="flex items-center gap-1.5">
                      {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-350 shrink-0" />}
                      <span className={hasMinLen ? "text-emerald-700" : "text-slate-450"}>8+ caracteres</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-350 shrink-0" />}
                      <span className={hasUpper ? "text-emerald-700" : "text-slate-450"}>Letra maiúscula</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-350 shrink-0" />}
                      <span className={hasNumber ? "text-emerald-700" : "text-slate-450"}>Um número</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-350 shrink-0" />}
                      <span className={hasSpecial ? "text-emerald-700" : "text-slate-450"}>Caractere especial</span>
                    </div>
                  </div>
                </div>

                {/* Termos de Uso Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand shrink-0"
                  />
                  <label htmlFor="terms" className="text-[11px] font-bold text-slate-450 leading-tight">
                    Declaro que aceito as <a href="#" onClick={(e) => { e.preventDefault(); triggerToast("Carregando Termos de Uso..."); }} className="text-brand font-black hover:underline">Políticas de Segurança de Dados</a> e os <a href="#" onClick={(e) => { e.preventDefault(); triggerToast("Carregando Termos de Serviços..."); }} className="text-brand font-black hover:underline">Termos de Serviços</a> da Basileia Pay.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full h-11 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : mode === 'first_access' ? 'Ativar acesso' : 'Criar minha conta'}
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative w-full h-[1px] bg-slate-50/50 flex items-center justify-center py-2">
              <span className="w-full h-[1px] bg-[#E8DDFD]/65 absolute top-1/2 -translate-y-1/2" />
              <div className="w-7 h-7 bg-white rounded-full border border-[#E8DDFD] shadow-sm flex items-center justify-center z-10 shrink-0">
                <Shield className="w-3.5 h-3.5 text-brand" />
              </div>
            </div>

            <div className="text-center text-xs font-semibold text-slate-400 pb-1">
              Já possui uma credencial de acesso?{' '}
              <Link href="/login" className="text-brand font-black hover:underline">
                Acesse o login
              </Link>
            </div>

          </div>

          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pt-1 justify-center">
            <Shield className="w-3.5 h-3.5 text-brand" />
            <span>Basileia Tecnologia Ltda. • Todos os direitos reservados</span>
          </div>

        </div>

      </div>

    </div>
  );
}
