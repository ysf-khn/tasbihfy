import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'edge';

const updateSessionSchema = z.object({
  currentCount: z.number().int().min(0),
  completed: z.boolean().optional()
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

    const dhikrSession = await prisma.dhikrSession.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        dhikr: true
      }
    })

    if (!dhikrSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(dhikrSession)
  } catch (error) {
    console.error('Error fetching session:', error)
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
    const { currentCount, completed } = updateSessionSchema.parse(body)

    // Get the session with dhikr info to check completion
    const existingSession = await prisma.dhikrSession.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        dhikr: true
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Auto-determine completion status based on target
    const isCompleted = completed !== undefined 
      ? completed 
      : currentCount >= existingSession.dhikr.targetCount

    const updateData: any = {
      currentCount,
      completed: isCompleted,
      updatedAt: new Date()
    }

    // Set completion time if just completed
    if (isCompleted && !existingSession.completed) {
      updateData.completedAt = new Date()
    }

    const updatedSession = await prisma.dhikrSession.update({
      where: { id },
      data: updateData,
      include: {
        dhikr: true
      }
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}