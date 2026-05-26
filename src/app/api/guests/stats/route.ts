import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [total, attending, declined, pending] = await Promise.all([
    prisma.guest.count(),
    prisma.guest.count({ where: { rsvpStatus: 'attending' } }),
    prisma.guest.count({ where: { rsvpStatus: 'declined' } }),
    prisma.guest.count({ where: { rsvpStatus: 'pending' } }),
  ])
  return NextResponse.json({ total, attending, declined, pending })
}
