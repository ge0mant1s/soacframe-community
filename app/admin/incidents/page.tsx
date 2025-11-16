
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, Plus, Eye, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Incident {
  id: string
  title: string
  description: string | null
  severity: string
  status: string
  confidence: string
  assignedTo: string | null
  entities: any
  events: any
  timeline: any
  createdAt: string
  updatedAt: string
}

export default function IncidentsPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const searchParams = useSearchParams()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'HIGH',
    confidence: 'MEDIUM'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchIncidents()
      
      // Check if creating incident from alert
      const fromAlert = searchParams?.get('from-alert')
      if (fromAlert) {
        setDialogOpen(true)
      }
    }
  }, [status, router, searchParams])

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/security/incidents')
      if (response.ok) {
        const data = await response.json()
        setIncidents(data.incidents || [])
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
      toast.error('Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/security/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Incident created')
        setDialogOpen(false)
        resetForm()
        fetchIncidents()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create incident')
      }
    } catch (error) {
      console.error('Failed to create incident:', error)
      toast.error('Failed to create incident')
    }
  }

  const handleStatusChange = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/security/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Incident status updated')
        fetchIncidents()
      }
    } catch (error) {
      console.error('Failed to update incident:', error)
      toast.error('Failed to update incident')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'HIGH',
      confidence: 'MEDIUM'
    })
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-black',
      LOW: 'bg-blue-500 text-white'
    }
    return colors[severity] || 'bg-gray-500 text-white'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-red-100 text-red-800 border-red-200',
      ASSIGNED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      INVESTIGATING: 'bg-blue-100 text-blue-800 border-blue-200',
      CONTAINED: 'bg-purple-100 text-purple-800 border-purple-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and respond to security incidents
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.status === 'NEW').length}
            </div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.status === 'ASSIGNED').length}
            </div>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.status === 'INVESTIGATING').length}
            </div>
            <p className="text-xs text-muted-foreground">Investigating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.status === 'CONTAINED').length}
            </div>
            <p className="text-xs text-muted-foreground">Contained</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {incidents.filter(i => i.status === 'RESOLVED').length}
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <Card 
              key={incident.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedIncident(incident)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {incident.confidence}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{incident.title}</h3>
                    {incident.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                      {incident.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned to: {incident.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIncident(incident)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No incidents yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Security incidents will appear here
              </p>
              <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Incident
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Incident Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Incident</DialogTitle>
            <DialogDescription>
              Document a new security incident
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Suspicious data exfiltration detected"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the incident..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence</Label>
                <Select
                  value={formData.confidence}
                  onValueChange={(value) => setFormData({ ...formData, confidence: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setDialogOpen(false); resetForm() }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Incident
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-3xl">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge className={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                  {selectedIncident.title}
                </DialogTitle>
                <DialogDescription>
                  Incident ID: {selectedIncident.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status Actions */}
                <div>
                  <label className="text-sm font-medium">Update Status</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedIncident.id, 'ASSIGNED')}
                    >
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedIncident.id, 'INVESTIGATING')}
                    >
                      Investigate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedIncident.id, 'CONTAINED')}
                    >
                      Contain
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedIncident.id, 'RESOLVED')}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {selectedIncident.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="mt-2 text-sm">{selectedIncident.description}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Confidence Level</label>
                    <p className="text-sm text-muted-foreground">{selectedIncident.confidence}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedIncident.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedIncident(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
