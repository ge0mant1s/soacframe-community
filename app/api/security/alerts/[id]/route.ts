
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET single alert
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alert = await prisma.securityAlert.findUnique({
      where: { id: params.id }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({ alert })

  } catch (error) {
    console.error('Alert GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

// PATCH update alert (status, assignment, etc.)
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
    const { status, assignedTo, falsePositive } = body

    const existing = await prisma.securityAlert.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (status) updateData.status = status
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (falsePositive !== undefined) updateData.falsePositive = falsePositive
    if (status === 'RESOLVED') updateData.resolvedAt = new Date()

    const alert = await prisma.securityAlert.update({
      where: { id: params.id },
      data: updateData
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'UPDATE',
        resource: 'alerts',
        resourceId: params.id,
        changes: updateData
      }
    })

    return NextResponse.json({ alert })

  } catch (error) {
    console.error('Alert PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// DELETE alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alert = await prisma.securityAlert.findUnique({
      where: { id: params.id }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    await prisma.securityAlert.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'DELETE',
        resource: 'alerts',
        resourceId: params.id,
        changes: { title: alert.title }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Alert DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
