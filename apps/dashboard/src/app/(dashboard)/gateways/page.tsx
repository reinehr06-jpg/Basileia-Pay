import { getAccessToken } from '@/lib/api';
import { GatewaysList } from '@/components/gateways/GatewaysList';

export default function GatewaysPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Gateways</h1>
          <p className="text-sm text-ink-light mt-1">Gerencie seus provedores de pagamento</p>
        </div>
      </div>
      <GatewaysList />
    </div>
  );
}
