'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Building2, Upload } from 'lucide-react';

export default function CompanySettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Basic Form States
  const [formData, setFormData] = useState({
    name: 'Basileia Corp',
    cnpj: '12.345.678/0001-90',
    corporateName: 'Basileia Servicos de Pagamentos LTDA',
    tradeName: 'Basileia Pay',
    address: 'Av. Paulista, 1000',
    number: 'Sala 15',
    complement: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    phone: '(11) 98765-4321',
    email: 'comercial@basileia.com',
    website: 'https://basileia.com',
    taxRegime: 'Lucro Presumido',
    stateRegistration: '111.222.333.444',
    cityRegistration: '5.555.666-7'
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Configurações da empresa salvas com sucesso.');
  };

  return (
    <div className="w-full text-left space-y-6 pt-2 pb-12 select-none">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">Perfil da empresa</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Perfil da Empresa
            </h1>
            <p className="text-slate-450 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Gerencie os dados cadastrais, endereços e informações fiscais da sua empresa.
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="flex h-9 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/15 transition-all uppercase tracking-tight"
        >
          <Save className="w-3.5 h-3.5 shrink-0" />
          Salvar alterações
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Col 1 & 2: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dados básicos */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Dados Cadastrais Básicos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nome Fantasia</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Razão Social</label>
                <input 
                  type="text" 
                  value={formData.corporateName} 
                  onChange={(e) => setFormData({...formData, corporateName: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CNPJ da Empresa</label>
                <input 
                  type="text" 
                  value={formData.cnpj} 
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Inscrição Estadual</label>
                <input 
                  type="text" 
                  value={formData.stateRegistration} 
                  onChange={(e) => setFormData({...formData, stateRegistration: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Endereço Comercial
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Logradouro / Avenida</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Número / Sala</label>
                <input 
                  type="text" 
                  value={formData.number} 
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Complemento</label>
                <input 
                  type="text" 
                  value={formData.complement} 
                  onChange={(e) => setFormData({...formData, complement: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cidade</label>
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CEP</label>
                <input 
                  type="text" 
                  value={formData.zipCode} 
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Fiscais */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Informações Fiscais e Tributárias
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Regime Tributário</label>
                <select 
                  value={formData.taxRegime} 
                  onChange={(e) => setFormData({...formData, taxRegime: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand cursor-pointer"
                >
                  <option value="Simples Nacional">Simples Nacional</option>
                  <option value="Lucro Presumido">Lucro Presumido</option>
                  <option value="Lucro Real">Lucro Real</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Inscrição Municipal</label>
                <input 
                  type="text" 
                  value={formData.cityRegistration} 
                  onChange={(e) => setFormData({...formData, cityRegistration: e.target.value})}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Col 3: Sidebar Details */}
        <div className="space-y-6">
          {/* Contrato social upload */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4 text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2 text-left">
              Documentos Legais
            </h3>

            <div className="border border-dashed border-[#E8DDFD] rounded-2xl p-6 hover:bg-slate-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
              <Upload className="w-8 h-8 text-slate-350 group-hover:text-brand transition-colors mb-2" />
              <span className="text-xs font-black text-slate-800">Contrato Social</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-1">PDF de até 5MB</span>
              <button 
                type="button"
                onClick={() => triggerToast('Selecione um arquivo PDF para upload.')}
                className="mt-3.5 px-3 py-1.5 bg-brand-soft hover:bg-brand/10 text-brand text-[10px] font-black uppercase rounded-lg shadow-sm"
              >
                Upload PDF
              </button>
            </div>
          </div>

          {/* Plano de faturamento */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Plano de Faturamento
            </h3>

            <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">Plano Enterprise</p>
                <p className="text-[10px] font-semibold text-slate-450 mt-0.5">Renovação em 24/09/2026</p>
              </div>
              <span className="text-xs font-black text-slate-950">R$ 1.490 /mês</span>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
}
