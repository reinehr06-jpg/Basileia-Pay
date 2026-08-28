'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { RoutingRuleForm } from '@/components/routing/RoutingRuleForm';

export default function NewRulePage() {
  const router = useRouter();

  const handleSave = (formData: any) => {
    // In real app, calls save hook. We will mock a successful save.
    console.log('Rule created:', formData);
    router.push('/dashboard/routing');
  };

  return (
    <PageLayout title="Nova Regra de Roteamento">
      <div className="max-w-xl mx-auto py-6">
        <RoutingRuleForm 
          onClose={() => router.push('/dashboard/routing')}
          onSave={handleSave}
        />
      </div>
    </PageLayout>
  );
}
