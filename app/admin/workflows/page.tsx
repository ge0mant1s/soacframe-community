
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, Pause, Edit, Trash2, Plus, Activity, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function WorkflowsPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [triggers, setTriggers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [playbooksRes, executionsRes, triggersRes] = await Promise.all([
        fetch('/api/workflows/playbooks'),
        fetch('/api/workflows/executions?limit=20'),
        fetch('/api/workflows/triggers'),
      ])

      if (playbooksRes.ok) setPlaybooks(await playbooksRes.json())
      if (executionsRes.ok) setExecutions(await executionsRes.json())
      if (triggersRes.ok) setTriggers(await triggersRes.json())
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const executePlaybook = async (playbookId: string) => {
    setExecuting(playbookId)
    try {
      const res = await fetch('/api/workflows/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookId, triggeredBy: 'MANUAL' }),
      })

      if (res.ok) {
        toast.success('Playbook execution started')
        fetchData()
      } else {
        toast.error('Failed to execute playbook')
      }
    } catch (error) {
      toast.error('Error executing playbook')
    } finally {
      setExecuting(null)
    }
  }

  const togglePlaybookStatus = async (playbook: any) => {
    try {
      const res = await fetch('/api/workflows/playbooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playbook.id, isActive: !playbook.isActive }),
      })

      if (res.ok) {
        toast.success(`Playbook ${playbook.isActive ? 'disabled' : 'enabled'}`)
        fetchData()
      } else {
        toast.error('Failed to update playbook')
      }
    } catch (error) {
      toast.error('Error updating playbook')
    }
  }

  const deletePlaybook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playbook?')) return

    try {
      const res = await fetch(`/api/workflows/playbooks?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Playbook deleted')
        fetchData()
      } else {
        toast.error('Failed to delete playbook')
      }
    } catch (error) {
      toast.error('Error deleting playbook')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: any = {
      Investigation: 'bg-blue-500',
      Containment: 'bg-red-500',
      Remediation: 'bg-green-500',
      Enrichment: 'bg-purple-500',
    }
    return colors[category] || 'bg-gray-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-muted-foreground mt-1">
            SOAR-style playbook execution and automation
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Playbook
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Playbooks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playbooks.length}</div>
            <p className="text-xs text-muted-foreground">
              {playbooks.filter((p) => p.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executions.length}</div>
            <p className="text-xs text-muted-foreground">Last 20 runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executions.length > 0
                ? Math.round(
                    (executions.filter((e) => e.status === 'COMPLETED').length /
                      executions.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {executions.filter((e) => e.status === 'COMPLETED').length} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {triggers.filter((t) => t.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {triggers.length} total triggers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="playbooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="playbooks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((playbook) => (
              <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{playbook.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {playbook.description}
                      </CardDescription>
                    </div>
                    <Badge className={getCategoryColor(playbook.category)}>
                      {playbook.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Executions</div>
                      <div className="font-semibold">{playbook.executionCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold">
                        {playbook.successRate.toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Steps</div>
                      <div className="font-semibold">{playbook.steps?.length || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Duration</div>
                      <div className="font-semibold">
                        {playbook.avgDuration ? `${playbook.avgDuration}s` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => executePlaybook(playbook.id)}
                      disabled={executing === playbook.id || !playbook.isActive}
                      className="flex-1"
                    >
                      {executing === playbook.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-2" />
                      )}
                      Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePlaybookStatus(playbook)}
                    >
                      {playbook.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePlaybook(playbook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant={playbook.isActive ? 'default' : 'secondary'}>
                      {playbook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {playbook.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Last 20 workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <div className="font-medium">{execution.playbook?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(execution.startedAt).toLocaleString()} •{' '}
                          {execution.triggeredBy}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          execution.status === 'COMPLETED'
                            ? 'default'
                            : execution.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                      {execution.duration && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {execution.duration}s
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Triggers</CardTitle>
              <CardDescription>
                Configure automatic playbook execution rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {triggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{trigger.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {trigger.triggerType} • Priority: {trigger.priority}
                      </div>
                      {trigger.triggerCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Triggered {trigger.triggerCount} times
                        </div>
                      )}
                    </div>
                    <Badge variant={trigger.enabled ? 'default' : 'secondary'}>
                      {trigger.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
