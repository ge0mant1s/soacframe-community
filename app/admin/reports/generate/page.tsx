
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Calendar as CalendarIcon, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

export default function GenerateReportPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState<string>('SECURITY_SUMMARY');
  const [reportFormat, setReportFormat] = useState<string>('PDF');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);

  const reportTypes = [
    {
      value: 'SECURITY_SUMMARY',
      label: 'Security Summary',
      description: 'Comprehensive overview of security alerts, incidents, and threats',
    },
    {
      value: 'COMPLIANCE',
      label: 'Compliance Audit',
      description: 'Audit trail, user activity, and compliance validation',
    },
    {
      value: 'INCIDENT_ANALYSIS',
      label: 'Incident Analysis',
      description: 'Detailed analysis of security incidents and response metrics',
    },
    {
      value: 'ALERT_TRENDS',
      label: 'Alert Trends',
      description: 'Alert patterns, trends, and false positive analysis',
    },
    {
      value: 'DEVICE_HEALTH',
      label: 'Device Health',
      description: 'Endpoint monitoring, performance metrics, and security posture',
    },
    {
      value: 'INTEGRATION_STATUS',
      label: 'Integration Status',
      description: 'Security tool connections, sync status, and performance',
    },
    {
      value: 'AUDIT_TRAIL',
      label: 'Audit Trail',
      description: 'Complete audit log of all system activities and changes',
    },
  ];

  const formats = [
    { value: 'PDF', label: 'PDF Document', description: 'Professional formatted document' },
    { value: 'CSV', label: 'CSV Spreadsheet', description: 'Data export for analysis' },
    { value: 'JSON', label: 'JSON Data', description: 'Raw data for integration' },
    { value: 'HTML', label: 'HTML Report', description: 'Web-based interactive report' },
  ];

  const handleGenerate = async () => {
    if (!title || !reportType || !reportFormat) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGenerating(true);

    try {
      const parameters: any = {
        includeCharts,
        includeRawData,
      };

      if (startDate) {
        parameters.startDate = startDate.toISOString();
      }
      if (endDate) {
        parameters.endDate = endDate.toISOString();
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type: reportType,
          format: reportFormat,
          parameters,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Report generated successfully!');
        router.push('/admin/reports');
      } else {
        toast.error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const selectedType = reportTypes.find(t => t.value === reportType);
  const selectedFormat = formats.find(f => f.value === reportFormat);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/reports">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Generate Report</h1>
          </div>
          <p className="text-muted-foreground">
            Create custom security, compliance, and operational reports
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the report title and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Monthly Security Summary - November 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description for this report"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Report Type */}
          <Card>
            <CardHeader>
              <CardTitle>Report Type *</CardTitle>
              <CardDescription>Select the type of report to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>
                Select the time period for the report (optional, defaults to last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format *</CardTitle>
              <CardDescription>Choose the output format for the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFormat && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedFormat.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>Customize report content and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="charts" className="cursor-pointer">
                  Include charts and visualizations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawdata"
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
                />
                <Label htmlFor="rawdata" className="cursor-pointer">
                  Include raw data (for JSON/CSV exports)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generating || !title || !reportType || !reportFormat}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
              <Link href="/admin/reports" className="block">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Report Types</h4>
                <p className="text-muted-foreground">
                  Choose the report type based on your analysis needs. Each type provides
                  specific metrics and insights.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Date Range</h4>
                <p className="text-muted-foreground">
                  If not specified, reports will default to the last 30 days of data.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Export Formats</h4>
                <p className="text-muted-foreground">
                  PDF for formal reports, CSV for data analysis, JSON for integrations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
