
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all incidents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const incidents = await prisma.incident.findMany({
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ incidents })

  } catch (error) {
    console.error('Incidents GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    )
  }
}

// POST create new incident
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, severity, confidence } = body

    if (!title || !severity || !confidence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        severity,
        confidence,
        status: 'NEW'
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'CREATE',
        resource: 'incidents',
        resourceId: incident.id,
        changes: { title, severity }
      }
    })

    return NextResponse.json({ incident }, { status: 201 })

  } catch (error) {
    console.error('Incident POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    )
  }
}
