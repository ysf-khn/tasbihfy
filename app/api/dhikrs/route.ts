import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const createDhikrSchema = z.object({
  name: z.string().min(1).max(100),
  targetCount: z.number().int().min(1).max(10000)
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dhikrs = await prisma.dhikr.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        sessions: {
          where: { completed: false },
          orderBy: { startedAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json(dhikrs)
  } catch (error) {
    console.error('Error fetching dhikrs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, targetCount } = createDhikrSchema.parse(body)

    const dhikr = await prisma.dhikr.create({
      data: {
        name,
        targetCount,
        userId: session.user.id
      }
    })

    return NextResponse.json(dhikr, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating dhikr:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}