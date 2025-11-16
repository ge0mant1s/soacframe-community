
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all alerts with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (severity) where.severity = severity
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const alerts = await prisma.securityAlert.findMany({
      where,
      orderBy: [
        { severity: 'desc' }, // CRITICAL first
        { createdAt: 'desc' }
      ],
      take: 100 // Limit for performance
    })

    return NextResponse.json({ alerts })

  } catch (error) {
    console.error('Alerts GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// POST create new alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      severity,
      source,
      sourceType,
      category,
      indicators,
      mitreAttack,
      rawData
    } = body

    if (!title || !severity || !source || !sourceType || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const alert = await prisma.securityAlert.create({
      data: {
        title,
        description,
        severity,
        source,
        sourceType,
        category,
        indicators,
        mitreAttack,
        rawData,
        status: 'OPEN'
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'CREATE',
        resource: 'alerts',
        resourceId: alert.id,
        changes: { title, severity, source }
      }
    })

    return NextResponse.json({ alert }, { status: 201 })

  } catch (error) {
    console.error('Alert POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
