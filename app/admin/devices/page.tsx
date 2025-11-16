
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Server, Plus, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Device {
  id: string
  name: string
  type: string
  status: string
  endpoint: string
  createdAt: string
  updatedAt: string
}

interface DeviceMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  threats: number
}

export default function DevicesPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [metrics, setMetrics] = useState<Record<string, DeviceMetrics>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDevices()
      // Refresh metrics every 30 seconds
      const interval = setInterval(fetchDevices, 30000)
      return () => clearInterval(interval)
    }
  }, [status, router])

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/security/devices')
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices || [])
        setMetrics(data.metrics || {})
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Online
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-500 text-white">
        <AlertCircle className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    )
  }

  const getDeviceIcon = (type: string) => {
    return <Server className="h-5 w-5 text-blue-500" />
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Device Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of security devices and endpoints
          </p>
        </div>
        <Button onClick={fetchDevices} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">Total Devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {devices.filter(d => d.status !== 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(metrics).reduce((sum, m) => sum + m.threats, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active Threats</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => {
          const deviceMetrics = metrics[device.id] || {
            cpu: 0,
            memory: 0,
            disk: 0,
            network: 0,
            threats: 0
          }

          return (
            <Card key={device.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.type)}
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>{device.type.replace(/_/g, ' ')}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(device.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resource Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="font-medium">{deviceMetrics.cpu}%</span>
                    </div>
                    <Progress value={deviceMetrics.cpu} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="font-medium">{deviceMetrics.memory}%</span>
                    </div>
                    <Progress value={deviceMetrics.memory} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Disk Usage</span>
                      <span className="font-medium">{deviceMetrics.disk}%</span>
                    </div>
                    <Progress value={deviceMetrics.disk} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Network Activity</span>
                      <span className="font-medium">{deviceMetrics.network} Mbps</span>
                    </div>
                    <Progress value={Math.min((deviceMetrics.network / 1000) * 100, 100)} className="h-2" />
                  </div>
                </div>

                {/* Threat Count */}
                {deviceMetrics.threats > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      {deviceMetrics.threats} active threat{deviceMetrics.threats > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Device Info */}
                <div className="pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Endpoint:</span>
                    <span className="font-mono">{device.endpoint.substring(0, 30)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {devices.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No devices configured</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add devices to start monitoring
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
