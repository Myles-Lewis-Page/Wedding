import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const gifts = await prisma.gift.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(gifts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { from_name, received_at, thank_you_sent, ...rest } = body
  const gift = await prisma.gift.create({
    data: { ...rest, fromName: from_name, thankYouSent: thank_you_sent ?? false, receivedAt: received_at ? new Date(received_at) : null }
  })
  return NextResponse.json(gift)
}
