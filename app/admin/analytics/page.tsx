
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Brain,
  BarChart3,
  LineChart,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdvancedAnalyticsPage() {
  const [metricType, setMetricType] = useState('alerts')
  const [timeRange, setTimeRange] = useState('7d')
  const [interval, setInterval] = useState('daily')
  const [trendData, setTrendData] = useState<any>(null)
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [metricType, timeRange, interval])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [trendsRes, predictionsRes] = await Promise.all([
        fetch(
          `/api/analytics/trends?metricType=${metricType}&timeRange=${timeRange}&interval=${interval}`
        ),
        fetch('/api/analytics/predictions'),
      ])

      if (trendsRes.ok) setTrendData(await trendsRes.json())
      if (predictionsRes.ok) setPredictions(await predictionsRes.json())
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading || !trendData || !predictions) {
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
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Predictive insights and trend analysis powered by AI
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={metricType} onValueChange={setMetricType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alerts">Security Alerts</SelectItem>
            <SelectItem value="incidents">Incidents</SelectItem>
            <SelectItem value="devices">Device Health</SelectItem>
            <SelectItem value="integrations">Integrations</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Threat Score */}
      {predictions?.threatScores && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Threat Score</CardTitle>
                <CardDescription>Current security posture assessment</CardDescription>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">{predictions.threatScores.overall}</div>
                <div>
                  <Badge
                    variant={
                      predictions.threatScores.level === 'CRITICAL'
                        ? 'destructive'
                        : predictions.threatScores.level === 'HIGH'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-lg"
                  >
                    {predictions.threatScores.level}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {predictions.threatScores.recommendation}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Open Alerts</div>
                <div className="text-2xl font-bold">
                  {predictions.threatScores.factors.openAlerts}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Critical</div>
                <div className="text-2xl font-bold text-red-500">
                  {predictions.threatScores.factors.criticalAlerts}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top Categories</div>
                <div className="text-xs mt-1">
                  {predictions.threatScores.factors.trendingCategories.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Trend Analysis
            </CardTitle>
            <CardDescription>
              {metricType.charAt(0).toUpperCase() + metricType.slice(1)} trends over{' '}
              {timeRange}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Trend Direction</div>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon(trendData.trends.direction)}
                  <span className="text-2xl font-bold capitalize">
                    {trendData.trends.direction}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Change</div>
                <div className="text-2xl font-bold">{trendData.trends.percentage}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Recent Average</div>
                <div className="text-xl font-bold">{trendData.trends.recentAvg}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Previous Average</div>
                <div className="text-xl font-bold">{trendData.trends.previousAvg}</div>
              </div>
            </div>

            {/* Simple chart visualization */}
            <div className="pt-4">
              <div className="text-sm font-medium mb-2">Time Series</div>
              <div className="space-y-2">
                {trendData.data.slice(-7).map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground w-24">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-4">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.count /
                              Math.max(...trendData.data.map((d: any) => d.count))) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-sm font-medium w-12">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Predictions
            </CardTitle>
            <CardDescription>Next 3 periods forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendData.predictions.map((pred: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Period {pred.period}</div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {(pred.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-2xl font-bold">{pred.value}</div>
              </div>
            ))}

            {predictions?.alertPredictions && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Next 7 Days Forecast</div>
                <div className="space-y-2">
                  {predictions.alertPredictions.predictions
                    .slice(0, 3)
                    .map((pred: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          {new Date(pred.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pred.predicted}</span>
                          <span className="text-xs text-muted-foreground">
                            ({pred.range.low}-{pred.range.high})
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anomalies */}
      {trendData.anomalies && trendData.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Detected Anomalies
            </CardTitle>
            <CardDescription>Statistical outliers in the data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendData.anomalies.map((anomaly: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Z-Score: {anomaly.zScore} • Type: {anomaly.type}
                    </div>
                  </div>
                  <Badge
                    variant={anomaly.type === 'spike' ? 'destructive' : 'secondary'}
                  >
                    {anomaly.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident Forecast */}
      {predictions?.incidentForecasts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Incident Forecast
            </CardTitle>
            <CardDescription>Predicted incident volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Next Week</div>
                  <div className="text-3xl font-bold">
                    {predictions.incidentForecasts.nextWeek.predicted}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Badge variant="destructive" className="w-full justify-center">
                      Critical: {predictions.incidentForecasts.nextWeek.severity.CRITICAL}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="default" className="w-full justify-center">
                      High: {predictions.incidentForecasts.nextWeek.severity.HIGH}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="secondary" className="w-full justify-center">
                      Medium: {predictions.incidentForecasts.nextWeek.severity.MEDIUM}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="outline" className="w-full justify-center">
                      Low: {predictions.incidentForecasts.nextWeek.severity.LOW}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Next Month</div>
                  <div className="text-3xl font-bold">
                    {predictions.incidentForecasts.nextMonth.predicted}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="text-xl font-bold">
                    {(predictions.incidentForecasts.nextMonth.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
