'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ReportSchedule {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  schedule: string;
  format: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  failCount: number;
}

export default function ReportSchedulesPage() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/reports/schedules');
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (scheduleId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch('/api/reports/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: scheduleId,
          enabled: !currentEnabled,
        }),
      });

      if (response.ok) {
        toast.success(`Schedule ${!currentEnabled ? 'enabled' : 'disabled'}`);
        fetchSchedules();
      } else {
        toast.error('Failed to update schedule');
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`/api/reports/schedules?id=${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Schedule deleted successfully');
        fetchSchedules();
      } else {
        toast.error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      DAILY: 'bg-blue-500',
      WEEKLY: 'bg-green-500',
      MONTHLY: 'bg-purple-500',
      QUARTERLY: 'bg-orange-500',
    };
    return colors[frequency] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Schedules</h1>
          <p className="text-muted-foreground">
            Automated report generation and delivery
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/reports">
            <Button variant="outline">Back to Reports</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.reduce((sum, s) => sum + s.runCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
            <Trash2 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.reduce((sum, s) => sum + s.failCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules configured</h3>
            <p className="text-muted-foreground mb-4">
              Create automated report schedules for regular delivery
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Schedules</CardTitle>
            <CardDescription>{schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{schedule.name}</h3>
                          <Badge className={getFrequencyBadge(schedule.frequency)}>
                            {schedule.frequency}
                          </Badge>
                          <Badge variant="outline">{schedule.format}</Badge>
                          {schedule.enabled ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="outline">Paused</Badge>
                          )}
                        </div>
                        {schedule.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {schedule.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Schedule:</span>
                            <p className="font-medium">{schedule.schedule}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Run:</span>
                            <p className="font-medium">
                              {schedule.lastRun
                                ? new Date(schedule.lastRun).toLocaleString()
                                : 'Never'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Run:</span>
                            <p className="font-medium">
                              {schedule.nextRun
                                ? new Date(schedule.nextRun).toLocaleString()
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Success Rate:</span>
                            <p className="font-medium">
                              {schedule.runCount > 0
                                ? `${(((schedule.runCount - schedule.failCount) / schedule.runCount) * 100).toFixed(1)}%`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={() => handleToggleEnabled(schedule.id, schedule.enabled)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
