import { NewGatewayForm } from '@/components/gateways/NewGatewayForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewGatewayPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/gateways" className="p-2 hover:bg-border/50 rounded-lg transition text-ink-light">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink">Adicionar Gateway</h1>
          <p className="text-sm text-ink-light mt-1">Conecte um novo provedor de pagamento à sua empresa</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <NewGatewayForm />
      </div>
    </div>
  );
}
