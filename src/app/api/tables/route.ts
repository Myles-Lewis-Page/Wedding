import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tables = await prisma.seatingTable.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json(tables)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const table = await prisma.seatingTable.create({ data: body })
  return NextResponse.json(table)
}
