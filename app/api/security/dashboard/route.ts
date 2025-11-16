
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    
    // Calculate time window
    const timeWindow = getTimeWindow(timeRange)

    // Fetch alerts metrics
    const [totalAlerts, criticalAlerts, highAlerts, openAlerts, resolvedAlerts] = await Promise.all([
      prisma.securityAlert.count({
        where: { createdAt: { gte: timeWindow } }
      }),
      prisma.securityAlert.count({
        where: { 
          severity: 'CRITICAL',
          createdAt: { gte: timeWindow }
        }
      }),
      prisma.securityAlert.count({
        where: { 
          severity: 'HIGH',
          createdAt: { gte: timeWindow }
        }
      }),
      prisma.securityAlert.count({
        where: { 
          status: { in: ['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING'] },
          createdAt: { gte: timeWindow }
        }
      }),
      prisma.securityAlert.count({
        where: { 
          status: 'RESOLVED',
          createdAt: { gte: timeWindow }
        }
      })
    ])

    // Fetch incidents metrics
    const [totalIncidents, activeIncidents, resolvedIncidents] = await Promise.all([
      prisma.incident.count({
        where: { createdAt: { gte: timeWindow } }
      }),
      prisma.incident.count({
        where: { 
          status: { in: ['NEW', 'ASSIGNED', 'INVESTIGATING', 'CONTAINED'] },
          createdAt: { gte: timeWindow }
        }
      }),
      prisma.incident.count({
        where: { 
          status: { in: ['RESOLVED', 'CLOSED'] },
          createdAt: { gte: timeWindow }
        }
      })
    ])

    // Calculate average resolution time (simplified)
    const avgResolutionTime = 4.5 // In hours - would calculate from actual data

    // Fetch integrations metrics
    const [totalIntegrations, connectedIntegrations, disconnectedIntegrations, syncingIntegrations] = await Promise.all([
      prisma.integration.count(),
      prisma.integration.count({ where: { status: 'CONNECTED' } }),
      prisma.integration.count({ where: { status: 'DISCONNECTED' } }),
      prisma.integration.count({ where: { status: 'SYNCING' } })
    ])

    // Fetch devices metrics
    const [totalDevices, onlineDevices, offlineDevices] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: 'active' } }),
      prisma.device.count({ where: { status: { not: 'active' } } })
    ])

    // Calculate security score (0-100)
    const securityScore = calculateSecurityScore({
      totalAlerts,
      criticalAlerts,
      openAlerts,
      connectedIntegrations,
      totalIntegrations,
      onlineDevices,
      totalDevices
    })

    // Determine threat level
    const threatLevel = criticalAlerts > 5 ? 'CRITICAL' : 
                       criticalAlerts > 2 ? 'HIGH' : 
                       highAlerts > 10 ? 'MEDIUM' : 'LOW'

    // Fetch recent activity
    const recentAlerts = await prisma.securityAlert.findMany({
      where: { createdAt: { gte: timeWindow } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        severity: true,
        createdAt: true
      }
    })

    const recentIncidents = await prisma.incident.findMany({
      where: { createdAt: { gte: timeWindow } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        severity: true,
        createdAt: true
      }
    })

    const recentActivity = [
      ...recentAlerts.map(alert => ({
        id: alert.id,
        type: 'ALERT',
        message: alert.title,
        severity: alert.severity,
        timestamp: alert.createdAt.toISOString()
      })),
      ...recentIncidents.map(incident => ({
        id: incident.id,
        type: 'INCIDENT',
        message: incident.title,
        severity: incident.severity,
        timestamp: incident.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 15)

    const metrics = {
      alerts: {
        total: totalAlerts,
        critical: criticalAlerts,
        high: highAlerts,
        open: openAlerts,
        resolved: resolvedAlerts
      },
      incidents: {
        total: totalIncidents,
        active: activeIncidents,
        resolved: resolvedIncidents,
        avgResolutionTime
      },
      integrations: {
        total: totalIntegrations,
        connected: connectedIntegrations,
        disconnected: disconnectedIntegrations,
        syncing: syncingIntegrations
      },
      devices: {
        total: totalDevices,
        online: onlineDevices,
        offline: offlineDevices,
        compromised: 0 // Would track from actual threat data
      },
      securityScore,
      threatLevel,
      recentActivity
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function getTimeWindow(range: string): Date {
  const now = new Date()
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000)
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
}

function calculateSecurityScore(data: {
  totalAlerts: number
  criticalAlerts: number
  openAlerts: number
  connectedIntegrations: number
  totalIntegrations: number
  onlineDevices: number
  totalDevices: number
}): number {
  let score = 100

  // Penalize for critical alerts (up to -30 points)
  score -= Math.min(data.criticalAlerts * 5, 30)

  // Penalize for open alerts (up to -20 points)
  score -= Math.min(data.openAlerts * 2, 20)

  // Penalize for disconnected integrations (up to -25 points)
  if (data.totalIntegrations > 0) {
    const integrationHealth = (data.connectedIntegrations / data.totalIntegrations) * 100
    score -= (100 - integrationHealth) * 0.25
  }

  // Penalize for offline devices (up to -25 points)
  if (data.totalDevices > 0) {
    const deviceHealth = (data.onlineDevices / data.totalDevices) * 100
    score -= (100 - deviceHealth) * 0.25
  }

  return Math.max(0, Math.round(score))
}
