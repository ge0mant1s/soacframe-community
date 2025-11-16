
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  Search,
  Eye,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SecurityAlert {
  id: string
  title: string
  description: string | null
  severity: string
  status: string
  source: string
  sourceType: string
  category: string
  indicators: any
  mitreAttack: any
  incidentId: string | null
  assignedTo: string | null
  falsePositive: boolean
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export default function AlertsPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    search: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchAlerts()
    }
  }, [status, router])

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.severity !== 'all') params.append('severity', filters.severity)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/security/alerts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Alert status updated')
        fetchAlerts()
        if (selectedAlert?.id === alertId) {
          setSelectedAlert({ ...selectedAlert, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Failed to update alert:', error)
      toast.error('Failed to update alert')
    }
  }

  const handleMarkFalsePositive = async (alertId: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'FALSE_POSITIVE',
          falsePositive: true 
        })
      })

      if (response.ok) {
        toast.success('Marked as false positive')
        fetchAlerts()
        if (selectedAlert?.id === alertId) {
          setSelectedAlert(null)
        }
      }
    } catch (error) {
      console.error('Failed to mark false positive:', error)
      toast.error('Failed to update alert')
    }
  }

  const handleCreateIncident = async (alertId: string) => {
    // In production, this would navigate to incident creation with pre-filled data
    toast.success('Creating incident from alert...')
    router.push(`/admin/incidents?from-alert=${alertId}`)
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-black',
      LOW: 'bg-blue-500 text-white',
      INFO: 'bg-gray-500 text-white'
    }
    return colors[severity] || 'bg-gray-500 text-white'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-800 border-red-200',
      ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      INVESTIGATING: 'bg-blue-100 text-blue-800 border-blue-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      FALSE_POSITIVE: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false
    if (filters.status !== 'all' && alert.status !== filters.status) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        alert.title.toLowerCase().includes(searchLower) ||
        alert.source.toLowerCase().includes(searchLower) ||
        alert.category.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Real-time threat detection and response
          </p>
        </div>
        <Button onClick={fetchAlerts} variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.status === 'OPEN').length}
            </div>
            <p className="text-xs text-muted-foreground">Open Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {alerts.filter(a => a.severity === 'CRITICAL').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter(a => a.status === 'INVESTIGATING').length}
            </div>
            <p className="text-xs text-muted-foreground">Investigating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.status === 'RESOLVED').length}
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(alert.status)}>
                        {alert.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline">{alert.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{alert.title}</h3>
                    {alert.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alert.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Source: {alert.source}</span>
                      <span>•</span>
                      <span>Type: {alert.sourceType}</span>
                      <span>•</span>
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAlert(alert)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground text-center">
                {filters.search || filters.severity !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Security alerts will appear here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                  {selectedAlert.title}
                </DialogTitle>
                <DialogDescription>
                  Alert ID: {selectedAlert.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedAlert.status === 'ACKNOWLEDGED' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedAlert.id, 'ACKNOWLEDGED')}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedAlert.status === 'INVESTIGATING' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedAlert.id, 'INVESTIGATING')}
                    >
                      Investigate
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedAlert.status === 'RESOLVED' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedAlert.id, 'RESOLVED')}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkFalsePositive(selectedAlert.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      False Positive
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {selectedAlert.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="mt-2 text-sm">{selectedAlert.description}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Source</label>
                    <p className="text-sm text-muted-foreground">{selectedAlert.source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Source Type</label>
                    <p className="text-sm text-muted-foreground">{selectedAlert.sourceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-sm text-muted-foreground">{selectedAlert.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* MITRE ATT&CK */}
                {selectedAlert.mitreAttack && (
                  <div>
                    <label className="text-sm font-medium">MITRE ATT&CK Mapping</label>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(selectedAlert.mitreAttack, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Indicators */}
                {selectedAlert.indicators && (
                  <div>
                    <label className="text-sm font-medium">Indicators of Compromise</label>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(selectedAlert.indicators, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleCreateIncident(selectedAlert.id)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Create Incident
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAlert(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
