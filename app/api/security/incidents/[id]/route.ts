
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH update incident
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, assignedTo } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    const incident = await prisma.incident.update({
      where: { id: params.id },
      data: updateData
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'UPDATE',
        resource: 'incidents',
        resourceId: params.id,
        changes: updateData
      }
    })

    return NextResponse.json({ incident })

  } catch (error) {
    console.error('Incident PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    )
  }
}
