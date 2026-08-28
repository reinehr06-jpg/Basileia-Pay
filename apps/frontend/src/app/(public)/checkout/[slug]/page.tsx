import { CheckoutRenderer } from '@/components/checkout-renderer/CheckoutRenderer';
import { mockSchema } from '@/lib/studio/schema/mock';

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // No futuro: await fetchCheckoutBySlug(resolvedParams.slug)
  const schema = mockSchema;

  return (
    <CheckoutRenderer 
      schema={schema} 
      mode="live" 
    />
  );
}
