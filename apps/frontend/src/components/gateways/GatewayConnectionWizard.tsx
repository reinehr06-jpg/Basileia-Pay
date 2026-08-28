'use client'

import { useState, useEffect } from 'react'
import { X, Check, Loader2, ShieldCheck, ShieldAlert, ChevronRight, Network, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createGateway, fetchCapabilities } from '@/lib/api/gateways'
import type { Capability } from '@/types/gateway'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type Step = 'provider' | 'configure' | 'test' | 'review'

const PROVIDER_META: Record<string, { name: string; color: string }> = {
  asaas: { name: 'Asaas', color: 'bg-blue-600' },
  pagbank: { name: 'PagBank', color: 'bg-emerald-600' },
}

export function GatewayConnectionWizard({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('provider')
  const [capabilities, setCapabilities] = useState<Record<string, Capability>>({})
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox')
  const [name, setName] = useState('')
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCapabilities().then(setCapabilities).catch(() => {})
  }, [])

  const handleSelectProvider = (key: string) => {
    setSelectedProvider(key)
    setName(PROVIDER_META[key]?.name || key)
    setStep('configure')
  }

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }))
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setError(null)
    try {
      await createGateway({
        name,
        provider: selectedProvider!,
        environment,
        credentials,
      })
      setTestResult('success')
      setStep('review')
    } catch (e) {
      setTestResult('failed')
      setError(e instanceof Error ? e.message : 'Erro ao conectar gateway')
    } finally {
      setTesting(false)
    }
  }

  const handleFinish = () => {
    onSuccess()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step !== 'provider' && (
              <button onClick={() => setStep('provider')} className="p-1 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
            )}
            <div>
              <h2 className="text-slate-950 font-black text-sm">Conectar Gateway</h2>
              <p className="text-slate-400 font-bold text-[10.5px]">
                {step === 'provider' && 'Selecione o provedor de pagamento'}
                {step === 'configure' && 'Configure as credenciais de acesso'}
                {step === 'test' && 'Testando conexão...'}
                {step === 'review' && 'Conexão estabelecida'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-1 px-6 py-3 bg-[#FAF8FF]/60 border-b border-[#E8DDFD]/40">
          {(['provider', 'configure', 'test', 'review'] as Step[]).map((s, i) => {
            const currentIdx = ['provider', 'configure', 'test', 'review'].indexOf(step)
            const stepIdx = i
            const isDone = stepIdx < currentIdx
            const isCurrent = stepIdx === currentIdx
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all',
                  isDone && 'bg-green-500 text-white',
                  isCurrent && 'bg-brand text-white',
                  !isDone && !isCurrent && 'bg-slate-200 text-slate-500',
                )}>
                  {isDone ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <div className={cn(
                  'h-0.5 flex-1 rounded-full',
                  stepIdx < currentIdx ? 'bg-green-400' : 'bg-slate-200'
                )} />
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[420px] overflow-y-auto">
          {/* Step 1: Provider Selection */}
          {step === 'provider' && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 mb-3">Escolha o provedor de pagamento para conectar</p>
              {Object.entries(capabilities).map(([key, cap]) => {
                const meta = PROVIDER_META[key] || { name: key, color: 'bg-slate-600' }
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectProvider(key)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#E8DDFD] hover:border-brand/40 hover:bg-brand-soft/20 transition-all text-left group"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0', meta.color)}>
                      {meta.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-950 text-sm">{meta.name}</p>
                      <p className="text-[10.5px] font-bold text-slate-400 mt-0.5">
                        {cap.methods.join(' · ')}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-all" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 'configure' && selectedProvider && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Nome do Gateway</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Asaas Produção"
                  className="w-full px-3 py-2.5 bg-white border border-[#E8DDFD] rounded-xl text-[13px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/35 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Ambiente</label>
                <div className="flex gap-2">
                  {(['sandbox', 'production'] as const).map(env => (
                    <button
                      key={env}
                      onClick={() => setEnvironment(env)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-tight transition-all',
                        environment === env
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-white text-slate-600 border-[#E8DDFD] hover:border-brand/30',
                      )}
                    >
                      {env === 'sandbox' ? 'Sandbox' : 'Produção'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#E8DDFD]/40 pt-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Credenciais de API</label>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="API Key / Access Token"
                    value={credentials.api_key || credentials.api_token || ''}
                    onChange={e => {
                      const key = selectedProvider === 'asaas' ? 'api_key' : 'api_token'
                      handleCredentialChange(key, e.target.value)
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8DDFD] rounded-xl text-[13px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/35 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Sandbox (0 ou 1)"
                    value={credentials.sandbox || ''}
                    onChange={e => handleCredentialChange('sandbox', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8DDFD] rounded-xl text-[13px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/35 transition-all"
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-1.5">
                  As credenciais são criptografadas em repouso e nunca armazenadas em texto puro.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setStep('provider')}
                  className="px-4 py-2 border border-[#E8DDFD] rounded-xl text-[10.5px] font-black text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleTest}
                  disabled={!name || testing}
                  className="px-5 py-2 bg-brand text-white rounded-xl text-[10.5px] font-black hover:bg-brand-deep transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Network className="w-3.5 h-3.5" />}
                  Testar Conexão
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Testing */}
          {step === 'test' && (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-brand w-10 h-10" />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">
                Autenticando credenciais...
              </p>
              <p className="text-[10px] font-bold text-slate-400">Verificando acesso à API do provedor</p>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              {testResult === 'success' ? (
                <div className="bg-green-50 border border-green-200/50 p-4 rounded-2xl flex items-center gap-3 text-green-700">
                  <ShieldCheck className="w-8 h-8 shrink-0 text-green-600" />
                  <div>
                    <p className="text-[12.5px] font-black leading-tight">Conexão Estabelecida com Sucesso</p>
                    <p className="text-[10px] font-bold text-green-600/80 mt-0.5">Gateway configurado e ativo.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200/50 p-4 rounded-2xl flex items-center gap-3 text-red-700">
                  <ShieldAlert className="w-8 h-8 shrink-0 text-red-600" />
                  <div>
                    <p className="text-[12.5px] font-black leading-tight">Conexão Falhou</p>
                    <p className="text-[10px] font-bold text-red-600/80 mt-0.5">{error || 'Erro ao conectar ao provedor.'}</p>
                  </div>
                </div>
              )}

              {selectedProvider && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">Provedor</span>
                    <span className="font-black text-slate-900">{PROVIDER_META[selectedProvider]?.name || selectedProvider}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">Ambiente</span>
                    <span className="font-black text-slate-900">{environment === 'sandbox' ? 'Sandbox' : 'Produção'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">Nome</span>
                    <span className="font-black text-slate-900">{name}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {testResult === 'failed' && (
                  <button
                    onClick={() => { setStep('configure'); setTestResult(null) }}
                    className="px-4 py-2 border border-[#E8DDFD] rounded-xl text-[10.5px] font-black text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Corrigir Credenciais
                  </button>
                )}
                <button
                  onClick={handleFinish}
                  className="px-5 py-2 bg-brand text-white rounded-xl text-[10.5px] font-black hover:bg-brand-deep transition-all"
                >
                  {testResult === 'success' ? 'Ativar Gateway' : 'Fechar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
