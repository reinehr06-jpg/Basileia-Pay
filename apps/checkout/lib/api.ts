const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v2'

export async function getCheckout(uuid: string) {
  const res = await fetch(`${BASE}/checkout/${uuid}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Checkout não encontrado')
  return res.json()
}

export async function processCheckout(uuid: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/checkout/${uuid}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Erro ao processar pagamento')
  return json
}

export async function getCheckoutStatus(uuid: string) {
  const res = await fetch(`${BASE}/checkout/${uuid}/status`, { cache: 'no-store' })
  return res.json()
}

export async function getEvent(slug: string) {
  const res = await fetch(`${BASE}/events/${slug}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Evento não encontrado')
  return res.json()
}

export async function processEvent(slug: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/events/${slug}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Erro ao processar evento')
  return json
}
