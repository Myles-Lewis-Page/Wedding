import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(guests)
  } catch (e) {
    console.error('GET /api/guests error:', e)
    return NextResponse.json({ error: 'Database error — check DATABASE_URL is set.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Accept both camelCase and snake_case from the client
    const guest = await prisma.guest.create({
      data: {
        name:           body.name,
        email:          body.email ?? null,
        side:           body.side ?? 'bride',
        hasPlusOne:     body.hasPlusOne ?? body.has_plus_one ?? false,
        dietary:        body.dietary ?? null,
        rsvpStatus:     body.rsvpStatus ?? body.rsvp_status ?? 'pending',
      },
    })
    return NextResponse.json(guest)
  } catch (e) {
    console.error('POST /api/guests error:', e)
    return NextResponse.json({ error: 'Could not create guest. Check DATABASE_URL.' }, { status: 500 })
  }
}
