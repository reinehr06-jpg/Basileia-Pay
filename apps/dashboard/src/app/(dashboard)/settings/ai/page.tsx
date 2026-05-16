import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';

export default function AiSettingsPage() {
  return (
    <PageLayout
      title="Inteligência Artificial"
      action={<button className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep">Adicionar provedor</button>}
    >
      <div className="max-w-4xl space-y-6">
        <p className="text-ink-muted">Configure os modelos utilizados pelo Basileia Studio e demais recursos de IA.</p>

        <Card title="Basileia AI (Falcon3 10B)" className="border border-brand/50">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-ink mb-1">Modelo: hf.co/s3dev-ai/Falcon3-10B-Instruct-gguf:Q6_K</div>
              <div className="text-sm text-ink-subtle">Gratuito para clientes (Padrão)</div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Ativo</span>
          </div>
        </Card>

        <Card title="OpenAI (Customizado)">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-ink mb-1">Modelo: gpt-4o</div>
              <div className="text-sm text-ink-subtle">API Key: sk-... (Custo próprio)</div>
            </div>
            <div className="flex items-center gap-3">
               <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-raised text-ink-muted border border-border">Inativo</span>
               <button className="text-brand text-sm font-medium hover:underline">Editar</button>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
