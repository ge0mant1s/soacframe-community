
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Settings2, 
  CheckCircle, 
  Shield,
  Cloud,
  Database,
  Lock,
  Bell,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const categoryIcons: Record<string, any> = {
  SIEM: Database,
  EDR_XDR: Shield,
  FIREWALL: Shield,
  IDS_IPS: Shield,
  CLOUD_SECURITY: Cloud,
  IDENTITY_PROVIDER: Lock,
  TICKETING: FileText,
  COMMUNICATION: Bell,
  THREAT_INTEL: Shield,
  VULNERABILITY_SCANNER: Shield,
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [filteredConnectors, setFilteredConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installConfig, setInstallConfig] = useState({
    name: '',
    config: {} as Record<string, string>,
    syncFrequency: 60,
  });

  useEffect(() => {
    fetchConnectors();
  }, []);

  useEffect(() => {
    filterConnectors();
  }, [searchTerm, categoryFilter, statusFilter, connectors]);

  const fetchConnectors = async () => {
    try {
      const response = await fetch('/api/integrations/connectors');
      if (response.ok) {
        const data = await response.json();
        setConnectors(data);
        setFilteredConnectors(data);
      }
    } catch (error) {
      console.error('Error fetching connectors:', error);
      toast.error('Failed to load connectors');
    } finally {
      setLoading(false);
    }
  };

  const filterConnectors = () => {
    let filtered = [...connectors];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    if (statusFilter === 'installed') {
      filtered = filtered.filter((c) => c.installed);
    } else if (statusFilter === 'available') {
      filtered = filtered.filter((c) => !c.installed);
    }

    setFilteredConnectors(filtered);
  };

  const handleInstall = async () => {
    if (!selectedConnector || !installConfig.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/integrations/connectors/${selectedConnector.id}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(installConfig),
      });

      if (response.ok) {
        toast.success('Connector installed successfully');
        setInstallDialogOpen(false);
        fetchConnectors();
        setInstallConfig({ name: '', config: {}, syncFrequency: 60 });
      } else {
        toast.error('Failed to install connector');
      }
    } catch (error) {
      console.error('Error installing connector:', error);
      toast.error('Failed to install connector');
    }
  };

  const openInstallDialog = (connector: any) => {
    setSelectedConnector(connector);
    setInstallConfig({
      name: `${connector.name} Integration`,
      config: {},
      syncFrequency: 60,
    });
    setInstallDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading connectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integration Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Discover and install security tool integrations
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="SIEM">SIEM</SelectItem>
                <SelectItem value="EDR_XDR">EDR/XDR</SelectItem>
                <SelectItem value="FIREWALL">Firewall</SelectItem>
                <SelectItem value="CLOUD_SECURITY">Cloud Security</SelectItem>
                <SelectItem value="IDENTITY_PROVIDER">Identity Provider</SelectItem>
                <SelectItem value="TICKETING">Ticketing</SelectItem>
                <SelectItem value="COMMUNICATION">Communication</SelectItem>
                <SelectItem value="THREAT_INTEL">Threat Intel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Connectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Installed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectors.filter((c) => c.installed).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectors.filter((c) => !c.installed).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(connectors.map((c) => c.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connector Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredConnectors.map((connector) => {
          const IconComponent = categoryIcons[connector.category] || Shield;
          return (
            <Card key={connector.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{connector.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{connector.vendor}</p>
                    </div>
                  </div>
                  {connector.installed && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Installed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {connector.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{connector.category.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline">{connector.pricing || 'Free'}</Badge>
                  <Badge variant="outline">v{connector.version}</Badge>
                </div>
                <div className="flex gap-2">
                  {connector.installed ? (
                    <Button variant="outline" className="flex-1" size="sm">
                      <Settings2 className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => openInstallDialog(connector)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  )}
                  {connector.documentation && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={connector.documentation} target="_blank" rel="noopener noreferrer">
                        Docs
                      </a>
                    </Button>
                  )}
                </div>
                {connector.capabilities && connector.capabilities.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Capabilities:</strong> {connector.capabilities.slice(0, 3).join(', ')}
                    {connector.capabilities.length > 3 && '...'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredConnectors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No connectors found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search terms
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
              Configure the integration settings for this connector
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Installation Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Production SIEM Integration"
                value={installConfig.name}
                onChange={(e) => setInstallConfig({ ...installConfig, name: e.target.value })}
              />
            </div>

            {selectedConnector?.requiredFields && Object.keys(selectedConnector.requiredFields).length > 0 && (
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium">Configuration Fields</h4>
                {Object.entries(selectedConnector.requiredFields as Record<string, any>).map(([key, field]: [string, any]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>
                      {field.label || key} {field.required && '*'}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={key}
                        placeholder={field.placeholder}
                        value={installConfig.config[key] || ''}
                        onChange={(e) =>
                          setInstallConfig({
                            ...installConfig,
                            config: { ...installConfig.config, [key]: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <Input
                        id={key}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={installConfig.config[key] || ''}
                        onChange={(e) =>
                          setInstallConfig({
                            ...installConfig,
                            config: { ...installConfig.config, [key]: e.target.value },
                          })
                        }
                      />
                    )}
                    {field.description && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="syncFrequency">Sync Frequency (minutes)</Label>
              <Input
                id="syncFrequency"
                type="number"
                value={installConfig.syncFrequency}
                onChange={(e) =>
                  setInstallConfig({ ...installConfig, syncFrequency: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInstall}>
                <Download className="h-4 w-4 mr-2" />
                Install Connector
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
