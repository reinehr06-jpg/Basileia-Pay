'use client';

import { Shield, Key, Smartphone } from 'lucide-react';

export default function MasterAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0A0A0F] via-[#0D0D1A] to-[#1A0A2E] flex items-center justify-center p-4 select-none overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/3 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/3 rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[480px] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center shadow-2xl shadow-brand/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Acesso Master</h1>
          <p className="text-sm text-slate-400 font-semibold">
            Autenticação em múltiplas camadas
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                <Key className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">1. URL Efêmera Diária</p>
                <p className="text-xs text-slate-400 mt-1">
                  A URL de acesso muda todos os dias automaticamente. Ela é derivada de um seed
                  criptográfico que existe apenas no servidor. Sem a URL do dia, ninguém sabe
                  que a página existe.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">2. 2FA Físico (YubiKey)</p>
                <p className="text-xs text-slate-400 mt-1">
                  Ao acessar a URL, o sistema pede autenticação via YubiKey (FIDO2/WebAuthn).
                  Sem a chave física, não é possível prosseguir. Fallback TOTP disponível
                  para emergências.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">3. Código TOTP + Login</p>
                <p className="text-xs text-slate-400 mt-1">
                  Após o 2FA, o sistema exibe um código TOTP que reseta a cada 20 segundos.
                  Use o código + email master para fazer login. A sessão expira em 20 minutos
                  e é vinculada ao seu IP e dispositivo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-red-400 font-bold text-center">
              A URL de acesso é fornecida por um canal seguro fora deste sistema.
              Consulte seu gerenciador de senhas ou Bitwarden para obter a URL do dia.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-600">
          Basileia Tecnologia Ltda. • Acesso restrito • Todos os acessos são auditados
        </p>
      </div>
    </div>
  );
}
