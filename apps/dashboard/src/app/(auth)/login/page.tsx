'use client';

import { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand/20 mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-ink">Acesse sua conta</h1>
          <p className="text-ink-muted text-sm">Basileia Pay — Dashboard Operacional</p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = '/2fa'; }}>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-ink focus:outline-none focus:border-brand transition-colors"
                placeholder="nome@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-ink">Senha</label>
                <a href="#" className="text-xs text-brand hover:underline font-medium">Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-ink focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-brand text-white font-bold py-3 rounded-md hover:bg-brand-deep transition-all flex items-center justify-center gap-2"
            >
              Entrar <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-ink-subtle">
          Protegido por Basileia <span className="font-bold">SafeGuard</span>
        </p>
      </div>
    </div>
  );
}
