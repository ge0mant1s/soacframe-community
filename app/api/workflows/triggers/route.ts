
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/workflows/triggers - List all triggers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enabled = searchParams.get('enabled')

    const triggers = await prisma.workflowTrigger.findMany({
      where: {
        ...(enabled !== null && { enabled: enabled === 'true' }),
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(triggers)
  } catch (error) {
    console.error('Error fetching triggers:', error)
    return NextResponse.json({ error: 'Failed to fetch triggers' }, { status: 500 })
  }
}

// POST /api/workflows/triggers - Create new trigger
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { name, playbookId, triggerType, conditions, enabled, priority } = body

    const trigger = await prisma.workflowTrigger.create({
      data: {
        name,
        playbookId,
        triggerType,
        conditions,
        enabled: enabled ?? true,
        priority: priority ?? 50,
      },
    })

    return NextResponse.json(trigger, { status: 201 })
  } catch (error) {
    console.error('Error creating trigger:', error)
    return NextResponse.json({ error: 'Failed to create trigger' }, { status: 500 })
  }
}

// PATCH /api/workflows/triggers - Update trigger
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Trigger ID required' }, { status: 400 })
    }

    const trigger = await prisma.workflowTrigger.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(trigger)
  } catch (error) {
    console.error('Error updating trigger:', error)
    return NextResponse.json({ error: 'Failed to update trigger' }, { status: 500 })
  }
}

// DELETE /api/workflows/triggers?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Trigger ID required' }, { status: 400 })
    }

    await prisma.workflowTrigger.delete({ where: { id } })

    return NextResponse.json({ message: 'Trigger deleted successfully' })
  } catch (error) {
    console.error('Error deleting trigger:', error)
    return NextResponse.json({ error: 'Failed to delete trigger' }, { status: 500 })
  }
}
