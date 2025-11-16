
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all integrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await prisma.integration.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Don't send API keys to client
    const sanitized = integrations.map(({ apiKey, credentials, ...rest }) => rest)

    return NextResponse.json({ integrations: sanitized })

  } catch (error) {
    console.error('Integrations GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST create new integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, endpoint, apiKey, syncInterval, config } = body

    if (!name || !type || !endpoint || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse config JSON
    let parsedConfig = {}
    if (config) {
      try {
        parsedConfig = JSON.parse(config)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON in config field' },
          { status: 400 }
        )
      }
    }

    // In production, encrypt the API key before storing
    const integration = await prisma.integration.create({
      data: {
        name,
        type,
        endpoint,
        apiKey, // Should be encrypted in production
        syncInterval: syncInterval || 15,
        config: parsedConfig,
        status: 'DISCONNECTED'
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'CREATE',
        resource: 'integrations',
        resourceId: integration.id,
        changes: { name, type, endpoint }
      }
    })

    const { apiKey: _, ...sanitized } = integration

    return NextResponse.json({ integration: sanitized }, { status: 201 })

  } catch (error) {
    console.error('Integration POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}
