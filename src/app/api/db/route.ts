export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ok = (d: unknown) => NextResponse.json(d)
const err = (msg: string, s = 400) => NextResponse.json({ error: msg }, { status: s })

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t')
  try {
    switch (t) {
      case 'guests': return ok(await prisma.guest.findMany({ orderBy: { name: 'asc' } }))
      case 'guest-stats': {
        const [total, attending, declined, pending] = await Promise.all([
          prisma.guest.count(),
          prisma.guest.count({ where: { rsvpStatus: 'attending' } }),
          prisma.guest.count({ where: { rsvpStatus: 'declined' } }),
          prisma.guest.count({ where: { rsvpStatus: 'pending' } }),
        ])
        return ok({ total, attending, declined, pending })
      }
      case 'venues': return ok(await prisma.venue.findMany({ orderBy: { createdAt: 'desc' } }))
      case 'budget': return ok(await prisma.budgetCategory.findMany({ orderBy: { order: 'asc' } }))
      case 'vendors': return ok(await prisma.vendor.findMany({ orderBy: { createdAt: 'desc' } }))
      case 'tasks': return ok(await prisma.task.findMany({ orderBy: { createdAt: 'desc' } }))
      case 'tables': return ok(await prisma.seatingTable.findMany({ orderBy: { createdAt: 'asc' } }))
      case 'gifts': return ok(await prisma.gift.findMany({ orderBy: { createdAt: 'desc' } }))
      case 'timeline': return ok(await prisma.timelineItem.findMany({ orderBy: { order: 'asc' } }))
      case 'rsvp-settings': {
        // Auto-add new columns if missing
        await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT NOT NULL DEFAULT '#8fb882'`).catch(()=>{})
        await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "bgColor" TEXT NOT NULL DEFAULT '#111714'`).catch(()=>{})
        await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "tertiaryColor" TEXT NOT NULL DEFAULT '#1a2419'`).catch(()=>{})
        await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo1" TEXT NOT NULL DEFAULT ''`).catch(()=>{})
        await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo2" TEXT NOT NULL DEFAULT ''`).catch(()=>{})
        await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo3" TEXT NOT NULL DEFAULT ''`).catch(()=>{})
        let s = await prisma.rsvpSettings.findUnique({ where: { id: 'main' } })
        if (!s) s = await prisma.rsvpSettings.create({ data: { id: 'main' } })
        return ok(s)
      }
      default: return err('unknown type')
    }
  } catch (e) { return err(String(e), 500) }
}

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t')
  const body = await req.json()
  try {
    switch (t) {
      case 'guest':
        return ok(await prisma.guest.create({ data: {
          name: body.name, email: body.email || null, side: body.side || 'bride',
          hasPlusOne: !!body.hasPlusOne, dietary: body.dietary || null, rsvpStatus: 'pending',
          notes: body.notes || null, isInvitee: true, // manually added guests are always invitees
          ...(body.address !== undefined ? { address: body.address || '' } : {})
        }}))
      case 'venue':
        return ok(await prisma.venue.create({ data: {
          name: body.name, url: body.url || '', imageUrl: body.imageUrl || '',
          cost: body.cost || 0, address: body.address || '', description: body.description || '',
          capacity: body.capacity || null, phone: body.phone || '', email: body.email || '',
          website: body.website || '', amenities: body.amenities || [], notes: body.notes || '',
        }}))
      case 'venue-select': {
        await prisma.venue.updateMany({ data: { isSelected: false } })
        return ok(await prisma.venue.update({ where: { id: body.id }, data: { isSelected: true } }))
      }
      case 'budget':
        return ok(await prisma.budgetCategory.create({ data: { name: body.name, budgeted: 0, paid: 0, color: body.color || '#8FAF7A', order: body.order || 0 } }))
      case 'vendor': {
        const vendor = await prisma.vendor.create({ data: {
          name: body.name, category: body.category || 'Other', contactName: body.contactName || '',
          phone: body.phone || '', email: body.email || '', website: body.website || '',
          cost: body.cost || 0, paid: 0, status: 'researching', notes: body.notes || '',
        }})
        if (vendor.cost > 0) {
          const cat = await prisma.budgetCategory.findFirst({ where: { name: { contains: vendor.category, mode: 'insensitive' } } })
          if (cat) await prisma.budgetCategory.update({ where: { id: cat.id }, data: { budgeted: { increment: vendor.cost } } })
        }
        return ok(vendor)
      }
      case 'task':
        return ok(await prisma.task.create({ data: {
          title: body.title, category: body.category || 'General',
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          priority: body.priority || 'medium', completed: false, assignedTo: body.assignedTo || 'Both',
        }}))
      case 'table':
        return ok(await prisma.seatingTable.create({ data: { name: body.name, shape: body.shape || 'round', seats: body.seats || 8, x: body.x || 100, y: body.y || 100, color: body.color || '#E1F5EE' } }))
      case 'gift':
        return ok(await prisma.gift.create({ data: { fromName: body.fromName, description: body.description || '', value: body.value || null, thankYouSent: false, receivedAt: body.receivedAt ? new Date(body.receivedAt) : null } }))
      case 'timeline-item':
        return ok(await prisma.timelineItem.create({ data: { title: body.title, time: body.time || '', desc: body.desc || '', who: body.who || '', order: body.order || 0 } }))
      case 'scrape': {
        const { url } = body
        const html = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }).then(r => r.text())
        const meta = (prop: string) => html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'))?.[1]?.trim() || ''
        const title = meta('og:title') || html.match(/<h1[^>]*>([^<]+)/i)?.[1]?.trim() || html.match(/<title>([^<]+)/i)?.[1]?.split(/[|\-]/)[0]?.trim() || ''
        const image = meta('og:image') || ''
        const desc = meta('og:description') || meta('description') || ''
        const phone = html.replace(/<[^>]+>/g, ' ').match(/(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/)?.[0] || ''
        const addr = html.replace(/<[^>]+>/g, ' ').match(/\d+\s+\w[\w\s]+(?:Street|St|Ave|Road|Rd|Blvd|Drive|Dr|Lane|Ln)[,\s]+\w[\w\s]+,\s*[A-Z]{2}/)?.[0] || ''
        const resolveImg = (u: string) => u.startsWith('http') ? u : u ? new URL(u, url).href : ''
        return ok({ name: title.slice(0, 100), imageUrl: resolveImg(image), description: desc.slice(0, 800), address: addr, phone, website: url })
      }
      default: return err('unknown type')
    }
  } catch (e) { return err(String(e), 500) }
}

