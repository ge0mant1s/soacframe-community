
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET single integration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integration = await prisma.integration.findUnique({
      where: { id: params.id }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    const { apiKey, credentials, ...sanitized } = integration

    return NextResponse.json({ integration: sanitized })

  } catch (error) {
    console.error('Integration GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    )
  }
}

// PUT update integration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, endpoint, apiKey, syncInterval, config } = body

    const existing = await prisma.integration.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Parse config JSON
    let parsedConfig = existing.config
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

    const updateData: any = {
      name: name || existing.name,
      type: type || existing.type,
      endpoint: endpoint || existing.endpoint,
      syncInterval: syncInterval || existing.syncInterval,
      config: parsedConfig
    }

    // Only update API key if provided
    if (apiKey) {
      updateData.apiKey = apiKey // Should be encrypted in production
    }

    const integration = await prisma.integration.update({
      where: { id: params.id },
      data: updateData
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'UPDATE',
        resource: 'integrations',
        resourceId: integration.id,
        changes: updateData
      }
    })

    const { apiKey: _, ...sanitized } = integration

    return NextResponse.json({ integration: sanitized })

  } catch (error) {
    console.error('Integration PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

// DELETE integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integration = await prisma.integration.findUnique({
      where: { id: params.id }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    await prisma.integration.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userEmail: session.user.email || '',
        action: 'DELETE',
        resource: 'integrations',
        resourceId: params.id,
        changes: { name: integration.name }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Integration DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
