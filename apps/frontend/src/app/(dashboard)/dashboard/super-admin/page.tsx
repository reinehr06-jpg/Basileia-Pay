'use client';

import { useState, useEffect } from 'react';
import { Shield, Building2, Users, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchWithTimeout } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithTimeout(`${API_URL}/api/v1/auth/master/companies`, {
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCompanies(d.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-400">Acesso restrito a super administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand" /> Super Admin
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1">Gerencie todas as empresas da plataforma</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand w-64"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <div key={company.id} className="bg-white border border-border rounded-2xl p-5 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-ink">{company.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      {company.slug} • {company.status}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span>{company.users_count || 0} usuários</span>
                <span>{company.connected_systems_count || 0} sistemas</span>
                <span>{company.checkout_experiences_count || 0} checkouts</span>
              </div>
              <button className="w-full py-2 bg-brand/5 border border-brand/10 rounded-xl text-xs font-black text-brand hover:bg-brand/10 transition-colors flex items-center justify-center gap-1">
                Gerenciar <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Nenhuma empresa encontrada</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