export async function PATCH(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t')
  const body = await req.json()
  const { id, ...data } = body
  try {
    switch (t) {
      case 'guest': return ok(await prisma.guest.update({ where: { id }, data }))
      case 'venue': return ok(await prisma.venue.update({ where: { id }, data }))
      case 'budget': return ok(await prisma.budgetCategory.update({ where: { id }, data }))
      case 'vendor': {
        const oldVendor = await prisma.vendor.findUnique({ where: { id } })
        const updated = await prisma.vendor.update({ where: { id }, data })
        if (data.status === 'paid' && oldVendor?.status !== 'paid' && updated.cost > 0) {
          const cat = await prisma.budgetCategory.findFirst({ where: { name: { contains: updated.category, mode: 'insensitive' } } })
          if (cat) await prisma.budgetCategory.update({ where: { id: cat.id }, data: { paid: { increment: updated.cost } } })
        }
        if (oldVendor?.status === 'paid' && data.status && data.status !== 'paid' && updated.cost > 0) {
          const cat = await prisma.budgetCategory.findFirst({ where: { name: { contains: updated.category, mode: 'insensitive' } } })
          if (cat) await prisma.budgetCategory.update({ where: { id: cat.id }, data: { paid: { decrement: updated.cost } } })
        }
        return ok(updated)
      }
      case 'task': return ok(await prisma.task.update({ where: { id }, data }))
      case 'table': return ok(await prisma.seatingTable.update({ where: { id }, data }))
      case 'gift': return ok(await prisma.gift.update({ where: { id }, data }))
      case 'timeline-item': return ok(await prisma.timelineItem.update({ where: { id }, data }))
      case 'rsvp-settings': {
        // Only pass known fields to avoid errors from missing columns
        const allowed = ['accentColor','secondaryColor','bgColor','tertiaryColor','titleColor','subheaderColor','bodyColor','brideName','groomName','heroImage','photo1','photo2','photo3','swatchBridesmaids','swatchSuits','swatchVenue','swatchFlowers','heroImage','photo1','photo2','photo3','heading','subheading','dateText','venueText','searchLabel','attendingLabel','declineLabel','confirmedMessage','declinedMessage','contactEmail','weddingDate','coupleNames','ourStory','dressCode','dressCodeNote','ceremonyTime','receptionTime']
        const safe: Record<string,unknown> = {}
        for (const k of allowed) { if (k in data) safe[k] = data[k] }
        // Remap JS camelCase keys to actual DB column names where they differ
        const fieldMap: Record<string,string> = {
          heroImage: 'hero_image', dateText: 'date_text', venueText: 'venue_text',
          searchLabel: 'search_label', attendingLabel: 'attending_label',
          declineLabel: 'decline_label', confirmedMessage: 'confirmed_message',
          declinedMessage: 'declined_message', contactEmail: 'contact_email',
          weddingDate: 'wedding_date',
        }
        const remapped: Record<string,unknown> = {}
        for (const [k,v] of Object.entries(safe)) { remapped[fieldMap[k] || k] = v }
        // Try full upsert first, fall back to raw SQL for new columns
        try {
          return ok(await prisma.rsvpSettings.upsert({ where: { id: 'main' }, update: safe, create: { id: 'main', ...safe } }))
        } catch (e: unknown) { console.error('upsert error', e);
          // Columns may not exist yet - run migration then retry
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT NOT NULL DEFAULT '#8fb882'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "bgColor" TEXT NOT NULL DEFAULT '#111714'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "tertiaryColor" TEXT NOT NULL DEFAULT '#1a2419'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo1" TEXT NOT NULL DEFAULT ''`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo2" TEXT NOT NULL DEFAULT ''`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo3" TEXT NOT NULL DEFAULT ''`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "titleColor" TEXT NOT NULL DEFAULT '#ffffff'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "subheaderColor" TEXT NOT NULL DEFAULT '#000000'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "bodyColor" TEXT NOT NULL DEFAULT '#9ca3af'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "swatchBridesmaids" TEXT NOT NULL DEFAULT '#9bb89a'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "swatchSuits" TEXT NOT NULL DEFAULT '#4a5568'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "swatchVenue" TEXT NOT NULL DEFAULT '#8b7355'`)
          await prisma.$executeRawUnsafe(`ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "swatchFlowers" TEXT NOT NULL DEFAULT '#e8b4bc'`)
          return ok(await prisma.rsvpSettings.upsert({ where: { id: 'main' }, update: safe, create: { id: 'main', ...safe } }))
        }
      }
      default: return err('unknown type')
    }
  } catch (e) { return err(String(e), 500) }
}

export async function DELETE(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t')
  const id = req.nextUrl.searchParams.get('id')!
  try {
    switch (t) {
      case 'guest': await prisma.guest.delete({ where: { id } }); break
      case 'venue': await prisma.venue.delete({ where: { id } }); break
      case 'budget': await prisma.budgetCategory.delete({ where: { id } }); break
      case 'vendor': await prisma.vendor.delete({ where: { id } }); break
      case 'task': await prisma.task.delete({ where: { id } }); break
      case 'table': await prisma.seatingTable.delete({ where: { id } }); break
      case 'gift': await prisma.gift.delete({ where: { id } }); break
      case 'timeline-item': await prisma.timelineItem.delete({ where: { id } }); break
      default: return err('unknown type')
    }
    return ok({ ok: true })
  } catch (e) { return err(String(e), 500) }
}
