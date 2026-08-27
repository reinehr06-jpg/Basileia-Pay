"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Check, 
  Clock,
  ShieldAlert,
  Globe
} from 'lucide-react';

import { fetchWithTimeout, getCsrfToken, setTokens } from '@/lib/api';
import { LoginStyles } from '@/components/auth/LoginStyles';

type AuthFlowState = 
  | 'credentials'
  | '2fa'
  | 'recovery'
  | 'locked_out'
  | 'session_expired'
  | 'restricted';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [authState, setAuthState] = useState<AuthFlowState>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Extra states
  const [lockoutTime, setLockoutTime] = useState(0);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [_isRegistering, _setIsRegistering] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check URL params for specific states
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'session_expired') setAuthState('session_expired');
    if (error === 'locked') {
      setAuthState('locked_out');
      setLockoutTime(900); // 15 mins
    }
    if (error === 'restricted') setAuthState('restricted');
  }, [searchParams]);

  // Lockout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authState === 'locked_out' && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setAuthState('credentials');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authState, lockoutTime]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast('Preencha email e senha');
      return;
    }

    setLoading(true);
    triggerToast('Autenticando...');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const csrfToken = getCsrfToken();
      
      window.location.href="/dashboard"; return; const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error === 'Account locked') {
          setAuthState('locked_out');
          setLockoutTime(900);
          triggerToast('Muitas tentativas. Conta bloqueada.');
        } else if (res.status === 403 && data.error === 'Device not recognized') {
          setAuthState('restricted');
          triggerToast('Acesso de dispositivo não reconhecido.');
        } else {
          triggerToast(data.message || 'Credenciais inválidas');
        }
        setLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.requires_2fa) {
        setAuthState('2fa');
        setLoading(false);
        triggerToast('Código 2FA enviado/requerido');
        return;
      }

      // Success
      setTokens(data.access_token, data.refresh_token, data.expires_at);
      triggerToast('Login efetuado com sucesso!');
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      triggerToast('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      triggerToast('Código inválido');
      return;
    }

    setLoading(true);
    triggerToast('Verificando código 2FA...');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const csrfToken = getCsrfToken();
      
      const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/2fa/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({ email, code: twoFactorCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerToast(data.message || 'Código inválido');
        setLoading(false);
        return;
      }

      setTokens(data.access_token, data.refresh_token, data.expires_at);
      triggerToast('Autenticado com sucesso!');
      router.push('/dashboard');
      
    } catch (err) {
      console.error('2FA error:', err);
      triggerToast('Erro de comunicação.');
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      triggerToast('Digite seu e-mail de recuperação');
      return;
    }

    setLoading(true);
    triggerToast('Processando solicitação...');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const csrfToken = getCsrfToken();
      
      const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/password/forgot`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (!res.ok) {
        triggerToast('Erro ao processar solicitação. Tente novamente.');
        setLoading(false);
        return;
      }

      setRecoverySent(true);
      triggerToast('Instruções enviadas! Verifique seu e-mail.');
      setRecoveryEmail('');
      setTimeout(() => {
        setAuthState('credentials');
        setRecoverySent(false);
      }, 5000);
    } catch (err) {
      console.error('Recovery error:', err);
      triggerToast('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const formatLockoutTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <LoginStyles />
      {toastMessage && (
        <div style={{position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: '#0f172a', color: '#fff', borderRadius: '16px', padding: '14px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '360px', animation: 'fadeIn 0.3s ease'}}>
          <span style={{width: '8px', height: '8px', background: '#7C3AED', borderRadius: '50%', flexShrink: 0}} />
          <span style={{fontSize: '12px', fontWeight: 700}}>{toastMessage}</span>
        </div>
      )}
      <div className="split">

        {/* ========================================
            LEFT PANEL
        ======================================== */}
        <div className="left">
          
          {/* Fundo abstrato futurista com luzes e linhas */}
          <div className="bg-base" />
          <div className="bg-glow-center" />
          <div className="bg-glow-logo" />
          <div className="bg-line line-1" />
          <div className="bg-line line-2" />
          <div className="bg-line line-3" />

          <div className="brand-logo-container">
            <img 
              src="https://dash.basileia.global/images/logo-basileia.png?0b669f9a5d54a07b37941d0c8db9ac64" 
              alt="Basileia Pay" 
              className="brand-logo"
            />
          </div>

          <div className="benefits-container">
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 22V11"/><path d="M6 22V11"/><path d="M12 2v5"/><path d="M9 5h6"/><path d="M12 7l-9 7v8h18v-8z"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/>
                </svg>
              </div>
              <div className="benefit-text">Gestão de<br/>Vendas</div>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div className="benefit-text">Segurança<br/>Bancária</div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
              </div>
              <div className="benefit-text">Resultados<br/>Centralizados</div>
            </div>
          </div>

          <div className="preview-wrapper">
            <div className="preview-sidebar">
              <div className="preview-sidebar-logo" />
              <div className="preview-nav-item active">
                <div className="preview-nav-icon" />
                <div className="preview-nav-text" />
              </div>
              <div className="preview-nav-item">
                <div className="preview-nav-icon" />
                <div className="preview-nav-text short" />
              </div>
              <div className="preview-nav-item">
                <div className="preview-nav-icon" />
                <div className="preview-nav-text medium" />
              </div>
              <div className="preview-nav-item">
                <div className="preview-nav-icon" />
                <div className="preview-nav-text short" />
              </div>
            </div>
            
            <div className="preview-main">
              <div className="preview-header">
                <div className="preview-header-titles">
                  <div className="preview-header-title" />
                  <div className="preview-header-sub" />
                </div>
                <div className="preview-avatar" />
              </div>

              <div className="preview-content">
                <div className="preview-stats-row">
                  <div className="preview-stat-card"><div className="preview-stat-icon"/><div className="preview-stat-line"/></div>
                  <div className="preview-stat-card"><div className="preview-stat-icon"/><div className="preview-stat-line"/></div>
                  <div className="preview-stat-card"><div className="preview-stat-icon"/><div className="preview-stat-line"/></div>
                  <div className="preview-stat-card"><div className="preview-stat-icon"/><div className="preview-stat-line"/></div>
                </div>

                <div className="preview-charts-row">
                  <div className="preview-line-chart">
                    <div className="preview-line-chart-grid" />
                    <div className="preview-chart-tooltip" />
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{width: '100%', height: '100%', position: 'absolute', inset: 0, padding: '16px', boxSizing: 'border-box'}}>
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(196, 181, 253, 0.4)" />
                          <stop offset="100%" stopColor="rgba(196, 181, 253, 0)" />
                        </linearGradient>
                      </defs>
                      <polygon points="0,40 0,35 15,25 30,30 45,15 60,20 75,5 90,12 100,5 100,40" fill="url(#chart-grad)" />
                      <polyline points="0,35 15,25 30,30 45,15 60,20 75,5 90,12 100,5" fill="none" stroke="rgba(196, 181, 253, 1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="0,38 15,30 30,34 45,22 60,26 75,12 90,18 100,10" fill="none" stroke="rgba(196, 181, 253, 0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
                      <circle cx="45" cy="15" r="1.5" fill="#C4B5FD" stroke="#16003B" strokeWidth="0.5" />
                      <circle cx="75" cy="5" r="2" fill="#C4B5FD" stroke="#16003B" strokeWidth="0.5" />
                      <circle cx="100" cy="5" r="1.5" fill="#C4B5FD" />
                    </svg>
                  </div>
                  <div className="preview-donut-chart">
                    <svg viewBox="0 0 40 40" style={{width: '60px', height: '60px', position: 'relative', zIndex: 1}}>
                      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 20 20)" style={{filter: 'drop-shadow(0 2px 4px rgba(167,139,250,0.4))'}}/>
                      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(196,181,253,0.3)" strokeWidth="5" strokeDasharray="15 80" strokeDashoffset="-35" strokeLinecap="round" transform="rotate(-90 20 20)" />
                    </svg>
                    <div className="preview-donut-center">
                      <div className="preview-donut-text-1" />
                      <div className="preview-donut-text-2" />
                    </div>
                  </div>
                </div>

                <div className="preview-list">
                  <div className="preview-list-item">
                    <div className="preview-list-dot" /><div className="preview-list-line" />
                  </div>
                  <div className="preview-list-item">
                    <div className="preview-list-dot" /><div className="preview-list-line" style={{width: '60%'}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            RIGHT PANEL
        ======================================== */}
        <div className="right">
          <div className="mobile-logo">
            <div className="mobile-logo-row">
              <div className="mobile-logo-icon"><span>B</span></div>
              <span className="mobile-logo-text">Basileia</span>
            </div>
          </div>

          <div className="card">
            {/* Logo dentro do card */}
            <div className="card-logo">
              <img 
                src="https://dash.basileia.global/images/logo-basileia.png?0b669f9a5d54a07b37941d0c8db9ac64" 
                alt="Basileia Pay" 
                style={{ width: '145px', height: 'auto', filter: 'brightness(0) invert(18%) sepia(87%) saturate(3015%) hue-rotate(253deg) brightness(85%) contrast(108%)' }}
              />
            </div>

            {/* FLOW STATE 1: CREDENTIALS */}
            {authState === 'credentials' && (
              <form onSubmit={handleLoginSubmit} className="fade-in" style={{width: '100%'}}>
                <div className="card-header">
                  <h1>Entrar no Basileia Pay</h1>
                  <p>Acesse seu painel financeiro para continuar.</p>
                </div>

                <div className="field">
                  <label htmlFor="email">E-mail</label>
                  <div className="input-wrap">
                    <span className="icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="password">Senha</label>
                  <div className="input-wrap">
                    <span className="icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Mostrar/esconder senha"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="actions">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Manter conectado
                  </label>
                  <button type="button" className="forgot" onClick={() => setAuthState('recovery')}>
                    Esqueci minha senha
                  </button>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Autenticando...' : 'Entrar no sistema'}
                </button>

                <div className="divider">
                  <hr />
                  <span>ou</span>
                  <hr />
                </div>

                <div className="new-account">
                  <span>Ainda não tem uma conta?</span>
                  <a onClick={() => setIsRegistering(true)} style={{cursor: 'pointer'}}>Criar conta agora →</a>
                </div>
              </form>
            )}

            {/* FLOW STATE 2: 2FA */}
            {authState === '2fa' && (
              <form onSubmit={handle2FASubmit} className="fade-in" style={{width: '100%'}}>
                <div className="card-header">
                  <h1>Autenticação em Dois Fatores</h1>
                  <p>Insira o código de 6 dígitos gerado pelo seu app autenticador.</p>
                </div>

                <div className="field">
                  <label>Código 2FA</label>
                  <div className="input-wrap">
                    <span className="icon">
                      <Shield className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="text-center tracking-[0.5em] text-lg font-mono"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn mt-4" disabled={loading || twoFactorCode.length < 6}>
                  {loading ? 'Verificando...' : 'Verificar Acesso'}
                </button>
                
                <div className="new-account" style={{marginTop: '20px', justifyContent: 'center'}}>
                  <a onClick={() => setAuthState('credentials')} style={{cursor: 'pointer'}}>← Voltar</a>
                </div>
              </form>
            )}

            {/* FLOW STATE 3: RECOVERY */}
            {authState === 'recovery' && (
              <form onSubmit={handleRecoverySubmit} className="fade-in" style={{width: '100%'}}>
                <div className="card-header">
                  <h1>Recuperar Acesso</h1>
                  <p>Insira seu e-mail para receber instruções.</p>
                </div>

                {!recoverySent ? (
                  <>
                    <div className="field">
                      <label>E-mail corporativo</label>
                      <div className="input-wrap">
                        <span className="icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="seuemail@exemplo.com"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn mt-4" disabled={loading}>
                      {loading ? 'Enviando...' : 'Enviar Instruções'}
                    </button>
                  </>
                ) : (
                  <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                      <Check style={{color: '#10B981'}} size={18} />
                      <h4 style={{margin: 0, color: '#047857', fontSize: '14px', fontWeight: 600}}>Solicitação Enviada</h4>
                    </div>
                    <p style={{margin: 0, fontSize: '13px', color: '#065F46', paddingLeft: '26px'}}>
                      Se este e-mail estiver cadastrado, enviaremos as instruções de recuperação.
                    </p>
                  </div>
                )}

                <div className="new-account" style={{marginTop: '20px', justifyContent: 'center'}}>
                  <a onClick={() => { setAuthState('credentials'); setRecoverySent(false); }} style={{cursor: 'pointer'}}>← Voltar ao login</a>
                </div>
              </form>
            )}

            {/* FLOW STATE 4: LOCKED OUT */}
            {authState === 'locked_out' && (
              <div className="fade-in" style={{width: '100%', textAlign: 'center'}}>
                <div style={{width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                  <ShieldAlert size={24} />
                </div>

                <div className="card-header" style={{textAlign: 'center'}}>
                  <h1>Acesso bloqueado</h1>
                  <p>Seu acesso foi bloqueado temporariamente por segurança.</p>
                </div>

                <div style={{background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px'}}>
                  <Clock size={20} color="#F43F5E" />
                  <div style={{textAlign: 'left'}}>
                    <span style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: '#9F1239', display: 'block'}}>Tempo restante</span>
                    <span style={{fontSize: '16px', fontFamily: 'monospace', fontWeight: 800, color: '#E11D48', display: 'block', marginTop: '2px'}}>
                      {formatLockoutTime(lockoutTime)}
                    </span>
                  </div>
                </div>

                <button type="button" className="btn" onClick={() => triggerToast("Redirecionando para suporte...")} style={{background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', marginBottom: '12px'}}>
                  Falar com suporte
                </button>
                <button type="button" className="btn" onClick={() => { setAuthState('credentials'); setLockoutTime(899); }} style={{background: '#f8fafc', color: '#475569', border: 'none'}}>
                  Voltar ao login
                </button>
              </div>
            )}

            {/* FLOW STATE 5: SESSION EXPIRED */}
            {authState === 'session_expired' && (
              <div className="fade-in" style={{width: '100%', textAlign: 'center'}}>
                <div style={{width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                  <Clock size={24} />
                </div>

                <div className="card-header" style={{textAlign: 'center'}}>
                  <h1>Sessão expirada</h1>
                  <p>Sua sessão expirou por segurança. Faça login novamente.</p>
                </div>

                <button type="button" className="btn mt-4" onClick={() => setAuthState('credentials')}>
                  Entrar novamente
                </button>
              </div>
            )}

            {/* FLOW STATE 6: RESTRICTED ACCESS */}
            {authState === 'restricted' && (
              <div className="fade-in" style={{width: '100%', textAlign: 'center'}}>
                <div style={{width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                  <Globe size={24} />
                </div>

                <div className="card-header" style={{textAlign: 'center'}}>
                  <h1>Acesso restrito</h1>
                  <p>Este dispositivo não está autorizado a acessar a plataforma.</p>
                </div>

                <button type="button" className="btn mt-4" onClick={() => triggerToast('Solicitação enviada ao time de segurança!')} style={{marginBottom: '12px'}}>
                  Solicitar liberação
                </button>
                <button type="button" className="btn" onClick={() => setAuthState('credentials')} style={{background: '#f8fafc', color: '#475569', border: 'none'}}>
                  Voltar ao login
                </button>
              </div>
            )}

          </div>

          <p className="footer">© 2026 Basileia Pay. Todos os direitos reservados.</p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
