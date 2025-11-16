
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Bell,
  Mail,
  MessageSquare,
  Webhook,
  Plus,
  Send,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const [channels, setChannels] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [channelDialogOpen, setChannelDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [channelsRes, templatesRes, historyRes] = await Promise.all([
        fetch('/api/notifications/channels'),
        fetch('/api/notifications/templates'),
        fetch('/api/notifications/history?limit=30'),
      ])

      if (channelsRes.ok) setChannels(await channelsRes.json())
      if (templatesRes.ok) setTemplates(await templatesRes.json())
      if (historyRes.ok) setHistory(await historyRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load notifications data')
    } finally {
      setLoading(false)
    }
  }

  const createChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const channelType = formData.get('type') as string
    const config: any = {}

    // Build config based on channel type
    if (channelType === 'EMAIL') {
      config.email = formData.get('email')
    } else if (channelType === 'SLACK') {
      config.webhookUrl = formData.get('webhookUrl')
      config.channel = formData.get('channel')
    } else if (channelType === 'WEBHOOK') {
      config.url = formData.get('url')
    }

    try {
      const res = await fetch('/api/notifications/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          type: channelType,
          config,
        }),
      })

      if (res.ok) {
        toast.success('Channel created successfully')
        setChannelDialogOpen(false)
        fetchData()
      } else {
        toast.error('Failed to create channel')
      }
    } catch (error) {
      toast.error('Error creating channel')
    }
  }

  const deleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this channel?')) return

    try {
      const res = await fetch(`/api/notifications/channels?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Channel deleted')
        fetchData()
      } else {
        toast.error('Failed to delete channel')
      }
    } catch (error) {
      toast.error('Error deleting channel')
    }
  }

  const createTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          type: formData.get('type'),
          subject: formData.get('subject'),
          body: formData.get('body'),
          channelType: formData.get('channelType') || null,
        }),
      })

      if (res.ok) {
        toast.success('Template created successfully')
        setTemplateDialogOpen(false)
        fetchData()
      } else {
        toast.error('Failed to create template')
      }
    } catch (error) {
      toast.error('Error creating template')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/notifications/templates?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Template deleted')
        fetchData()
      } else {
        toast.error('Failed to delete template')
      }
    } catch (error) {
      toast.error('Error deleting template')
    }
  }

  const sendTestNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelIds: [formData.get('channelId')],
          type: 'SYSTEM',
          title: formData.get('title'),
          message: formData.get('message'),
        }),
      })

      if (res.ok) {
        toast.success('Notification sent')
        setSendDialogOpen(false)
        fetchData()
      } else {
        toast.error('Failed to send notification')
      }
    } catch (error) {
      toast.error('Error sending notification')
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'SLACK':
        return <MessageSquare className="h-4 w-4" />
      case 'WEBHOOK':
        return <Webhook className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
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
          <h1 className="text-3xl font-bold">Notification System</h1>
          <p className="text-muted-foreground mt-1">
            Multi-channel alert delivery and management
          </p>
        </div>
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Notification</DialogTitle>
              <DialogDescription>
                Send a test notification to verify channel configuration
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={sendTestNotification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channelId">Channel</Label>
                <Select name="channelId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Test Notification"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="This is a test notification"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Notification
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {channels.filter((c) => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {channels.length} total channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter((t) => t.isDefault).length} default
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent (30 days)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.filter((h) => h.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {history.length} total notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.length > 0
                ? Math.round(
                    (history.filter((h) => h.status === 'sent').length / history.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Notification Channel</DialogTitle>
                  <DialogDescription>
                    Configure a new notification delivery channel
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createChannel} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Channel Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Production Alerts"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Channel Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="SLACK">Slack</SelectItem>
                        <SelectItem value="WEBHOOK">Webhook</SelectItem>
                        <SelectItem value="TEAMS">Microsoft Teams</SelectItem>
                        <SelectItem value="PAGERDUTY">PagerDuty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email / Webhook URL</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="alerts@company.com or https://..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Channel
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.type)}
                      <div>
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                        <CardDescription>{channel.type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    {channel.config?.email || channel.config?.webhookUrl || 'Configured'}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteChannel(channel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Notification Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable message template with variables
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createTemplate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        name="name"
                        placeholder="Critical Alert Template"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-type">Type</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALERT">Alert</SelectItem>
                          <SelectItem value="INCIDENT">Incident</SelectItem>
                          <SelectItem value="SYSTEM">System</SelectItem>
                          <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (for email)</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="CRITICAL: {{alertTitle}}"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-body">Message Body</Label>
                    <Textarea
                      id="template-body"
                      name="body"
                      placeholder="Use {{variable}} for dynamic content"
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Template
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>
                        {template.type} •{' '}
                        {template.channelType || 'All Channels'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.isDefault && <Badge variant="outline">Default</Badge>}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.subject && (
                    <div className="mb-2">
                      <div className="text-sm font-medium">Subject:</div>
                      <div className="text-sm text-muted-foreground">
                        {template.subject}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">Body:</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {template.body}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Last 30 notification deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(notification.status)}
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        notification.status === 'sent'
                          ? 'default'
                          : notification.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {notification.status}
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
