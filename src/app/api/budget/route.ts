import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cats = await prisma.budgetCategory.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const cat = await prisma.budgetCategory.create({ data: body })
  return NextResponse.json(cat)
}
