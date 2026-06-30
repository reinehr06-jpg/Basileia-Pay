import { CheckoutsList } from '@/components/checkouts/CheckoutsList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CheckoutsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Checkouts</h1>
          <p className="text-sm text-ink-light mt-1">Gerencie e publique suas páginas de pagamento</p>
        </div>
        <Link 
          href="/checkouts/new/editor"
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-dark transition"
        >
          <Plus className="w-4 h-4" /> Novo Checkout
        </Link>
      </div>
      
      <CheckoutsList />
    </div>
  );
}
