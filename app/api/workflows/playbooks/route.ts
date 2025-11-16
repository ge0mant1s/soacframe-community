
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/workflows/playbooks - List all playbooks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const playbooks = await prisma.playbook.findMany({
      where: {
        ...(category && { category }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(playbooks)
  } catch (error) {
    console.error('Error fetching playbooks:', error)
    return NextResponse.json({ error: 'Failed to fetch playbooks' }, { status: 500 })
  }
}

// POST /api/workflows/playbooks - Create new playbook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, triggerType, triggerConditions, steps, isActive, mitreMapping } = body

    // Create playbook with steps
    const playbook = await prisma.playbook.create({
      data: {
        name,
        description,
        category,
        triggerType,
        triggerConditions,
        isActive: isActive ?? true,
        mitreMapping,
        createdBy: session.user.id,
        steps: {
          create: steps?.map((step: any, index: number) => ({
            stepNumber: index + 1,
            name: step.name,
            actionType: step.actionType,
            config: step.config,
            parameters: step.parameters,
            timeout: step.timeout || 300,
            retryCount: step.retryCount || 0,
            continueOnFail: step.continueOnFail || false,
          })) || [],
        },
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    })

    return NextResponse.json(playbook, { status: 201 })
  } catch (error) {
    console.error('Error creating playbook:', error)
    return NextResponse.json({ error: 'Failed to create playbook' }, { status: 500 })
  }
}

// DELETE /api/workflows/playbooks?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Playbook ID required' }, { status: 400 })
    }

    await prisma.playbook.delete({ where: { id } })

    return NextResponse.json({ message: 'Playbook deleted successfully' })
  } catch (error) {
    console.error('Error deleting playbook:', error)
    return NextResponse.json({ error: 'Failed to delete playbook' }, { status: 500 })
  }
}

// PATCH /api/workflows/playbooks - Update playbook
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Playbook ID required' }, { status: 400 })
    }

    // If steps are included, update them separately
    const { steps, ...playbookUpdates } = updates

    const playbook = await prisma.playbook.update({
      where: { id },
      data: playbookUpdates,
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    })

    // Update steps if provided
    if (steps) {
      // Delete existing steps
      await prisma.workflowStep.deleteMany({ where: { playbookId: id } })

      // Create new steps
      await prisma.workflowStep.createMany({
        data: steps.map((step: any, index: number) => ({
          playbookId: id,
          stepNumber: index + 1,
          name: step.name,
          actionType: step.actionType,
          config: step.config,
          parameters: step.parameters,
          timeout: step.timeout || 300,
          retryCount: step.retryCount || 0,
          continueOnFail: step.continueOnFail || false,
        })),
      })
    }

    return NextResponse.json(playbook)
  } catch (error) {
    console.error('Error updating playbook:', error)
    return NextResponse.json({ error: 'Failed to update playbook' }, { status: 500 })
  }
}
