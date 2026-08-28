'use client';

import { useState } from 'react';
import { Search, Eye, Clipboard, Check, X, ShieldAlert, Monitor, Globe, Clock, Server, RefreshCw } from 'lucide-react';
import { DeveloperLog } from '@/types/developers';
import { cn } from '@/lib/utils';

interface DeveloperLogsTableProps {
  logs: DeveloperLog[];
  onActionFeedback: (msg: string) => void;
}

export function DeveloperLogsTable({ logs, onActionFeedback }: DeveloperLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<DeveloperLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '2xx' | '4xx' | '5xx'>('all');
  const [envFilter, setEnvFilter] = useState<'all' | 'production' | 'sandbox'>('all');

  const handleCopyId = (e: React.MouseEvent, reqId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reqId);
    setCopiedId(reqId);
    onActionFeedback('Request ID copiado com sucesso!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.systemName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === '2xx') matchesStatus = log.statusCode >= 200 && log.statusCode < 300;
    if (statusFilter === '4xx') matchesStatus = log.statusCode >= 400 && log.statusCode < 500;
    if (statusFilter === '5xx') matchesStatus = log.statusCode >= 500;

    let matchesEnv = true;
    if (envFilter === 'production') matchesEnv = log.environment === 'production';
    if (envFilter === 'sandbox') matchesEnv = log.environment === 'sandbox';

    return matchesSearch && matchesStatus && matchesEnv;
  });

  return (
    <div className="space-y-4 text-left">
      
      {/* Filters Bar */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm shadow-slate-100/50"
              placeholder="Buscar por Request ID, rota..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8.5 px-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-brand shadow-sm cursor-pointer"
          >
            <option value="all">Todos Status HTTP</option>
            <option value="2xx">Sucesso (2xx)</option>
            <option value="4xx">Erros Cliente (4xx)</option>
            <option value="5xx">Erros Servidor (5xx)</option>
          </select>

          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value as any)}
            className="h-8.5 px-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-brand shadow-sm cursor-pointer"
          >
            <option value="all">Todos Ambientes</option>
            <option value="production">Produção</option>
            <option value="sandbox">Sandbox</option>
          </select>
        </div>

        <button 
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setEnvFilter('all');
            onActionFeedback('Filtros de logs limpos!');
          }}
          className="text-brand hover:underline font-black text-[9.5px] uppercase tracking-wider"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Main Table Content Drawer split grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Table list */}
        <div className="flex-1 bg-white border border-[#E8DDFD]/65 rounded-[22px] overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-650">
              <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Endpoint Rota</th>
                  <th className="px-4 py-3">Sistema</th>
                  <th className="px-4 py-3">Prefixo Key</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Latência</th>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
                  const isClientError = log.statusCode >= 400 && log.statusCode < 500;
                  const isServerError = log.statusCode >= 500;

                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors cursor-pointer",
                        selectedLog?.id === log.id && "bg-violet-50/20"
                      )}
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-450 font-medium whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')} {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Método */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8.5px] font-black leading-none",
                          log.method === 'POST' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-655'
                        )}>
                          {log.method}
                        </span>
                      </td>

                      {/* Endpoint */}
                      <td className="px-4 py-3 font-mono text-[10.5px] text-slate-700 font-extrabold truncate max-w-[150px]" title={log.endpoint}>
                        {log.endpoint}
                      </td>

                      {/* Sistema */}
                      <td className="px-4 py-3 text-slate-500 font-bold whitespace-nowrap">{log.systemName}</td>

                      {/* Key Prefix */}
                      <td className="px-4 py-3 font-mono text-[10.5px] text-slate-400 font-bold">
                        {log.apiKeyPrefix}
                      </td>

                      {/* Status Code */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[8.5px] font-black leading-none",
                          isSuccess && "bg-emerald-50 text-emerald-600",
                          isClientError && "bg-amber-50 text-amber-500",
                          isServerError && "bg-red-50 text-red-600"
                        )}>
                          {log.statusCode}
                        </span>
                      </td>

                      {/* Latência */}
                      <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">
                        {log.latencyMs} ms
                      </td>

                      {/* Request ID */}
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 font-bold">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[80px]">{log.requestId}</span>
                          <button
                            onClick={(e) => handleCopyId(e, log.requestId)}
                            className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                            title="Copiar ID"
                          >
                            {copiedId === log.requestId ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 text-slate-400 hover:text-brand hover:bg-slate-100 rounded cursor-pointer"
                          title="Análise profunda"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Details Drawer */}
        {selectedLog && (
          <div className="w-full lg:w-[360px] bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shrink-0 flex flex-col justify-between overflow-y-auto no-scrollbar text-left shadow-sm shadow-slate-100/50">
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-3">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Análise de Chamada</span>
                  <h3 className="text-xs font-black text-slate-900 truncate max-w-[200px] mt-0.5" title={selectedLog.requestId}>
                    {selectedLog.requestId}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Technical Context Table */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-[10.5px] font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedLog.userAgent || 'Basileia Engine'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>IP Origem: {selectedLog.ip || '200.12.34.56'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Duração: {selectedLog.latencyMs} ms / p95</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-extrabold uppercase text-slate-700 tracking-wider">
                    {selectedLog.environment === 'production' ? 'Produção Real' : 'Ambiente Sandbox'}
                  </span>
                </div>
              </div>

              {/* Payloads Display */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Request Payload (Headers mascarados)</span>
                  <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[9.5px] text-slate-300 overflow-x-auto whitespace-pre no-scrollbar max-h-[120px]">
                    <code>{selectedLog.requestPayload || '{}'}</code>
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Response Body</span>
                  <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[9.5px] text-slate-300 overflow-x-auto whitespace-pre no-scrollbar max-h-[140px]">
                    <code>{selectedLog.responsePayload || '{}'}</code>
                  </pre>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-[#E8DDFD]/40">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedLog.requestId);
                  onActionFeedback('Request ID copiado para suporte!');
                }}
                className="w-full h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/30 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                Copiar ID para Suporte
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
