import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/dashboard/checkout-configs/import-url-screenshot`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookies().toString() },
        body:    JSON.stringify(body),
      }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
