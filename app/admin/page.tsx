
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  Server, 
  Clock,
  ArrowRight,
  BarChart3,
  Zap,
  Settings,
  FileText,
  Bell,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Workflow,
} from 'lucide-react'
import Link from 'next/link'

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'High':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'Low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Investigating':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'Contained':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'Resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession() || {}
  const [stats, setStats] = useState({
    activeAlerts: 0,
    connectedDevices: 0,
    eventsToday: 0,
    avgResponseTime: '0m',
    recentIncidents: [] as any[],
    activeWorkflows: 0,
    pendingReports: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data from multiple endpoints in parallel
        const [alertsRes, devicesRes, incidentsRes, workflowsRes] = await Promise.all([
          fetch('/api/security/alerts?limit=5'),
          fetch('/api/security/devices?status=ACTIVE'),
          fetch('/api/security/incidents?status=OPEN&limit=3'),
          fetch('/api/workflows/playbooks?status=ACTIVE'),
        ])

        const alerts = await alertsRes.json()
        const devices = await devicesRes.json()
        const incidents = await incidentsRes.json()
        const workflows = await workflowsRes.json()

        setStats({
          activeAlerts: Array.isArray(alerts) ? alerts.filter((a: any) => a.status === 'OPEN').length : 0,
          connectedDevices: Array.isArray(devices) ? devices.length : 0,
          eventsToday: Array.isArray(alerts) ? alerts.length * 12 : 0, // Simulated
          avgResponseTime: '2.3m',
          recentIncidents: Array.isArray(incidents) ? incidents.slice(0, 3) : [],
          activeWorkflows: Array.isArray(workflows) ? workflows.length : 0,
          pendingReports: 3, // Simulated
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const dashboardStats = [
    {
      title: 'Active Alerts',
      value: stats.activeAlerts.toString(),
      change: 'Requires attention',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      href: '/admin/alerts',
    },
    {
      title: 'Connected Devices',
      value: stats.connectedDevices.toString(),
      change: 'All operational',
      icon: Server,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/admin/devices',
    },
    {
      title: 'Events Today',
      value: stats.eventsToday.toLocaleString(),
      change: 'Real-time monitoring',
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/admin/security-dashboard',
    },
    {
      title: 'Response Time',
      value: stats.avgResponseTime,
      change: 'Average response',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/admin/analytics',
    },
  ]

  const quickActions = [
    { 
      title: 'AI Rule Generator', 
      description: 'Create detection rules with AI',
      icon: Sparkles,
      href: '/admin/ai-hub/rule-generator',
      color: 'text-purple-500',
    },
    { 
      title: 'Run Workflow', 
      description: 'Execute security playbook',
      icon: Workflow,
      href: '/admin/workflows',
      color: 'text-blue-500',
    },
    { 
      title: 'Generate Report', 
      description: 'Create security report',
      icon: BarChart3,
      href: '/admin/reports/generate',
      color: 'text-green-500',
    },
    { 
      title: 'Manage Integrations', 
      description: 'Configure security tools',
      icon: Settings,
      href: '/admin/integrations',
      color: 'text-orange-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
          Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's your security operations overview. Monitor threats, manage incidents, and oversee your infrastructure.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Incidents */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Recent Incidents</span>
                </CardTitle>
                <Link href="/admin/incidents">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Latest security incidents requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentIncidents.length > 0 ? (
                stats.recentIncidents.map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">#{incident.id}</span>
                        <Badge className={`${getSeverityColor(incident.severity)} border-0 text-xs`}>
                          {incident.severity}
                        </Badge>
                        <Badge className={`${getStatusColor(incident.status)} border-0 text-xs`}>
                          {incident.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-1">{incident.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Assigned to {incident.assignedTo || 'Unassigned'}</span>
                        <span>{new Date(incident.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <Link href={`/admin/incidents`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">No active incidents</p>
                  <p className="text-sm text-muted-foreground">Your security operations are running smoothly</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>System Status</span>
              </CardTitle>
              <CardDescription>
                Security platform health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">AI Detection</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Threat Intel</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Workflows</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                  {stats.activeWorkflows} Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Integrations</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stats.connectedDevices} Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Bell className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Alert Generated</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Workflow className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Workflow Completed</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Server className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Device Connected</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common security operations and management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-all w-full group"
                >
                  <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
