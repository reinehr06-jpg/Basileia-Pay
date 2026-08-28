import { CheckoutSchema } from './schema/types';

/**
 * Cliente de API simulado para o Checkout Studio (Fase 5)
 * Onde ver um "delay", será futuramente substituído pelo axios/fetch 
 * apontando para o backend Laravel.
 */

export async function fetchCheckoutDraft(checkoutId: string): Promise<CheckoutSchema | null> {
  // Simulando fetch de draft
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const saved = localStorage.getItem(`checkout_${checkoutId}_draft`);
  if (saved) {
    return JSON.parse(saved) as CheckoutSchema;
  }
  return null;
}

export async function saveCheckoutDraft(checkoutId: string, versionId: string, schema: CheckoutSchema): Promise<void> {
  // Simulando PATCH checkouts/{id} ou POST studio/checkouts/{id}/canvas
  // Retorna sucesso ou erro.
  await new Promise(resolve => setTimeout(resolve, 600)); // Latência de rede
  
  // Persistindo localmente para simular banco de dados da API
  localStorage.setItem(`checkout_${checkoutId}_draft`, JSON.stringify(schema));
}

export async function publishCheckoutVersion(checkoutId: string, versionId: string, schema: CheckoutSchema): Promise<void> {
  // Simulando POST studio/checkouts/{id}/publish
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Limpa o rascunho local se quisermos simular que a publicação gera uma nova versão locked
  // Para este mockup, vamos apenas fingir sucesso absoluto.
  console.log(`Checkout ${checkoutId} publicado com sucesso. Payload enviado:`, schema);
}
