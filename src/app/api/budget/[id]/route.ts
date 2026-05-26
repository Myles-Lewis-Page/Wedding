import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const cat = await prisma.budgetCategory.update({ where: { id }, data: body })
  return NextResponse.json(cat)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.budgetCategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
