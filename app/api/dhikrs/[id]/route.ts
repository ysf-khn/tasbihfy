import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const updateDhikrSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetCount: z.number().int().min(1).max(10000).optional(),
  isFavorite: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dhikr = await prisma.dhikr.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        sessions: {
          orderBy: { startedAt: 'desc' }
        }
      }
    })

    if (!dhikr) {
      return NextResponse.json({ error: 'Dhikr not found' }, { status: 404 })
    }

    return NextResponse.json(dhikr)
  } catch (error) {
    console.error('Error fetching dhikr:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData = updateDhikrSchema.parse(body)

    const dhikr = await prisma.dhikr.updateMany({
      where: { 
        id,
        userId: session.user.id 
      },
      data: updateData
    })

    if (dhikr.count === 0) {
      return NextResponse.json({ error: 'Dhikr not found' }, { status: 404 })
    }

    const updatedDhikr = await prisma.dhikr.findUnique({
      where: { id }
    })

    return NextResponse.json(updatedDhikr)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating dhikr:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'toggleFavorite') {
      const dhikr = await prisma.dhikr.findFirst({
        where: { id, userId: session.user.id }
      })

      if (!dhikr) {
        return NextResponse.json({ error: 'Dhikr not found' }, { status: 404 })
      }

      const updated = await prisma.dhikr.update({
        where: { id },
        data: { isFavorite: !dhikr.isFavorite }
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating dhikr:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleted = await prisma.dhikr.deleteMany({
      where: { 
        id,
        userId: session.user.id 
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Dhikr not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting dhikr:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}