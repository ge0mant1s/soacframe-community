
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/notifications/channels - List all notification channels
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channels = await prisma.notificationChannel.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}

// POST /api/notifications/channels - Create notification channel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, config, filters } = body

    // Validate channel configuration
    if (!name || !type || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const channel = await prisma.notificationChannel.create({
      data: {
        name,
        type,
        config,
        filters: filters || {},
        status: 'active',
      },
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}

// PATCH /api/notifications/channels - Update channel
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
    }

    const channel = await prisma.notificationChannel.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error updating channel:', error)
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
  }
}

// DELETE /api/notifications/channels?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
    }

    await prisma.notificationChannel.delete({ where: { id } })

    return NextResponse.json({ message: 'Channel deleted successfully' })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }
}
