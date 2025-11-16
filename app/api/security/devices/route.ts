
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all devices with metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const devices = await prisma.device.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Generate mock metrics for each device
    // In production, this would fetch real metrics from monitoring systems
    const metrics: Record<string, any> = {}
    
    for (const device of devices) {
      metrics[device.id] = {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 500),
        threats: device.status === 'active' ? Math.floor(Math.random() * 3) : 0
      }
    }

    // Don't send credentials to client
    const sanitized = devices.map(({ credentials, ...rest }) => rest)

    return NextResponse.json({ devices: sanitized, metrics })

  } catch (error) {
    console.error('Devices GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    )
  }
}
