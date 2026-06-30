import { WebhooksList } from '@/components/webhooks/WebhooksList';

export default function WebhooksPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Webhooks</h1>
          <p className="text-sm text-ink-light mt-1">Rastreamento de eventos externos recebidos dos gateways</p>
        </div>
      </div>
      <WebhooksList />
    </div>
  );
}
