
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/analytics/trends - Time-series trend analysis
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metricType = searchParams.get('metricType') || 'alerts'
    const timeRange = searchParams.get('timeRange') || '7d'
    const interval = searchParams.get('interval') || 'daily'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
    }

    let data: any[] = []
    let trends: any = {}

    // Get trend data based on metric type
    switch (metricType) {
      case 'alerts':
        data = await getAlertTrends(startDate, endDate, interval)
        trends = calculateTrends(data)
        break
      
      case 'incidents':
        data = await getIncidentTrends(startDate, endDate, interval)
        trends = calculateTrends(data)
        break
      
      case 'devices':
        data = await getDeviceHealthTrends(startDate, endDate, interval)
        trends = calculateTrends(data)
        break
      
      case 'integrations':
        data = await getIntegrationTrends(startDate, endDate, interval)
        trends = calculateTrends(data)
        break
    }

    return NextResponse.json({
      metricType,
      timeRange,
      interval,
      data,
      trends,
      predictions: generatePredictions(data, 3), // Predict next 3 periods
      anomalies: detectAnomalies(data),
    })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}

async function getAlertTrends(startDate: Date, endDate: Date, interval: string) {
  const alerts = await prisma.securityAlert.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      severity: true,
      status: true,
    },
  })

  return aggregateByInterval(alerts, interval, 'createdAt')
}

async function getIncidentTrends(startDate: Date, endDate: Date, interval: string) {
  const incidents = await prisma.incident.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      severity: true,
      status: true,
    },
  })

  return aggregateByInterval(incidents, interval, 'createdAt')
}

async function getDeviceHealthTrends(startDate: Date, endDate: Date, interval: string) {
  const metrics = await prisma.deviceMetric.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
      metricType: 'health_score',
    },
    select: {
      timestamp: true,
      value: true,
      deviceId: true,
    },
  })

  return aggregateByInterval(metrics, interval, 'timestamp')
}

async function getIntegrationTrends(startDate: Date, endDate: Date, interval: string) {
  const integrations = await prisma.integration.findMany({
    select: {
      eventsIngested: true,
      alertsGenerated: true,
      errorCount: true,
      updatedAt: true,
    },
  })

  // Transform integration data to time-series format
  return integrations.map((i) => ({
    timestamp: i.updatedAt,
    count: i.eventsIngested,
    alerts: i.alertsGenerated,
    errors: i.errorCount,
  }))
}

function aggregateByInterval(data: any[], interval: string, timeField: string): any[] {
  const grouped = new Map<string, any>()

  data.forEach((item) => {
    const date = new Date(item[timeField])
    let key: string

    switch (interval) {
      case 'hourly':
        key = date.toISOString().slice(0, 13) + ':00:00'
        break
      case 'daily':
        key = date.toISOString().slice(0, 10)
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().slice(0, 10)
        break
      case 'monthly':
        key = date.toISOString().slice(0, 7)
        break
      default:
        key = date.toISOString().slice(0, 10)
    }

    if (!grouped.has(key)) {
      grouped.set(key, { timestamp: key, count: 0, items: [] })
    }

    const group = grouped.get(key)
    group.count++
    group.items.push(item)
  })

  return Array.from(grouped.values()).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  )
}

function calculateTrends(data: any[]) {
  if (data.length < 2) return { direction: 'stable', percentage: 0 }

  const values = data.map((d) => d.count || 0)
  const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3
  const previousAvg =
    values.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 || recentAvg

  const change = ((recentAvg - previousAvg) / previousAvg) * 100

  return {
    direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
    percentage: Math.abs(change).toFixed(1),
    recentAvg: recentAvg.toFixed(1),
    previousAvg: previousAvg.toFixed(1),
  }
}

function generatePredictions(data: any[], periods: number) {
  if (data.length < 3) return []

  const values = data.map((d) => d.count || 0)
  const predictions = []

  // Simple linear regression for prediction
  const n = values.length
  const sumX = (n * (n + 1)) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((acc, val, i) => acc + val * (i + 1), 0)
  const sumXX = (n * (n + 1) * (2 * n + 1)) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  for (let i = 1; i <= periods; i++) {
    const predictedValue = Math.max(0, Math.round(slope * (n + i) + intercept))
    predictions.push({
      period: i,
      value: predictedValue,
      confidence: Math.max(0.5, 1 - i * 0.15), // Decreasing confidence
    })
  }

  return predictions
}

function detectAnomalies(data: any[]): any[] {
  if (data.length < 5) return []

  const values = data.map((d) => d.count || 0)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  const anomalies: any[] = []
  const threshold = 2 // 2 standard deviations

  data.forEach((item, index) => {
    const zScore = Math.abs((item.count - mean) / stdDev)
    if (zScore > threshold) {
      anomalies.push({
        timestamp: item.timestamp,
        value: item.count,
        zScore: zScore.toFixed(2),
        type: item.count > mean ? 'spike' : 'drop',
      })
    }
  })

  return anomalies
}
