import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Deselect all, then select this one
  await prisma.venue.updateMany({ data: { isSelected: false } })
  const venue = await prisma.venue.update({ where: { id }, data: { isSelected: true } })
  return NextResponse.json(venue)
}
