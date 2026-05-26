import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(vendors)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const vendor = await prisma.vendor.create({ data: body })
  return NextResponse.json(vendor)
}
