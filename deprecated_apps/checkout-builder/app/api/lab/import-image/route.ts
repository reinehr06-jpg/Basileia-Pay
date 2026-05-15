import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // Recebe FormData do client e repassa ao Laravel
  const formData = await req.formData()

  const laravelForm = new FormData()
  const image = formData.get('image') as File
  if (!image) return NextResponse.json({ message: 'Imagem não enviada.' }, { status: 400 })
  laravelForm.append('image', image)

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/dashboard/checkout-configs/import-image`,
      {
        method: 'POST',
        headers: { Cookie: cookies().toString() },
        body: laravelForm,
      }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
