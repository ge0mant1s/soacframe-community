
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Download, Upload, Database, Clock, Shield, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

interface ConfigBackup {
  id: string;
  name: string;
  description?: string;
  backupType: string;
  fileSize: number;
  checksum: string;
  version: string;
  createdBy: string;
  createdAt: string;
  restoredAt?: string;
  restoredBy?: string;
}

export default function ConfigBackupsPage() {
  const [backups, setBackups] = useState<ConfigBackup[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<ConfigBackup[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBackup, setNewBackup] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  useEffect(() => {
    filterBackups();
  }, [typeFilter, backups]);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/config/backups');
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to load backups');
    }
  };

  const filterBackups = () => {
    let filtered = backups;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(b => b.backupType === typeFilter);
    }

    setFilteredBackups(filtered);
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBackup),
      });

      if (!response.ok) throw new Error('Failed to create backup');

      toast.success('Configuration backup created successfully');
      setCreateDialogOpen(false);
      setNewBackup({});
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this configuration? This will overwrite current settings.')) {
      return;
    }

    setRestoring(backupId);
    try {
      const response = await fetch(`/api/config/backups/${backupId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Restore failed');

      toast.success('Configuration restored successfully');
      fetchBackups();
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Failed to restore configuration');
    } finally {
      setRestoring(null);
    }
  };

  const backupTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'FULL_CONFIG', label: 'Full Configuration' },
    { value: 'WORKFLOWS', label: 'Workflows' },
    { value: 'INTEGRATIONS', label: 'Integrations' },
    { value: 'DASHBOARDS', label: 'Dashboards' },
    { value: 'USERS_ROLES', label: 'Users & Roles' },
    { value: 'RULES_POLICIES', label: 'Rules & Policies' },
  ];

  const totalSize = backups.reduce((sum, b) => sum + b.fileSize, 0);
  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Backups</h1>
          <p className="text-muted-foreground mt-2">
            Export, backup, and restore your SOaC platform configuration
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {lastBackup
                ? format(new Date(lastBackup.createdAt), 'MMM d, HH:mm')
                : 'Never'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Backup Type" />
              </SelectTrigger>
              <SelectContent>
                {backupTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Backups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Backups</CardTitle>
          <CardDescription>
            Manage system configuration backups and restore points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {backup.backupType.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {(backup.fileSize / 1024).toFixed(2)} KB
                  </TableCell>
                  <TableCell className="text-sm">{backup.version}</TableCell>
                  <TableCell className="text-sm">{backup.createdBy}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(backup.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {backup.restoredAt ? (
                      <Badge variant="secondary">Restored</Badge>
                    ) : (
                      <Badge variant="default">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={restoring === backup.id}
                      >
                        <Upload className={`h-4 w-4 ${restoring === backup.id ? 'animate-pulse' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredBackups.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Backups Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first configuration backup to protect your settings
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Configuration Backup</DialogTitle>
            <DialogDescription>
              Export and save your platform configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input
                id="backup-name"
                placeholder="Monthly Backup - Nov 2025"
                value={newBackup.name || ''}
                onChange={(e) => setNewBackup({ ...newBackup, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-type">Backup Type</Label>
              <Select
                value={newBackup.backupType || ''}
                onValueChange={(value) => setNewBackup({ ...newBackup, backupType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select backup type" />
                </SelectTrigger>
                <SelectContent>
                  {backupTypes.slice(1).map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-description">Description (Optional)</Label>
              <Textarea
                id="backup-description"
                placeholder="Pre-deployment backup of all workflows and integrations"
                value={newBackup.description || ''}
                onChange={(e) => setNewBackup({ ...newBackup, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={loading || !newBackup.name || !newBackup.backupType}>
              {loading ? 'Creating...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
