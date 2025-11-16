
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Download, 
  Search, 
  Star, 
  Clock, 
  Shield,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

const complexityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function PlaybookLibraryPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('downloads');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [sortBy]);

  useEffect(() => {
    filterTemplates();
  }, [searchTerm, categoryFilter, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/workflows/playbook-library?sortBy=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        setFilteredTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load playbook library');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.useCase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleDownload = async (templateId: string) => {
    setDownloading(templateId);
    try {
      const response = await fetch(`/api/workflows/playbook-library/${templateId}/download`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Playbook installed successfully');
        fetchTemplates();
      } else {
        toast.error('Failed to install playbook');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to install playbook');
    } finally {
      setDownloading(null);
    }
  };

  const showDetails = (template: any) => {
    setSelectedTemplate(template);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading playbook library...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalTemplates: templates.length,
    categories: new Set(templates.map(t => t.category)).size,
    totalDownloads: templates.reduce((sum, t) => sum + (t.downloads || 0), 0),
    avgRating: templates.length > 0 
      ? (templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length).toFixed(1)
      : '0.0',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">SOAR Playbook Library</h1>
        <p className="text-muted-foreground mt-2">
          Browse and install pre-built security automation playbooks
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Playbooks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search playbooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="INCIDENT_RESPONSE">Incident Response</SelectItem>
                <SelectItem value="THREAT_HUNTING">Threat Hunting</SelectItem>
                <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                <SelectItem value="VULNERABILITY_MANAGEMENT">Vulnerability Mgmt</SelectItem>
                <SelectItem value="PHISHING">Phishing</SelectItem>
                <SelectItem value="MALWARE_ANALYSIS">Malware Analysis</SelectItem>
                <SelectItem value="DATA_BREACH">Data Breach</SelectItem>
                <SelectItem value="INSIDER_THREAT">Insider Threat</SelectItem>
                <SelectItem value="CLOUD_SECURITY">Cloud Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Playbook Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{template.category.replace(/_/g, ' ')}</Badge>
                    <Badge className={complexityColors[template.complexity]}>
                      {template.complexity}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Use Case:</span>
                  <span className="font-medium line-clamp-1">{template.useCase}</span>
                </div>
                {template.estimatedTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Est. Time:
                    </span>
                    <span className="font-medium">{template.estimatedTime} min</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Downloads:
                  </span>
                  <span className="font-medium">{template.downloads || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Rating:
                  </span>
                  <span className="font-medium">{template.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  onClick={() => showDetails(template)}
                >
                  Details
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => handleDownload(template.id)}
                  disabled={downloading === template.id}
                >
                  {downloading === template.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No playbooks found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      {selectedTemplate && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>{selectedTemplate.useCase}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <Badge>{selectedTemplate.category.replace(/_/g, ' ')}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Complexity</h4>
                  <Badge className={complexityColors[selectedTemplate.complexity]}>
                    {selectedTemplate.complexity}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Est. Time</h4>
                  <p className="text-sm">{selectedTemplate.estimatedTime || 'N/A'} minutes</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Version</h4>
                  <p className="text-sm">{selectedTemplate.version}</p>
                </div>
              </div>

              {selectedTemplate.mitreAttack && selectedTemplate.mitreAttack.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">MITRE ATT&CK Coverage</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.mitreAttack.map((technique: string) => (
                      <Badge key={technique} variant="outline">{technique}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Author</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate.author}</p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  handleDownload(selectedTemplate.id);
                  setDetailsOpen(false);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Install Playbook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
