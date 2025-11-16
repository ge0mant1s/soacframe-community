
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  TrendingUp, 
  Server, 
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Target,
  Zap,
  Eye,
  Database
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface DashboardMetrics {
  alerts: {
    total: number
    critical: number
    high: number
    open: number
    resolved: number
  }
  incidents: {
    total: number
    active: number
    resolved: number
    avgResolutionTime: number
  }
  integrations: {
    total: number
    connected: number
    disconnected: number
    syncing: number
  }
  devices: {
    total: number
    online: number
    offline: number
    compromised: number
  }
  securityScore: number
  threatLevel: string
  recentActivity: Array<{
    id: string
    type: string
    message: string
    severity: string
    timestamp: string
  }>
}

export default function SecurityDashboard() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
      // Refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [status, timeRange])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/security/dashboard?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-black',
      LOW: 'bg-blue-500 text-white',
      INFO: 'bg-gray-500 text-white'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-500 text-white'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time security posture and threat intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Score & Threat Level */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Security Posture Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{metrics.securityScore}</span>
                <span className="text-muted-foreground mb-1">/100</span>
              </div>
              <Progress value={metrics.securityScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {metrics.securityScore >= 80 ? 'Excellent' : metrics.securityScore >= 60 ? 'Good' : metrics.securityScore >= 40 ? 'Fair' : 'Needs Attention'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Current Threat Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold ${getThreatLevelColor(metrics.threatLevel)}`}>
                {metrics.threatLevel.toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.alerts.critical} critical alerts require immediate attention
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.alerts.open}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.alerts.critical} critical, {metrics.alerts.high} high
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="text-xs">
                Total: {metrics.alerts.total}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.incidents.active}</div>
            <p className="text-xs text-muted-foreground">
              Avg resolution: {metrics.incidents.avgResolutionTime}h
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="text-xs">
                Resolved: {metrics.incidents.resolved}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.integrations.connected}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.integrations.total} connected
            </p>
            <div className="mt-2 flex gap-2">
              {metrics.integrations.disconnected > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.integrations.disconnected} offline
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored Devices</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.devices.online}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.devices.total} online
            </p>
            <div className="mt-2 flex gap-2">
              {metrics.devices.compromised > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.devices.compromised} compromised
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
          <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
          <TabsTrigger value="integrations">Integration Status</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>Latest events across all security tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded ${
                        activity.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                        activity.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'ALERT' ? <Bell className="h-4 w-4" /> :
                         activity.type === 'INCIDENT' ? <AlertTriangle className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={getSeverityBadge(activity.severity)}>
                        {activity.severity}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Security Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>View detailed alerts in the Alerts page</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/admin/alerts')}
                >
                  View All Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
              <CardDescription>Ongoing security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>View detailed incidents in the Incidents page</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/admin/incidents')}
                >
                  View All Incidents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Health</CardTitle>
              <CardDescription>Security tool connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Manage integrations in the Integrations page</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/admin/integrations')}
                >
                  Manage Integrations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/alerts')}
            >
              <Bell className="h-4 w-4 mr-2" />
              View Alerts
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/incidents')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Manage Incidents
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/integrations')}
            >
              <Database className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/devices')}
            >
              <Server className="h-4 w-4 mr-2" />
              Monitor Devices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
