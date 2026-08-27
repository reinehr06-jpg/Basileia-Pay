'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Check, AlertTriangle, Copy } from 'lucide-react';
import { fetchWithTimeout, getCsrfToken, getAccessToken, clearTokens, setTokens } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'loading' | 'setup' | 'verify' | 'done'>('intro');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputs = useRef<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codesCopied, setCodesCopied] = useState(false);

  const initSetup = async () => {
    setStep('loading');
    try {
      const csrfToken = getCsrfToken();
      const token = getAccessToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/2fa/setup?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        },
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSecret(data.data.secret);
        setQrCodeUrl(data.data.qr_code_url);
        setStep('setup');
      } else {
        setError(data.message || 'Erro ao iniciar setup 2FA');
      }
    } catch {
      setError('Erro de conexão com o servidor.');
    }
  };

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      triggerToast('Insira o código completo de 6 dígitos.');
      return;
    }
    setLoading(true);
    try {
      const csrfToken = getCsrfToken();
      const token = getAccessToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/2fa/enable?_t=${Date.now()}`, {
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
      if (data.success) {
        // Check if the response includes new tokens (some backends rotate tokens after 2FA)
        const newAccess = data.data?.access_token || data.access_token || data.token;
        const newRefresh = data.data?.refresh_token || data.refresh_token;
        const expiresAt = data.data?.expires_at || data.expires_at;
        if (newAccess && newRefresh) {
          setTokens(newAccess, newRefresh, expiresAt);
        }

        setRecoveryCodes(data.data.recovery_codes || []);
        setStep('done');
        triggerToast('2FA ativado com sucesso!');
      } else {
        triggerToast(data.message || 'Código inválido.');
      }
    } catch {
      triggerToast('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const copyCodes = () => {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCodesCopied(true);
      triggerToast('Códigos copiados!');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#FAF8FF] via-[#F4EFFF] to-[#FCFAFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[28px] p-8 shadow-2xl max-w-md text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-black text-slate-800">Erro ao configurar 2FA</h2>
          <p className="text-xs font-bold text-slate-500">{error}</p>
          <button onClick={() => { clearTokens(); router.push('/login'); }}
            className="px-6 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-wider">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#FAF8FF] via-[#F4EFFF] to-[#FCFAFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[28px] p-8 shadow-2xl max-w-md w-full text-center space-y-6 border border-[#E8DDFD]/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-purple-500 to-brand"></div>
          
          <div className="w-16 h-16 bg-[#F4EFFF] rounded-2xl flex items-center justify-center mx-auto rotate-3 border border-[#E8DDFD]">
            <Shield className="w-8 h-8 text-brand -rotate-3" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mais Segurança</h1>
            <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">
              Para proteger sua conta, a autenticação de dois fatores (2FA) é <span className="text-brand font-black">obrigatória</span> no primeiro acesso.
            </p>
          </div>

          <div className="pt-2">
            <button onClick={initSetup}
              className="w-full h-12 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center justify-center gap-1.5"
            >
              Conectar Autenticador <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#FAF8FF] via-[#F4EFFF] to-[#FCFAFF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider">Preparando setup 2FA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FAF8FF] via-[#F4EFFF] to-[#FCFAFF] flex items-center justify-center p-4 xl:p-10 select-none overflow-x-hidden font-sans">

      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <span className="w-2 h-2 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-[560px] mx-auto animate-in fade-in duration-500">
        <div className="bg-white border border-[#E8DDFD]/90 rounded-[28px] p-8 xl:p-10 shadow-2xl shadow-purple-950/5 text-left space-y-6">

          <div className="flex items-center justify-center gap-3 w-full pb-2 border-b border-slate-50">
            <div className="flex items-center gap-1.5">
              <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                step === 'done' ? 'bg-emerald-100 text-emerald-700' : step === 'verify' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand text-white shadow-md shadow-brand/15'
              }`}>
                {step === 'done' ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${step === 'done' ? 'text-emerald-600' : 'text-brand'}`}>Setup</span>
            </div>
            <span className="w-10 h-[1.5px] bg-[#E8DDFD] shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                step === 'done' ? 'bg-emerald-100 text-emerald-700' : step === 'verify' ? 'bg-brand text-white shadow-md shadow-brand/15' : 'bg-slate-100 text-slate-400'
              }`}>
                {step === 'done' ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${step === 'done' ? 'text-emerald-600' : step === 'verify' ? 'text-brand' : 'text-slate-400'}`}>Verificar</span>
            </div>
            <span className="w-10 h-[1.5px] bg-[#E8DDFD] shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                step === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                <Check className="w-3 h-3" />
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${step === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}>Concluído</span>
            </div>
          </div>

          {step === 'setup' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-[22px] font-black tracking-tight text-[#1E1538]">Configurar 2FA</h3>
                <p className="text-slate-400 font-semibold text-xs mt-1">
                  Escaneie o QR code com seu app autenticador ou insira a chave manualmente.
                </p>
                <div className="mt-3 bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex gap-2.5 items-start text-left">
                  <span className="text-[14px]">⚠️</span>
                  <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                    Use <strong className="font-black text-amber-900">Authy</strong> em vez do Google Authenticator se quiser sincronização automática entre dispositivos da equipe — o Authy tem suporte nativo a multi-device e backup na nuvem.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code 2FA"
                    className="w-44 h-44"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ou insira manualmente</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 flex-1 truncate select-all">
                      {secret}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(secret); triggerToast('Chave copiada!'); }}
                      className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full h-12 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center justify-center gap-1.5"
              >
                Já escaneie o código <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-[22px] font-black tracking-tight text-[#1E1538]">Verificar código</h3>
                <p className="text-slate-400 font-semibold text-xs mt-1">
                  Insira o código de 6 dígitos gerado pelo seu app autenticador.
                </p>
              </div>

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

              <button
                type="submit"
                disabled={loading || code.join('').length < 6}
                className="w-full h-12 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Ativar 2FA'}
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setStep('setup')}
                className="w-full text-center text-xs font-bold text-slate-450 hover:text-slate-700"
              >
                Voltar ao QR code
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-emerald-50/75 border border-emerald-100 rounded-2xl p-5 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-emerald-800">2FA Ativado!</h3>
                <p className="text-xs font-bold text-emerald-700">
                  Sua conta agora está protegida com autenticação de dois fatores.
                </p>
              </div>

              {recoveryCodes.length > 0 && (
                <div className="bg-amber-50/75 border border-amber-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Códigos de Recuperação</span>
                    <button onClick={copyCodes} className="flex items-center gap-1 text-[10px] font-black text-amber-700 hover:underline">
                      <Copy className="w-3 h-3" /> {codesCopied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-amber-600">
                    Guarde estes códigos em local seguro.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {recoveryCodes.map((rc, i) => (
                      <code key={i} className="text-xs font-mono font-bold bg-white px-2 py-1.5 rounded-lg border border-amber-200 text-slate-700 select-all">{rc}</code>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { window.location.href = '/dashboard/onboarding'; }}
                className="w-full h-12 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center justify-center gap-1.5"
              >
                Continuar para o Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative w-full h-[1px] flex items-center justify-center">
            <span className="w-full h-[1px] bg-[#E8DDFD]/65 absolute top-1/2 -translate-y-1/2" />
            <div className="w-7 h-7 bg-white rounded-full border border-[#E8DDFD] shadow-sm flex items-center justify-center z-10">
              <Shield className="w-3.5 h-3.5 text-brand" />
            </div>
          </div>

          <div className="text-center text-xs font-semibold text-slate-400">
            Precisando de ajuda?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); triggerToast('Contate o suporte Basileia.'); }}
              className="text-brand font-black hover:underline">
              Fale com nosso suporte
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
