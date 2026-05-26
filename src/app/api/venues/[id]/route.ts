import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venue = await prisma.venue.findUnique({ where: { id } })
  if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(venue)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const venue = await prisma.venue.update({ where: { id }, data: body })
  return NextResponse.json(venue)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.venue.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
