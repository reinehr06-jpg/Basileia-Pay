'use client';

import { useState, useEffect } from 'react';

export function RequestLogs({ apiKeyPrefix }: { apiKeyPrefix: string }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Simulated SSE stream
    const interval = setInterval(() => {
        if (Math.random() > 0.7) {
            const methods = ['GET', 'POST', 'PATCH'];
            const endpoints = ['/checkout-sessions', '/payments', '/webhooks'];
            const newLog = {
                id: Math.random().toString(36).substring(7),
                method: methods[Math.floor(Math.random() * methods.length)],
                path: endpoints[Math.floor(Math.random() * endpoints.length)],
                status: 200,
                time: new Date().toLocaleTimeString(),
            };
            setLogs(prev => [newLog, ...prev].slice(0, 10));
        }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-raised flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-ink uppercase tracking-wider">Live Logs</span>
        </div>
        <button className="text-[10px] font-bold text-ink-subtle hover:text-ink uppercase" onClick={() => setLogs([])}>Limpar</button>
      </div>

      <div className="divide-y divide-border">
        {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-subtle italic">Aguardando requisições...</div>
        ) : (
            logs.map(log => (
                <div key={log.id} className="px-4 py-3 flex items-center justify-between hover:bg-background transition-colors font-mono text-xs">
                    <div className="flex items-center gap-4">
                        <span className={`font-bold ${log.method === 'POST' ? 'text-brand' : 'text-success'}`}>{log.method}</span>
                        <span className="text-ink">{log.path}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-success font-bold">{log.status}</span>
                        <span className="text-ink-subtle">{log.time}</span>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
