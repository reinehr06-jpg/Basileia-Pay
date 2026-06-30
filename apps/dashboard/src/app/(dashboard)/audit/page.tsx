'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiFetch('/api/v1/dashboard/financial-audit-logs');
        setLogs(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-ink">Auditoria Financeira</h1>
      <p className="text-sm text-ink-light">Histórico imutável de transições de estado financeiro</p>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-ink-light">Carregando logs...</div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Entidade</th>
                <th className="p-4 font-semibold">Ação</th>
                <th className="p-4 font-semibold">Ator</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-ink-light">Nenhum log encontrado.</td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="border-b border-border hover:bg-gray-50 font-mono text-xs">
                  <td className="p-4 text-ink-light">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-4 font-bold uppercase text-ink">{log.entity_type} #{log.entity_id}</td>
                  <td className="p-4 text-brand">{log.action}</td>
                  <td className="p-4 text-ink-light">{log.actor_id ? `Admin #${log.actor_id}` : 'Sistema (Auto)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
