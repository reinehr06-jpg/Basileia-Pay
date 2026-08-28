'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function NewGatewayForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [driverType, setDriverType] = useState('native');
  const [gatewayType, setGatewayType] = useState('');
  const [configMapJson, setConfigMapJson] = useState('{\n  "base_url": "",\n  "create_charge": {},\n  "webhook": {}\n}');
  
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
      let configMap = null;
      if (driverType === 'generic') {
        configMap = JSON.parse(configMapJson);
      }

      await apiFetch('/api/v1/dashboard/gateways', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          gateway_type: driverType === 'generic' ? 'custom' : gatewayType,
          driver_type: driverType,
          environment: formData.environment,
          config_map: configMap,
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

        <div className="space-y-4 pt-4 border-t border-[#333333]">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Driver Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="driver_type" 
                value="native" 
                checked={driverType === 'native'} 
                onChange={(e) => setDriverType(e.target.value)}
                className="bg-[#111111] border-[#333333] text-indigo-500 focus:ring-indigo-500" 
              />
              <span className="text-sm text-gray-300">Native (Asaas, Stripe)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="driver_type" 
                value="generic"
                checked={driverType === 'generic'} 
                onChange={(e) => setDriverType(e.target.value)}
                className="bg-[#111111] border-[#333333] text-indigo-500 focus:ring-indigo-500" 
              />
              <span className="text-sm text-gray-300">Custom Generic (REST/JSON)</span>
            </label>
          </div>
        </div>

        {driverType === 'native' ? (
          <div>
            <label htmlFor="gateway_type" className="block text-sm font-medium text-gray-300 mb-1">
              Gateway Provider
            </label>
            <select
              id="gateway_type"
              name="gateway_type"
              required
              value={gatewayType}
              onChange={(e) => setGatewayType(e.target.value)}
              className="w-full bg-[#111111] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>Select a provider...</option>
              <option value="asaas">Asaas</option>
              <option value="stripe">Stripe</option>
              <option value="pagbank">PagBank</option>
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="config_map" className="block text-sm font-medium text-gray-300 mb-1">
              Configuration Map (JSON)
            </label>
            <p className="text-xs text-gray-500 mb-2">Provide the REST mapping for this generic gateway.</p>
            <textarea
              id="config_map"
              name="config_map"
              rows={12}
              value={configMapJson}
              onChange={(e) => setConfigMapJson(e.target.value)}
              className="w-full bg-[#111111] border border-[#333333] rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>
        )}
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
