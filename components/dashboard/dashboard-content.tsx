
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  Server, 
  TrendingUp, 
  Settings,
  Bell,
  Search,
  Filter,
  BarChart3,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Home
} from 'lucide-react'

const dashboardStats = [
  {
    title: 'Active Incidents',
    value: '7',
    change: '+2 from yesterday',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    title: 'Connected Devices',
    value: '24',
    change: '100% operational',
    trend: 'stable',
    icon: Server,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Events Today',
    value: '1,247',
    change: '+15% from yesterday',
    trend: 'up',
    icon: Activity,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Response Time',
    value: '2.3m',
    change: '-30s from avg',
    trend: 'down',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

const recentIncidents = [
  {
    id: 'INC-001',
    title: 'Ransomware Detection - LAPTOP01',
    severity: 'Critical',
    status: 'Investigating',
    time: '5 minutes ago',
    assignee: 'John Doe',
  },
  {
    id: 'INC-002', 
    title: 'Data Exfiltration Attempt',
    severity: 'High',
    status: 'Contained',
    time: '15 minutes ago',
    assignee: 'Jane Smith',
  },
  {
    id: 'INC-003',
    title: 'Failed Login Attempts - Admin Account',
    severity: 'Medium',
    status: 'Resolved',
    time: '1 hour ago',
    assignee: 'Mike Johnson',
  },
]

const operationalModels = [
  { name: 'Ransomware', status: 'Active', detections: 3 },
  { name: 'Data Theft', status: 'Active', detections: 2 },
  { name: 'Intrusion', status: 'Active', detections: 1 },
  { name: 'Financial Fraud', status: 'Active', detections: 0 },
  { name: 'DoS Attack', status: 'Active', detections: 1 },
]

export function DashboardContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Investigating':
        return 'bg-yellow-100 text-yellow-800'
      case 'Contained':
        return 'bg-blue-100 text-blue-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold gradient-text">SOaC Framework</span>
              </Link>
              <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>/</span>
                <span>Dashboard</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  alert('Settings: In Phase 2, this will open the full settings panel with user preferences, security configurations, and system settings.')
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase 1 Notice */}
        <div className="mb-8">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Phase 1: Dashboard UI Structure</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This demonstrates the dashboard interface design. Real-time data integration, 
                  incident management, and device monitoring will be implemented in Phase 2.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Security Operations Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor threats, manage incidents, and oversee your security infrastructure.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert('View All Incidents: In Phase 2, this will open the complete incident management interface with filtering, search, and bulk actions.')
                    }}
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Latest security incidents requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">{incident.id}</span>
                        <Badge className={`${getSeverityColor(incident.severity)} border-0 text-xs`}>
                          {incident.severity}
                        </Badge>
                        <Badge className={`${getStatusColor(incident.status)} border-0 text-xs`}>
                          {incident.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-1">{incident.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Assigned to {incident.assignee}</span>
                        <span>{incident.time}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        alert(`Incident ${incident.id}: ${incident.title}\n\nStatus: ${incident.status}\nSeverity: ${incident.severity}\nAssigned to: ${incident.assignee}\nTime: ${incident.time}\n\nIn Phase 2, this would open the full incident details with timeline, evidence, and response actions.`)
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Operational Models Status */}
          <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>Operational Models</span>
                </CardTitle>
                <CardDescription>
                  Detection model status and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {operationalModels.map((model, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">{model.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {model.detections} today
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dashboard Visual */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span>Real-time Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="https://static.abacusaicdn.net/images/108835e2-a8e5-40be-b988-d26638a55cdc.png"
                    alt="Real-time Security Dashboard"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs text-white/90">
                      Live security metrics and threat visualization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common security operations and management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Add Device', description: 'Connect new security device', icon: Server },
                  { title: 'Create Rule', description: 'Add custom detection rule', icon: Settings },
                  { title: 'Run Playbook', description: 'Execute response playbook', icon: Zap },
                  { title: 'Generate Report', description: 'Create security report', icon: BarChart3 },
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-primary/5"
                    onClick={() => {
                      alert(`${action.title}: ${action.description}\n\nIn Phase 2, this would open the corresponding management interface with full functionality.`)
                    }}
                  >
                    <action.icon className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
