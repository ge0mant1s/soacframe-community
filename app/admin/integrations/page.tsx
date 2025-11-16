
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import {
  Database,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  Trash2,
  Settings,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Integration {
  id: string
  name: string
  type: string
  status: string
  endpoint: string
  lastSync: string | null
  syncInterval: number | null
  eventsIngested: number
  alertsGenerated: number
  errorCount: number
  lastError: string | null
  createdAt: string
  updatedAt: string
}

const INTEGRATION_TYPES = [
  { value: 'SIEM', label: 'SIEM (Splunk, QRadar, etc.)' },
  { value: 'EDR', label: 'EDR (CrowdStrike, SentinelOne, etc.)' },
  { value: 'FIREWALL', label: 'Firewall (Palo Alto, Fortinet, etc.)' },
  { value: 'IDS_IPS', label: 'IDS/IPS (Snort, Suricata, etc.)' },
  { value: 'CLOUD_SECURITY', label: 'Cloud Security (AWS, Azure, GCP)' },
  { value: 'EMAIL_SECURITY', label: 'Email Security (Proofpoint, Mimecast)' },
  { value: 'DLP', label: 'Data Loss Prevention' },
  { value: 'SOAR', label: 'SOAR Platform' },
  { value: 'THREAT_INTEL', label: 'Threat Intelligence Feed' },
  { value: 'CUSTOM', label: 'Custom Integration' }
]

export default function IntegrationsPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'SIEM',
    endpoint: '',
    apiKey: '',
    syncInterval: 15,
    config: '{}'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchIntegrations()
    }
  }, [status, router])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/security/integrations')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/security/integrations/${editingId}`
        : '/api/security/integrations'
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingId ? 'Integration updated' : 'Integration created')
        setDialogOpen(false)
        resetForm()
        fetchIntegrations()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save integration')
      }
    } catch (error) {
      console.error('Failed to save integration:', error)
      toast.error('Failed to save integration')
    }
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const response = await fetch(`/api/security/integrations/${id}/test`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Connection test successful!')
          fetchIntegrations()
        } else {
          toast.error(result.message || 'Connection test failed')
        }
      }
    } catch (error) {
      console.error('Test failed:', error)
      toast.error('Connection test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleSync = async (id: string) => {
    try {
      const response = await fetch(`/api/security/integrations/${id}/sync`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Sync started')
        fetchIntegrations()
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to start sync')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return

    try {
      const response = await fetch(`/api/security/integrations/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Integration deleted')
        fetchIntegrations()
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete integration')
    }
  }

  const handleEdit = (integration: Integration) => {
    setEditingId(integration.id)
    setFormData({
      name: integration.name,
      type: integration.type,
      endpoint: integration.endpoint,
      apiKey: '',
      syncInterval: integration.syncInterval || 15,
      config: '{}'
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      type: 'SIEM',
      endpoint: '',
      apiKey: '',
      syncInterval: 15,
      config: '{}'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      CONNECTED: 'bg-green-500 text-white',
      DISCONNECTED: 'bg-gray-500 text-white',
      ERROR: 'bg-red-500 text-white',
      SYNCING: 'bg-blue-500 text-white'
    }
    return variants[status] || 'bg-gray-500 text-white'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED': return <CheckCircle2 className="h-4 w-4" />
      case 'DISCONNECTED': return <XCircle className="h-4 w-4" />
      case 'ERROR': return <AlertCircle className="h-4 w-4" />
      case 'SYNCING': return <Activity className="h-4 w-4 animate-spin" />
      default: return <XCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Data Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your security tools for real-time data ingestion
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Total Integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'CONNECTED').length}
            </div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + i.eventsIngested, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Events Ingested</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + i.alertsGenerated, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Alerts Generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.type.replace(/_/g, ' ')}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusBadge(integration.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(integration.status)}
                    {integration.status}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Events Ingested:</span>
                  <span className="font-medium">{integration.eventsIngested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alerts Generated:</span>
                  <span className="font-medium">{integration.alertsGenerated.toLocaleString()}</span>
                </div>
                {integration.lastSync && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span className="font-medium">
                      {new Date(integration.lastSync).toLocaleString()}
                    </span>
                  </div>
                )}
                {integration.errorCount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Errors:</span>
                    <span className="font-medium">{integration.errorCount}</span>
                  </div>
                )}
              </div>

              {integration.lastError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {integration.lastError}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleTest(integration.id)}
                  disabled={testingId === integration.id}
                >
                  {testingId === integration.id ? (
                    <Activity className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Test
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleSync(integration.id)}
                  disabled={integration.status !== 'CONNECTED'}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Sync
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(integration)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(integration.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {integrations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Connect your first security tool to start ingesting data
              </p>
              <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Integration' : 'Add Integration'}
            </DialogTitle>
            <DialogDescription>
              Configure your security tool connection
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Splunk Production"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Integration Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEGRATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="https://api.example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / Token</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={editingId ? "(unchanged)" : "Enter API key"}
                  required={!editingId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  min="1"
                  value={formData.syncInterval}
                  onChange={(e) => setFormData({ ...formData, syncInterval: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="config">Additional Configuration (JSON)</Label>
                <Textarea
                  id="config"
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  placeholder='{"custom_field": "value"}'
                  rows={3}
                />
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
                {editingId ? 'Update' : 'Create'} Integration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
