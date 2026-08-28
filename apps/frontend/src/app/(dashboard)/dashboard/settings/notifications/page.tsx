'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Bell, Mail, MessageSquare, Phone } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [emailAlerts, setEmailAlerts] = useState({
    paymentSuccess: true,
    paymentFailed: true,
    refundRequest: true,
    chargeback: true,
    weeklyReport: false
  });

  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('(11) 98765-4321');
  const [systemAlertLevel, setSystemAlertLevel] = useState('critical');
  const [reportFrequency, setReportFrequency] = useState('weekly');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Preferências de notificação salvas.');
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
        <span className="text-slate-700 font-bold">Notificações</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Notificações e Alertas
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Gerencie os e-mails, SMS, alertas do WhatsApp e envios automáticos de relatórios da plataforma.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Col 1 & 2: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Email notifications */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Notificações por E-mail
            </h3>

            <div className="space-y-3">
              {[
                { id: 'paymentSuccess', label: 'Pagamento aprovado', desc: 'Envie um e-mail de confirmação ao receber pagamentos válidos.' },
                { id: 'paymentFailed', label: 'Falha no pagamento', desc: 'Notifique transações recusadas ou abandonadas pelo comprador.' },
                { id: 'refundRequest', label: 'Reembolsos solicitados', desc: 'Informe os administradores sobre novos pedidos de estorno.' },
                { id: 'chargeback', label: 'Contestações de compra (Chargeback)', desc: 'Envie alerta crítico imediato se um portador contestar a transação.' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-1">
                  <div>
                    <p className="text-xs font-black text-slate-900">{item.label}</p>
                    <p className="text-[10.5px] font-semibold text-slate-450 mt-0.5">{item.desc}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEmailAlerts({ ...emailAlerts, [item.id]: !emailAlerts[item.id as keyof typeof emailAlerts] })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailAlerts[item.id as keyof typeof emailAlerts] ? 'bg-brand' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlerts[item.id as keyof typeof emailAlerts] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp settings */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Integração com WhatsApp
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">Notificações por WhatsApp</p>
                <p className="text-[10.5px] font-semibold text-slate-450 mt-0.5">Envie atualizações de status de pedidos diretamente para o comprador.</p>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setWhatsappEnabled(!whatsappEnabled);
                  triggerToast(`Notificações por WhatsApp ${!whatsappEnabled ? 'ativadas' : 'desativadas'}.`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${whatsappEnabled ? 'bg-brand' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${whatsappEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {whatsappEnabled && (
              <div className="space-y-1.5 max-w-xs animate-in fade-in duration-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Número Comercial de Origem</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E8DDFD] flex items-center justify-center text-slate-450 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="flex-1 h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Col 3: Report & System Alerts */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Frequência de Relatórios
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Período de Envio</label>
              <select
                value={reportFrequency}
                onChange={(e) => setReportFrequency(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand cursor-pointer"
              >
                <option value="daily">Diário (todo dia às 08:00)</option>
                <option value="weekly">Semanal (segunda às 08:00)</option>
                <option value="monthly">Mensal (dia 1 às 08:00)</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Alertas Internos
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nível Mínimo do Evento</label>
              <select
                value={systemAlertLevel}
                onChange={(e) => setSystemAlertLevel(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand cursor-pointer"
              >
                <option value="all">Todos os eventos de auditoria</option>
                <option value="warning">Alterações e avisos</option>
                <option value="critical">Somente falhas críticas</option>
              </select>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
