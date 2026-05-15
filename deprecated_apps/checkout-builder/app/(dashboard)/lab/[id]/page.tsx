import { CheckoutEditor } from '@/components/lab/CheckoutEditor'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

async function getConfig(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/checkout-configs/${id}`, {
      headers: { Cookie: cookies().toString() }, cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch { return null }
}

export default async function LabEditPage({ params }: Props) {
  const data = await getConfig(params.id)
  if (!data) notFound()
  return <CheckoutEditor initialConfigId={data.id} initialConfigName={data.name} initialConfig={data.config} />
}
