
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Database, History, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportImportPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('FULL_CONFIG');
  const [importData, setImportData] = useState('');
  const [importType, setImportType] = useState('WORKFLOWS');

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/config/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupType: exportType }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Download file
        const blob = new Blob([data.downloadData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType.toLowerCase()}_${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success('Configuration exported successfully');
        fetchBackups();
      } else {
        toast.error('Failed to export configuration');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData) {
      toast.error('Please paste configuration data');
      return;
    }

    setLoading(true);
    try {
      const parsedData = JSON.parse(importData);
      
      const response = await fetch('/api/config/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupType: importType,
          data: parsedData,
          mergeStrategy: 'skip',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setImportData('');
      } else {
        toast.error('Failed to import configuration');
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Invalid configuration data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export / Import Center</h1>
        <p className="text-muted-foreground mt-2">
          Backup and restore your security configuration
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
              <CardDescription>
                Download your security configuration as a JSON file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Type</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_CONFIG">Full Configuration</SelectItem>
                    <SelectItem value="WORKFLOWS">Workflows Only</SelectItem>
                    <SelectItem value="INTEGRATIONS">Integrations Only</SelectItem>
                    <SelectItem value="DASHBOARDS">Dashboards Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Configuration</CardTitle>
              <CardDescription>
                Restore configuration from a JSON backup file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Import Type</Label>
                <Select value={importType} onValueChange={setImportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKFLOWS">Workflows</SelectItem>
                    <SelectItem value="INTEGRATIONS">Integrations</SelectItem>
                    <SelectItem value="DASHBOARDS">Dashboards</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Configuration Data (JSON)</Label>
                <Textarea
                  placeholder="Paste your configuration JSON here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleImport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                View previous configuration backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{backup.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {backup.description}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge>{backup.backupType.replace(/_/g, ' ')}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(backup.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                ))}
                {backups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No backup history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
