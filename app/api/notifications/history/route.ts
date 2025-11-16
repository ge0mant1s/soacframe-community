
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/notifications/history - Get notification history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const channelId = searchParams.get('channelId')

    const notifications = await prisma.notification.findMany({
      where: {
        ...(status && { status }),
        ...(channelId && { channelId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notification history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    )
  }
}
