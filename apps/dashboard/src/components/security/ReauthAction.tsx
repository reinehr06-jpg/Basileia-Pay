'use client';

import { useState } from 'react';

interface ReauthActionProps {
  action: string;
  children: React.ReactNode;
}

export function ReauthAction({ action, children }: ReauthActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const confirm = async () => {
    setLoading(true);
    setError('');
    try {
      // call api: reauthenticate({ action, password })
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOpen(false);
    } catch {
      setError('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {children}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-md overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-lg text-ink">Confirmar identidade</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-ink-muted text-sm">
                Esta ação requer confirmação. Informe sua senha para continuar.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}
            </div>
            <div className="px-6 py-4 bg-surface-raised border-t border-border flex justify-end gap-3">
              <button 
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirm}
                disabled={loading || !password}
                className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-deep transition-colors disabled:opacity-50"
              >
                {loading ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
