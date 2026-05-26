import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { thank_you_sent, ...rest } = await req.json()
  const gift = await prisma.gift.update({
    where: { id },
    data: { ...rest, ...(thank_you_sent !== undefined ? { thankYouSent: thank_you_sent } : {}) }
  })
  return NextResponse.json(gift)
}
