import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';

export default function SystemsPage() {
  return (
    <PageLayout
      title="Sistemas"
      action={<button className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep">Novo sistema</button>}
    >
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-border bg-surface-raised text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Token ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-surface-raised/50">
                <td className="px-4 py-3 font-medium">Site Principal</td>
                <td className="px-4 py-3 font-mono text-ink-subtle">sys_8a9b2c</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Ativo</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-brand hover:underline">Ver detalhes</button>
                </td>
              </tr>
              <tr className="hover:bg-surface-raised/50">
                <td className="px-4 py-3 font-medium">App Mobile</td>
                <td className="px-4 py-3 font-mono text-ink-subtle">sys_3d4f5g</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Ativo</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-brand hover:underline">Ver detalhes</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}
