'use client';

import { useParams } from 'next/navigation';

export default function PublicCheckoutPage() {
  const params = useParams();
  const systemId = params.system_id as string;

  return (
    <div className="w-full h-screen">
      <iframe 
        src={`/studio/?public=true&system_id=${systemId}`}
        className="w-full h-full border-0"
        title="Checkout de Pagamento"
      />
    </div>
  );
}
