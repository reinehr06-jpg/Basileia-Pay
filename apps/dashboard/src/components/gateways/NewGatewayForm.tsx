'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function NewGatewayForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    provider: 'asaas',
    environment: 'sandbox',
    apiKey: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/v1/dashboard/gateways', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          provider: formData.provider,
          environment: formData.environment,
          credentials: {
            api_key: formData.apiKey,
          }
        })
      });
      
      router.push('/gateways');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar o gateway');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink">Nome interno</label>
          <input 
            type="text" 
            required
            placeholder="Ex: Asaas Principal"
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink">Provedor</label>
          <select 
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm bg-white"
            value={formData.provider}
            onChange={e => setFormData({...formData, provider: e.target.value})}
          >
            <option value="asaas">Asaas</option>
            <option value="pagbank">PagBank</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-ink">Ambiente</label>
          <select 
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm bg-white"
            value={formData.environment}
            onChange={e => setFormData({...formData, environment: e.target.value})}
          >
            <option value="sandbox">Sandbox (Testes)</option>
            <option value="production">Produção</option>
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-border/50">
        <h3 className="text-sm font-bold text-ink mb-4">Credenciais de Autenticação</h3>
        <div className="space-y-2">
          <label className="text-sm font-bold text-ink">API Key</label>
          <input 
            type="password" 
            required
            placeholder="Cole sua chave de API aqui"
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm font-mono"
            value={formData.apiKey}
            onChange={e => setFormData({...formData, apiKey: e.target.value})}
          />
          <p className="text-xs text-ink-light mt-1">Sua chave será criptografada com segurança de nível bancário (AES-256-GCM).</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-brand text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Gateway'}
        </button>
      </div>
    </form>
  );
}
