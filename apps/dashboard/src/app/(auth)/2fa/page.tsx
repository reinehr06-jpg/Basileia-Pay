'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  FileText, 
  ArrowRight, 
  Check, 
  ArrowLeft,
  Key,
  Monitor
} from 'lucide-react';
import { fetchWithTimeout, getCsrfToken, getAccessToken, setTokens } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputs = useRef<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const newCode = [...code];
      pasted.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pasted.length, 5);
      codeInputs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handle2faVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      triggerToast('Por favor, insira o código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    triggerToast('Validando código OTP...');

    try {
      const csrfToken = getCsrfToken();
      const token = getAccessToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/2fa/verify?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();

      if (res.status === 401) {
        triggerToast('Sessão expirada. Faça login novamente.');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
        return;
      }

      if (data.success) {
        // Check if the response includes new tokens (some backends rotate tokens after 2FA)
        const newAccess = data.data?.access_token || data.access_token || data.token;
        const newRefresh = data.data?.refresh_token || data.refresh_token;
        const expiresAt = data.data?.expires_at || data.expires_at;
        if (newAccess && newRefresh) {
          setTokens(newAccess, newRefresh, expiresAt);
        }
        
        triggerToast('Sessão autenticada! Redirecionando...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        triggerToast(data.message || data.error?.message || 'Código inválido ou expirado.');
      }
    } catch {
      triggerToast('Erro de conexão com o servidor.');
    } finally {
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
              Autenticação segura em<br />duas etapas.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
            {[
              { icon: Shield, title: 'Ambiente protegido', desc: 'Seus dados sempre seguros' },
              { icon: Lock, title: 'Infraestrutura segura', desc: 'Padrões globais de segurança' },
              { icon: FileText, title: 'Acesso auditável', desc: 'Logs, trilhas e conformidade' }
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

        {/* Right column: Auth card */}
        <div className="flex flex-col space-y-4 items-center justify-center animate-in fade-in slide-in-from-right-6 duration-700">
          
          <div className="bg-white border border-[#E8DDFD]/90 rounded-[28px] p-6.5 xl:p-9.5 shadow-2xl shadow-purple-950/5 w-full max-w-[480px] text-left space-y-6 relative overflow-hidden">
            
            {/* Step indicator active 2 */}
            <div className="flex items-center justify-center gap-3 w-full shrink-0 select-none pb-2 border-b border-slate-50">
              <div className="flex items-center gap-1.5">
                <span className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all bg-emerald-100 text-emerald-700">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Credenciais</span>
              </div>
              <span className="w-10 h-[1.5px] bg-[#E8DDFD] shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all bg-brand text-white shadow-md shadow-brand/15">
                  2
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand">Verificação</span>
              </div>
            </div>

            <form onSubmit={handle2faVerifySubmit} className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-[22px] font-black tracking-tight text-[#1E1538]">Verificação em 2 fatores</h3>
                <p className="text-slate-400 font-semibold text-xs mt-1">
                  Insira o código de 6 dígitos gerado pelo seu app autenticador.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between gap-2 pt-2">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { codeInputs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-11 h-13 bg-slate-50 border-2 border-[#E8DDFD] rounded-xl text-center text-lg font-black text-[#1E1538] focus:outline-none focus:border-brand transition-all shadow-sm focus:bg-white"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-left block leading-relaxed">
                  Dica: Copie o código gerado no Autenticador e cole direto no primeiro campo para auto-preenchimento.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || code.join('').length < 6}
                className="w-full h-12 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar e Acessar'}
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex flex-col gap-3 pt-2 text-center text-xs select-none">
                <button
                  type="button"
                  onClick={() => {
                    triggerToast('Digite "000000" para simular o código de recuperação.');
                    setCode(['0', '0', '0', '0', '0', '0']);
                  }}
                  className="text-brand font-black hover:underline"
                >
                  Usar código de recuperação
                </button>

                <Link
                  href="/login"
                  className="text-slate-450 hover:text-slate-700 font-bold flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
                </Link>
              </div>
            </form>

            <div className="relative w-full h-[1px] bg-slate-50/50 flex items-center justify-center py-2">
              <span className="w-full h-[1px] bg-[#E8DDFD]/65 absolute top-1/2 -translate-y-1/2" />
              <div className="w-7 h-7 bg-white rounded-full border border-[#E8DDFD] shadow-sm flex items-center justify-center z-10 shrink-0">
                <Shield className="w-3.5 h-3.5 text-brand" />
              </div>
            </div>

            <div className="text-center text-xs font-semibold text-slate-400 pb-1">
              Precisando de ajuda?{' '}
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  triggerToast("Abrindo canal de suporte de segurança Basileia...");
                }}
                className="text-brand font-black hover:underline"
              >
                Fale com nosso suporte
              </a>
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
