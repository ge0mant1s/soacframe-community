
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Download, CheckCircle2, Settings, TrendingUp, Package } from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  description: string;
  category: string;
  vendor: string;
  iconUrl?: string;
  version: string;
  status: string;
  capabilities: string[];
  pricing?: string;
  documentation?: string;
  requiredFields: any;
  installed: boolean;
  installations?: any[];
}

export default function IntegrationMarketplacePage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installConfig, setInstallConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConnectors();
  }, []);

  useEffect(() => {
    filterConnectors();
  }, [searchTerm, categoryFilter, statusFilter, connectors]);

  const fetchConnectors = async () => {
    try {
      const response = await fetch('/api/integrations/connectors');
      const data = await response.json();
      setConnectors(data.connectors || []);
    } catch (error) {
      console.error('Error fetching connectors:', error);
      toast.error('Failed to load connectors');
    }
  };

  const filterConnectors = () => {
    let filtered = connectors;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (statusFilter === 'installed') {
      filtered = filtered.filter(c => c.installed);
    } else if (statusFilter === 'available') {
      filtered = filtered.filter(c => !c.installed);
    }

    setFilteredConnectors(filtered);
  };

  const openInstallDialog = (connector: Connector) => {
    setSelectedConnector(connector);
    setInstallConfig({});
    setInstallDialogOpen(true);
  };

  const handleInstall = async () => {
    if (!selectedConnector) return;

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/installs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: selectedConnector.id,
          name: installConfig.name || selectedConnector.name,
          config: installConfig,
          syncFrequency: 60, // Default 60 minutes
        }),
      });

      if (!response.ok) throw new Error('Installation failed');

      toast.success(`${selectedConnector.name} installed successfully`);
      setInstallDialogOpen(false);
      fetchConnectors();
    } catch (error) {
      console.error('Error installing connector:', error);
      toast.error('Failed to install connector');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'SIEM', label: 'SIEM' },
    { value: 'EDR_XDR', label: 'EDR/XDR' },
    { value: 'FIREWALL', label: 'Firewall' },
    { value: 'IDS_IPS', label: 'IDS/IPS' },
    { value: 'CLOUD_SECURITY', label: 'Cloud Security' },
    { value: 'IDENTITY_PROVIDER', label: 'Identity Provider' },
    { value: 'TICKETING', label: 'Ticketing' },
    { value: 'COMMUNICATION', label: 'Communication' },
    { value: 'THREAT_INTEL', label: 'Threat Intel' },
    { value: 'VULNERABILITY_SCANNER', label: 'Vuln Scanner' },
  ];

  const installedCount = connectors.filter(c => c.installed).length;
  const availableCount = connectors.filter(c => !c.installed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integration Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Browse and install security tool connectors to extend your SOaC platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connectors</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{installedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="available">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Connector Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredConnectors.map((connector) => (
          <Card key={connector.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {connector.iconUrl ? (
                      <img src={connector.iconUrl} alt={connector.name} className="h-8 w-8" />
                    ) : (
                      <Package className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{connector.vendor}</p>
                  </div>
                </div>
                {connector.installed && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Installed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                {connector.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{connector.category}</Badge>
                  <Badge variant="secondary">v{connector.version}</Badge>
                  {connector.pricing && (
                    <Badge variant="outline" className="text-xs">{connector.pricing}</Badge>
                  )}
                </div>
                {connector.capabilities && connector.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {connector.capabilities.slice(0, 3).map((cap, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {connector.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{connector.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {!connector.installed ? (
                <Button onClick={() => openInstallDialog(connector)} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    View Details
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredConnectors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Connectors Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </CardContent>
        </Card>
      )}

      {/* Install Dialog */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Install {selectedConnector?.name}</DialogTitle>
            <DialogDescription>
              Configure the connection settings for this integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="install-name">Installation Name</Label>
              <Input
                id="install-name"
                placeholder={`My ${selectedConnector?.name} Connection`}
                value={installConfig.name || ''}
                onChange={(e) => setInstallConfig({ ...installConfig, name: e.target.value })}
              />
            </div>
            {selectedConnector?.requiredFields && Object.keys(selectedConnector.requiredFields).map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <Input
                  id={field}
                  type={field.toLowerCase().includes('password') || field.toLowerCase().includes('secret') ? 'password' : 'text'}
                  placeholder={`Enter ${field}`}
                  value={installConfig[field] || ''}
                  onChange={(e) => setInstallConfig({ ...installConfig, [field]: e.target.value })}
                />
              </div>
            ))}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Setup Guide</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {selectedConnector?.documentation || 
                  'Refer to the vendor documentation for obtaining API credentials and configuration details.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInstall} disabled={loading}>
              {loading ? 'Installing...' : 'Install Connector'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
