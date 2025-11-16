
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ThreatFeedsPage() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<any>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [newFeed, setNewFeed] = useState({
    name: '',
    description: '',
    feedType: 'IP_REPUTATION',
    sourceUrl: '',
    provider: '',
    updateFrequency: 60,
  });

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await fetch('/api/threat-intel/feeds');
      if (response.ok) {
        const data = await response.json();
        setFeeds(data);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
      toast.error('Failed to load threat feeds');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeed = async () => {
    if (!newFeed.name || !newFeed.provider) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/threat-intel/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeed),
      });

      if (response.ok) {
        toast.success('Threat feed created successfully');
        setCreateDialogOpen(false);
        fetchFeeds();
        setNewFeed({
          name: '',
          description: '',
          feedType: 'IP_REPUTATION',
          sourceUrl: '',
          provider: '',
          updateFrequency: 60,
        });
      } else {
        toast.error('Failed to create threat feed');
      }
    } catch (error) {
      console.error('Error creating feed:', error);
      toast.error('Failed to create threat feed');
    }
  };

  const handleSyncFeed = async (feedId: string) => {
    setSyncing(feedId);
    try {
      const response = await fetch(`/api/threat-intel/feeds/${feedId}/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Feed synced successfully');
        fetchFeeds();
      } else {
        toast.error('Failed to sync feed');
      }
    } catch (error) {
      console.error('Error syncing feed:', error);
      toast.error('Failed to sync feed');
    } finally {
      setSyncing(null);
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to delete this threat feed?')) return;

    try {
      const response = await fetch(`/api/threat-intel/feeds/${feedId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Threat feed deleted');
        fetchFeeds();
      } else {
        toast.error('Failed to delete feed');
      }
    } catch (error) {
      console.error('Error deleting feed:', error);
      toast.error('Failed to delete feed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading threat feeds...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalFeeds: feeds.length,
    activeFeeds: feeds.filter(f => f.status === 'active').length,
    totalIndicators: feeds.reduce((sum, f) => sum + (f._count?.indicators || 0), 0),
    recentSync: feeds.filter(f => {
      if (!f.lastSync) return false;
      const hoursSinceSync = (Date.now() - new Date(f.lastSync).getTime()) / (1000 * 60 * 60);
      return hoursSinceSync < 1;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Threat Intelligence Feeds</h1>
          <p className="text-muted-foreground mt-2">
            Manage threat intelligence feeds and indicators of compromise (IOCs)
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feed
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Feeds</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeeds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Feeds</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeFeeds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total IOCs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIndicators.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Syncs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSync}</div>
            <p className="text-xs text-muted-foreground mt-1">Last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Feeds List */}
      <div className="grid gap-4">
        {feeds.map((feed) => (
          <Card key={feed.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{feed.name}</CardTitle>
                    <Badge variant={feed.status === 'active' ? 'default' : 'secondary'}>
                      {feed.status}
                    </Badge>
                    <Badge variant="outline">{feed.feedType.replace(/_/g, ' ')}</Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {feed.description || 'No description provided'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncFeed(feed.id)}
                    disabled={syncing === feed.id}
                  >
                    {syncing === feed.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFeed(feed.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Provider</p>
                  <p className="font-medium mt-1">{feed.provider}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Indicators</p>
                  <p className="font-medium mt-1">{feed._count?.indicators || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Update Frequency</p>
                  <p className="font-medium mt-1">{feed.updateFrequency} min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Sync</p>
                  <p className="font-medium mt-1">
                    {feed.lastSync ? formatDistanceToNow(new Date(feed.lastSync), { addSuffix: true }) : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium mt-1">{new Date(feed.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feeds.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No threat feeds configured</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Start by adding your first threat intelligence feed
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Feed Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Threat Intelligence Feed</DialogTitle>
            <DialogDescription>
              Configure a new threat intelligence feed to monitor IOCs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Feed Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., AlienVault OTX"
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Input
                  id="provider"
                  placeholder="e.g., AlienVault"
                  value={newFeed.provider}
                  onChange={(e) => setNewFeed({ ...newFeed, provider: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this threat intelligence feed..."
                value={newFeed.description}
                onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feedType">Feed Type</Label>
                <Select
                  value={newFeed.feedType}
                  onValueChange={(value) => setNewFeed({ ...newFeed, feedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IP_REPUTATION">IP Reputation</SelectItem>
                    <SelectItem value="DOMAIN_REPUTATION">Domain Reputation</SelectItem>
                    <SelectItem value="FILE_HASH">File Hash</SelectItem>
                    <SelectItem value="URL_REPUTATION">URL Reputation</SelectItem>
                    <SelectItem value="CVE_FEED">CVE Feed</SelectItem>
                    <SelectItem value="MALWARE_SIGNATURE">Malware Signature</SelectItem>
                    <SelectItem value="THREAT_ACTOR">Threat Actor</SelectItem>
                    <SelectItem value="ATTACK_PATTERN">Attack Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="updateFrequency">Update Frequency (minutes)</Label>
                <Input
                  id="updateFrequency"
                  type="number"
                  value={newFeed.updateFrequency}
                  onChange={(e) => setNewFeed({ ...newFeed, updateFrequency: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <Input
                id="sourceUrl"
                placeholder="https://api.threatfeed.com/v1/indicators"
                value={newFeed.sourceUrl}
                onChange={(e) => setNewFeed({ ...newFeed, sourceUrl: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFeed}>
                <Plus className="h-4 w-4 mr-2" />
                Create Feed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
