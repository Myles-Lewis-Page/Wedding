import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { due_date, dueDate, ...rest } = body
  const task = await prisma.task.create({
    data: { ...rest, dueDate: due_date || dueDate ? new Date(due_date || dueDate) : null }
  })
  return NextResponse.json(task)
}
