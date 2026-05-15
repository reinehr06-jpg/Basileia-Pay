'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TwoFactorPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<any[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (code.join('').length === 6) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-ink">Verificação de Segurança</h1>
          <p className="text-ink-muted text-sm mt-2">
            Insira o código de 6 dígitos gerado pelo seu aplicativo de autenticação.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 bg-background border-2 border-border rounded-lg text-center text-xl font-bold text-ink focus:outline-none focus:border-brand transition-all"
                />
              ))}
            </div>

            <button 
              type="submit"
              disabled={code.join('').length < 6}
              className="w-full bg-brand text-white font-bold py-3 rounded-md hover:bg-brand-deep transition-all disabled:opacity-50"
            >
              Verificar e Acessar
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <button className="text-sm font-medium text-brand hover:underline">
              Não tenho acesso ao código
            </button>
            <a href="/login" className="flex items-center gap-2 text-xs text-ink-subtle hover:text-ink">
              <ArrowLeft size={14} /> Voltar para o login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
